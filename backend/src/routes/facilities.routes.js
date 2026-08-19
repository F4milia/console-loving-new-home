const express = require('express');
const store = require('../data/facilities.store');
const facilityService = require('../services/facilityService');

const router = express.Router();

// GET /api/facilities?sortKey=completeness&sortDir=desc
router.get('/', async (req, res) => {
  const { sortKey, sortDir } = req.query;
  const rows = await facilityService.listFacilities({ sortKey, sortDir });
  res.json({ rows });
});

// GET /api/facilities/weekly-openings
// NOTE: registered before "/:id" so it isn't swallowed by the param route.
router.get('/weekly-openings', async (req, res) => {
  const result = await facilityService.getWeeklyOpenings();
  res.json(result);
});

// GET /api/facilities/:id  — facility detail, one row per field with its own StaleStamp data
router.get('/:id', async (req, res) => {
  const detail = await facilityService.getFacilityDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Facility not found' });
  res.json(detail);
});

// PATCH /api/facilities/:id/fields/:fieldKey  Body: { value: any, confirmedAt?: string }
// Mock write path — this is where the real Airtable PATCH call goes later.
// Advisors use this after confirming a fact on the phone (drives the
// "stamp landing" animation client-side when confirmedAt becomes ~now).
router.patch('/:id/fields/:fieldKey', async (req, res) => {
  const { value, confirmedAt } = req.body || {};
  try {
    const facility = await store.updateField(req.params.id, req.params.fieldKey, value, confirmedAt);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    const detail = await facilityService.getFacilityDetail(facility.id);
    res.json(detail);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/facilities — add a facility record (survey intake)
router.post('/', async (req, res) => {
  const { name, county } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const facility = await store.insert({ name, county });
  res.status(201).json(await facilityService.getFacilityDetail(facility.id));
});

module.exports = router;
