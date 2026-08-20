/**
 * Seeds the shared Postgres database with the console's original demo
 * fixture data (same 13 facilities the in-memory store used to hardcode),
 * so the match engine's documented demo scenarios (budget exclusions,
 * unconfirmed fields, etc. — see README-integration.md) still work.
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function field(value, confirmedAt) {
  return { value, confirmedAt: confirmedAt || null };
}

const facilities = [
  {
    id: 'fac_maple_grove',
    name: 'Maple Grove Care Center',
    county: 'Butler County',
    fields: {
      monthlyRate: field(4650, '2026-08-18'),
      levelsOfCare: field(['skilled-nursing', 'memory-care'], '2026-08-18'),
      transferAssistance: field('two-person', '2026-08-18'),
      twoPersonTransfer: field(true, '2026-08-18'),
      insulinManagement: field(true, '2026-08-10'),
      medicaidWaiver: field(false, '2026-07-20'),
      bedsTotal: field(82, '2026-08-18'),
      bedsOpen: field(2, '2026-08-18'),
      admissionsContact: field('Dana R., Admissions', '2026-08-18'),
      lastSiteVisit: field('2026-07-14', '2026-07-14'),
      wanderGuard: field(true, '2026-08-18'),
      memoryCareUnit: field(true, '2026-08-18'),
      telephone: field('(513) 555-0101', '2026-08-18'),
    },
  },
  {
    id: 'fac_cedarview',
    name: 'Cedarview Manor',
    county: 'Warren County',
    fields: {
      monthlyRate: field(4200, '2026-08-02'),
      levelsOfCare: field(['memory-care'], '2026-08-02'),
      transferAssistance: field(null, null),
      twoPersonTransfer: field(null, null),
      insulinManagement: field(true, '2026-08-02'),
      medicaidWaiver: field(false, '2026-07-01'),
      bedsTotal: field(40, '2026-08-02'),
      bedsOpen: field(1, '2026-08-02'),
      admissionsContact: field('Front desk', '2026-08-02'),
      lastSiteVisit: field(null, null),
      wanderGuard: field(true, '2026-08-02'),
      memoryCareUnit: field(true, '2026-08-02'),
      telephone: field('(513) 555-0102', '2026-08-02'),
    },
  },
  {
    id: 'fac_riverside',
    name: 'Riverside Commons',
    county: 'Hamilton County',
    fields: {
      monthlyRate: field(null, null),
      levelsOfCare: field(null, null),
      transferAssistance: field(null, null),
      twoPersonTransfer: field(null, null),
      insulinManagement: field(null, null),
      medicaidWaiver: field(null, null),
      bedsTotal: field(null, null),
      bedsOpen: field(null, null),
      admissionsContact: field(null, null),
      lastSiteVisit: field(null, null),
      wanderGuard: field(null, null),
      memoryCareUnit: field(true, '2026-05-01'),
      telephone: field(null, null),
    },
  },
  {
    id: 'fac_elmwood',
    name: 'Elmwood Health Campus',
    county: 'Clermont County',
    fields: {
      monthlyRate: field(5100, '2026-06-30'),
      levelsOfCare: field(['skilled-nursing'], '2026-06-30'),
      transferAssistance: field('two-person', '2026-06-30'),
      twoPersonTransfer: field(true, '2026-06-30'),
      insulinManagement: field(true, '2026-06-30'),
      medicaidWaiver: field(false, '2026-06-30'),
      bedsTotal: field(60, '2026-06-30'),
      bedsOpen: field(0, '2026-06-30'),
      admissionsContact: field('Pat M., Admissions', '2026-06-30'),
      lastSiteVisit: field('2026-06-30', '2026-06-30'),
      wanderGuard: field(true, '2026-06-30'),
      memoryCareUnit: field(false, '2026-06-30'),
      telephone: field('(513) 555-0104', '2026-06-30'),
    },
  },
  {
    id: 'fac_hillside',
    name: 'Hillside Commons',
    county: 'Hamilton County',
    fields: {
      monthlyRate: field(4800, '2026-08-19'),
      levelsOfCare: field(['skilled-nursing', 'memory-care'], '2026-08-19'),
      transferAssistance: field('two-person', '2026-08-19'),
      twoPersonTransfer: field(true, '2026-08-19'),
      insulinManagement: field(true, '2026-08-19'),
      medicaidWaiver: field(true, '2026-08-19'),
      bedsTotal: field(55, '2026-08-19'),
      bedsOpen: field(3, '2026-08-19'),
      admissionsContact: field('Sue K., Admissions', '2026-08-19'),
      lastSiteVisit: field('2026-08-01', '2026-08-01'),
      wanderGuard: field(true, '2026-08-19'),
      memoryCareUnit: field(true, '2026-08-19'),
      telephone: field('(513) 555-0105', '2026-08-19'),
    },
  },
  {
    id: 'fac_brookstone',
    name: 'Brookstone Senior Living',
    county: 'Butler County',
    fields: {
      monthlyRate: field(4400, '2026-08-19'),
      levelsOfCare: field(['assisted-living', 'memory-care'], '2026-08-19'),
      transferAssistance: field('two-person', '2026-08-19'),
      twoPersonTransfer: field(true, '2026-08-19'),
      insulinManagement: field(true, '2026-08-15'),
      medicaidWaiver: field(true, '2026-08-01'),
      bedsTotal: field(70, '2026-08-19'),
      bedsOpen: field(4, '2026-08-19'),
      admissionsContact: field('Marcus T., Admissions', '2026-08-19'),
      lastSiteVisit: field('2026-08-10', '2026-08-10'),
      wanderGuard: field(true, '2026-08-19'),
      memoryCareUnit: field(true, '2026-08-19'),
      telephone: field('(513) 555-0106', '2026-08-19'),
    },
  },
  {
    id: 'fac_oakhaven',
    name: 'Oak Haven Rehabilitation',
    county: 'Warren County',
    fields: {
      monthlyRate: field(3900, '2026-08-05'),
      levelsOfCare: field(['skilled-nursing'], '2026-08-05'),
      transferAssistance: field('one-person', '2026-08-05'),
      twoPersonTransfer: field(false, '2026-08-05'),
      insulinManagement: field(true, '2026-08-05'),
      medicaidWaiver: field(true, '2026-07-15'),
      bedsTotal: field(50, '2026-08-05'),
      bedsOpen: field(6, '2026-08-05'),
      admissionsContact: field('Renee L., Admissions', '2026-08-05'),
      lastSiteVisit: field('2026-07-28', '2026-07-28'),
      wanderGuard: field(false, '2026-08-05'),
      memoryCareUnit: field(false, '2026-08-05'),
      telephone: field('(513) 555-0107', '2026-08-05'),
    },
  },
  {
    id: 'fac_sunrise_manor',
    name: 'Sunrise Manor',
    county: 'Clermont County',
    fields: {
      monthlyRate: field(4100, '2026-08-12'),
      levelsOfCare: field(['assisted-living'], '2026-08-12'),
      transferAssistance: field('two-person', '2026-08-12'),
      twoPersonTransfer: field(true, '2026-08-12'),
      insulinManagement: field(true, '2026-08-12'),
      medicaidWaiver: field(false, '2026-07-30'),
      bedsTotal: field(45, '2026-08-12'),
      bedsOpen: field(0, '2026-08-12'),
      admissionsContact: field('Front desk', '2026-08-12'),
      lastSiteVisit: field('2026-08-01', '2026-08-01'),
      wanderGuard: field(true, '2026-08-12'),
      memoryCareUnit: field(true, '2026-08-12'),
      telephone: field('(513) 555-0108', '2026-08-12'),
    },
  },
  {
    id: 'fac_willowbrook',
    name: 'Willowbrook Estates',
    county: 'Hamilton County',
    fields: {
      monthlyRate: field(4550, '2026-08-16'),
      levelsOfCare: field(['assisted-living', 'memory-care'], '2026-08-16'),
      transferAssistance: field('two-person', '2026-08-16'),
      twoPersonTransfer: field(true, '2026-08-16'),
      insulinManagement: field(null, null),
      medicaidWaiver: field(false, '2026-08-01'),
      bedsTotal: field(65, '2026-08-16'),
      bedsOpen: field(5, '2026-08-16'),
      admissionsContact: field('Karen B., Admissions', '2026-08-16'),
      lastSiteVisit: field('2026-08-05', '2026-08-05'),
      wanderGuard: field(true, '2026-08-16'),
      memoryCareUnit: field(true, '2026-08-16'),
      telephone: field('(513) 555-0109', '2026-08-16'),
    },
  },
  {
    id: 'fac_pine_ridge',
    name: 'Pine Ridge Assisted Living',
    county: 'Butler County',
    fields: {
      monthlyRate: field(null, null),
      levelsOfCare: field(null, null),
      transferAssistance: field(null, null),
      twoPersonTransfer: field(null, null),
      insulinManagement: field(null, null),
      medicaidWaiver: field(null, null),
      bedsTotal: field(null, null),
      bedsOpen: field(null, null),
      admissionsContact: field(null, null),
      lastSiteVisit: field(null, null),
      wanderGuard: field(null, null),
      memoryCareUnit: field(false, '2026-04-10'),
      telephone: field(null, null),
    },
  },
  {
    id: 'fac_heritage_hills',
    name: 'Heritage Hills Care Home',
    county: 'Warren County',
    fields: {
      monthlyRate: field(6200, '2026-08-14'),
      levelsOfCare: field(['skilled-nursing', 'memory-care'], '2026-08-14'),
      transferAssistance: field('two-person', '2026-08-14'),
      twoPersonTransfer: field(true, '2026-08-14'),
      insulinManagement: field(true, '2026-08-14'),
      medicaidWaiver: field(false, '2026-08-14'),
      bedsTotal: field(90, '2026-08-14'),
      bedsOpen: field(8, '2026-08-14'),
      admissionsContact: field('Diane W., Admissions', '2026-08-14'),
      lastSiteVisit: field('2026-08-14', '2026-08-14'),
      wanderGuard: field(true, '2026-08-14'),
      memoryCareUnit: field(true, '2026-08-14'),
      telephone: field('(513) 555-0111', '2026-08-14'),
    },
  },
  {
    id: 'fac_meadowbrook',
    name: 'Meadowbrook Gardens',
    county: 'Clermont County',
    fields: {
      monthlyRate: field(4300, '2026-07-01'),
      levelsOfCare: field(['assisted-living'], '2026-07-01'),
      transferAssistance: field('two-person', '2026-07-01'),
      twoPersonTransfer: field(true, '2026-07-01'),
      insulinManagement: field(true, '2026-07-01'),
      medicaidWaiver: field(true, '2026-06-15'),
      bedsTotal: field(58, '2026-07-01'),
      bedsOpen: field(3, '2026-07-01'),
      admissionsContact: field('Tom H., Admissions', '2026-07-01'),
      lastSiteVisit: field('2026-06-20', '2026-06-20'),
      wanderGuard: field(true, '2026-07-01'),
      memoryCareUnit: field(false, '2026-07-01'),
      telephone: field('(513) 555-0112', '2026-07-01'),
    },
  },
];

async function seed() {
  for (const facility of facilities) {
    await pool.query(
      `INSERT INTO facilities (id, name, county) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, county = EXCLUDED.county`,
      [facility.id, facility.name, facility.county]
    );
    for (const [key, entry] of Object.entries(facility.fields)) {
      await pool.query(
        `INSERT INTO facility_fields (facility_id, field_key, value, confirmed_at)
         VALUES ($1, $2, $3::jsonb, $4)
         ON CONFLICT (facility_id, field_key)
         DO UPDATE SET value = EXCLUDED.value, confirmed_at = EXCLUDED.confirmed_at`,
        [facility.id, key, JSON.stringify(entry.value), entry.confirmedAt]
      );
    }
    console.log(`Seeded ${facility.id}`);
  }
  console.log(`Seed complete. Facilities: ${facilities.length}`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
