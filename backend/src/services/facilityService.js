const store = require('../data/facilities.store');
const { computeStaleness } = require('../utils/staleness');
const { computeCompleteness } = require('../utils/completeness');

/**
 * Facility detail: label/value/stamp rows, one per tracked field, each with
 * its OWN staleness (per-field confirmedAt), not a page-level timestamp.
 */
const FIELD_LABELS = {
  monthlyRate: 'Monthly rate',
  levelsOfCare: 'Levels of care',
  transferAssistance: 'Transfer assistance',
  twoPersonTransfer: 'Two-person transfer',
  insulinManagement: 'Insulin management',
  medicaidWaiver: 'Medicaid waiver',
  bedsTotal: 'Bed count (total)',
  bedsOpen: 'Bed count (open)',
  admissionsContact: 'Admissions contact',
  lastSiteVisit: 'Last site visit',
  wanderGuard: 'Wander guard',
  memoryCareUnit: 'Memory care unit',
  telephone: 'Telephone',
};

async function getFacilityDetail(id) {
  const facility = await store.getById(id);
  if (!facility) return null;

  const rows = Object.entries(facility.fields).map(([key, entry]) => ({
    field: key,
    label: FIELD_LABELS[key] || key,
    value: entry.value,
    staleness: computeStaleness(entry.confirmedAt),
  }));

  return {
    id: facility.id,
    name: facility.name,
    county: facility.county,
    completeness: computeCompleteness(facility),
    rows,
  };
}

const SORTABLE_FIELDS = {
  name: f => f.name,
  county: f => f.county,
  completeness: f => computeCompleteness(f).fraction,
  lastConfirmed: f => mostRecentConfirmedAt(f),
};

function mostRecentConfirmedAt(facility) {
  const dates = Object.values(facility.fields)
    .map(e => e.confirmedAt)
    .filter(Boolean)
    .map(d => new Date(d).getTime());
  return dates.length ? Math.max(...dates) : 0;
}

/**
 * Sortable facility list. Supports sorting by any tracked field via
 * SORTABLE_FIELDS, not just the four demoed in the prototype.
 */
async function listFacilities({ sortKey = 'name', sortDir = 'asc' } = {}) {
  const facilities = await store.list();
  const sorter = SORTABLE_FIELDS[sortKey] || SORTABLE_FIELDS.name;

  const rows = facilities
    .map(f => {
      const lastConfirmedAt = mostRecentConfirmedAt(f);
      return {
        id: f.id,
        name: f.name,
        county: f.county,
        completeness: computeCompleteness(f),
        lastConfirmed: lastConfirmedAt ? computeStaleness(new Date(lastConfirmedAt).toISOString()) : null,
      };
    })
    .sort((a, b) => {
      const av = sorter(facilities.find(f => f.id === a.id));
      const bv = sorter(facilities.find(f => f.id === b.id));
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  return rows;
}

/**
 * Weekly openings: copy-pasteable list of facilities with at least one
 * confirmed open bed. `asOfWeekStart`/`asOfWeekEnd` are accepted for the
 * real version's date-range picker but default to "all facilities with
 * currently-known open beds" if omitted, matching the prototype's behavior.
 */
async function getWeeklyOpenings() {
  const facilities = await store.list();
  const open = facilities.filter(f => f.fields.bedsOpen.value && f.fields.bedsOpen.value > 0);

  const lines = open.map(f => {
    const beds = f.fields.bedsOpen.value;
    const rate = f.fields.monthlyRate.value != null ? `$${f.fields.monthlyRate.value.toLocaleString()}/mo` : '—';
    const date = f.fields.bedsOpen.confirmedAt ? f.fields.bedsOpen.confirmedAt.slice(0, 10) : '—';
    return `${f.name} — ${beds} bed${beds > 1 ? 's' : ''} open — ${rate} — as of ${date}`;
  });

  return { text: lines.join('\n'), count: open.length };
}

module.exports = { getFacilityDetail, listFacilities, getWeeklyOpenings, FIELD_LABELS };
