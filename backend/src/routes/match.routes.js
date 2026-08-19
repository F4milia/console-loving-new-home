const express = require('express');
const store = require('../data/facilities.store');
const { evaluateAll, listRequirements } = require('../services/matchEngine');

const router = express.Router();

// GET /api/match/requirements — the toggle definitions (label + shortcut key)
// so the frontend never has to hardcode them either.
router.get('/requirements', (req, res) => {
  res.json({ requirements: listRequirements() });
});

/**
 * POST /api/match
 * Body: { requirements: { W: true, T: true, I: true, M: false }, budget: 4800 }
 * Returns the four fixed groups in fixed order: match, confirm, unknown, excluded.
 */
router.post('/', async (req, res) => {
  const { requirements = {}, budget = null } = req.body || {};

  if (requirements && typeof requirements !== 'object') {
    return res.status(400).json({ error: 'requirements must be an object of { KEY: boolean }' });
  }
  if (budget !== null && budget !== undefined && Number.isNaN(Number(budget))) {
    return res.status(400).json({ error: 'budget must be a number' });
  }

  const facilities = await store.list();
  const groups = evaluateAll(facilities, { requirements, budget });

  res.json({
    query: { requirements, budget: budget === null || budget === undefined ? null : Number(budget) },
    counts: {
      match: groups.match.length,
      confirm: groups.confirm.length,
      unknown: groups.unknown.length,
      excluded: groups.excluded.length,
    },
    groups,
  });
});

module.exports = router;
