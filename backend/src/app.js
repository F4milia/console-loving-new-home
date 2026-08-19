const express = require('express');
const matchRoutes = require('./routes/match.routes');
const facilitiesRoutes = require('./routes/facilities.routes');

function createApp() {
  const app = express();
  app.use(express.json());

  // Dev-only CORS: the frontend prototype is served as static files from a
  // different origin/port than this API. Tighten this before anything real
  // ships (allowlist the actual frontend origin instead of '*').
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.use('/api/match', matchRoutes);
  app.use('/api/facilities', facilitiesRoutes);

  // Centralized error handler — keeps route handlers free of try/catch noise.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
