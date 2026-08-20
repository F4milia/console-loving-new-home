/**
 * Facility store (Postgres-backed)
 * ---------------------------------
 * Backs onto the `facilities` / `facility_fields` tables in the same
 * Postgres database as the loving-new-home directory app (see
 * server/migrations/004_console_facilities.sql there). Keeps the exact same
 * async API the in-memory version had, so matchEngine/facilityService/routes
 * never had to change.
 *
 * Field shape: { value, confirmedAt } — confirmedAt is an ISO date string
 * or null if the field has never been confirmed. `value` may be null
 * ("no data") even if confirmedAt is set to something historic — but in
 * practice a null value should just also have a null confirmedAt.
 *
 * FIELD_KEYS is the complete list of tracked per-facility fields, used to
 * compute survey completeness (e.g. "18/18"). Keep this in sync with any
 * field added to a facility record.
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error', err);
});

const FIELD_KEYS = [
  'monthlyRate',
  'levelsOfCare',
  'transferAssistance',
  'twoPersonTransfer',
  'insulinManagement',
  'medicaidWaiver',
  'bedsTotal',
  'bedsOpen',
  'admissionsContact',
  'lastSiteVisit',
  'wanderGuard',
  'memoryCareUnit',
  'telephone',
];

function shapeFacility(facilityRow, fieldRows) {
  const fields = {};
  for (const key of FIELD_KEYS) fields[key] = { value: null, confirmedAt: null };
  for (const fr of fieldRows) {
    fields[fr.field_key] = {
      value: fr.value,
      confirmedAt: fr.confirmed_at ? fr.confirmed_at.toISOString() : null,
    };
  }
  return { id: facilityRow.id, name: facilityRow.name, county: facilityRow.county, fields };
}

async function list() {
  const { rows: facilityRows } = await pool.query('SELECT id, name, county FROM facilities ORDER BY name');
  const { rows: fieldRows } = await pool.query('SELECT facility_id, field_key, value, confirmed_at FROM facility_fields');

  const fieldsByFacility = new Map();
  for (const fr of fieldRows) {
    if (!fieldsByFacility.has(fr.facility_id)) fieldsByFacility.set(fr.facility_id, []);
    fieldsByFacility.get(fr.facility_id).push(fr);
  }

  return facilityRows.map((row) => shapeFacility(row, fieldsByFacility.get(row.id) || []));
}

async function getById(id) {
  const { rows: facilityRows } = await pool.query('SELECT id, name, county FROM facilities WHERE id = $1', [id]);
  if (facilityRows.length === 0) return null;

  const { rows: fieldRows } = await pool.query(
    'SELECT facility_id, field_key, value, confirmed_at FROM facility_fields WHERE facility_id = $1',
    [id]
  );

  return shapeFacility(facilityRows[0], fieldRows);
}

/**
 * Updates a single field's value and stamps confirmedAt = now (or a supplied
 * date, useful for tests/backfills). Mirrors the shape an Airtable PATCH
 * would eventually take.
 */
async function updateField(id, fieldKey, value, confirmedAt) {
  if (!FIELD_KEYS.includes(fieldKey)) {
    throw new Error(`Unknown field "${fieldKey}"`);
  }

  const { rows } = await pool.query('SELECT id FROM facilities WHERE id = $1', [id]);
  if (rows.length === 0) return null;

  const stamp = confirmedAt || new Date().toISOString();
  await pool.query(
    `INSERT INTO facility_fields (facility_id, field_key, value, confirmed_at)
     VALUES ($1, $2, $3::jsonb, $4)
     ON CONFLICT (facility_id, field_key)
     DO UPDATE SET value = EXCLUDED.value, confirmed_at = EXCLUDED.confirmed_at`,
    [id, fieldKey, JSON.stringify(value), stamp]
  );

  return getById(id);
}

async function insert(facility) {
  const id = facility.id || `fac_${Date.now()}`;
  await pool.query('INSERT INTO facilities (id, name, county) VALUES ($1, $2, $3)', [
    id,
    facility.name,
    facility.county || null,
  ]);

  for (const key of FIELD_KEYS) {
    const entry = facility.fields && facility.fields[key];
    if (entry && entry.value !== undefined) {
      await pool.query(
        `INSERT INTO facility_fields (facility_id, field_key, value, confirmed_at) VALUES ($1, $2, $3::jsonb, $4)`,
        [id, key, JSON.stringify(entry.value), entry.confirmedAt || null]
      );
    }
  }

  return getById(id);
}

module.exports = { FIELD_KEYS, list, getById, updateField, insert };
