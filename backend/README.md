# LovingNewHome Console — Backend (business logic only, no SQL/Airtable yet)

This implements the **match engine and API surface** described in the design
handoff (`design_handoff_console/README.md`), against an **in-memory store**
standing in for the eventual Airtable-backed store. No database or SQL is
wired up — that's intentionally deferred. The seams are drawn so the swap is
mechanical: replace `src/data/facilities.store.js` internals with real
Airtable calls and nothing else in the codebase needs to change.

## Why it's structured this way

The product's stated moat is **data freshness, not features** — so the
backend's job is narrow and specific:
1. Evaluate a facility against a spoken patient description in real time.
2. Never let missing data masquerade as a "yes".
3. Always name the *specific* thing that's missing or failing.
4. Track staleness per field, not per record.

`src/services/matchEngine.js` is the heart of it — everything else (routes,
store, staleness/completeness utils) exists to feed it or expose its output.

## Run it

```bash
npm install
npm start           # serves on :3001 (PORT env var to override)
npm test            # node's built-in test runner, no extra deps
```

## Layout

```
src/
  data/
    facilities.store.js       in-memory "Airtable" — list/getById/updateField/insert
    requirements.registry.js  requirement toggle -> facility field mapping (extensible)
  utils/
    staleness.js               mirrors StaleStamp.jsx's day-based math exactly
    completeness.js             populated/total field count ("18/18")
  services/
    matchEngine.js             the four-state decision logic + reasoning text
    facilityService.js         detail view, sortable list, weekly openings text
  routes/
    match.routes.js            POST /api/match, GET /api/match/requirements
    facilities.routes.js       facility list/detail/weekly-openings/field updates
  app.js / server.js
```

## API

### `POST /api/match`
Body:
```json
{ "requirements": { "W": true, "T": true, "I": true, "M": false }, "budget": 4800 }
```
Response: facilities grouped into the four fixed, ordered buckets —
`match`, `confirm`, `unknown`, `excluded` — each entry carrying `state`,
`reasoning`, `confirmItem` (only set for `confirm`), `figures` (the plate's
chip line), and `completeness`.

Precedence, checked in order (see doc comment in `matchEngine.js` for the
full rationale): **unknown** (nothing relevant on record) → **excluded**
(confirmed hard fail — 0 beds, over budget, confirmed "no" on a
requirement) → **confirm** (fits everything known, but something needed is
unconfirmed) → **match**.

### `GET /api/match/requirements`
Returns the requirement toggle definitions (label, shortcut key, backing
field) so the frontend doesn't hardcode them either — add a new requirement
by only editing `requirements.registry.js`.

### `GET /api/facilities?sortKey=&sortDir=`
Sortable by any tracked field (`name`, `county`, `completeness`,
`lastConfirmed`, ...) — not limited to the four columns in the prototype.

### `GET /api/facilities/:id`
Facility detail: one row per tracked field, each with its **own**
`staleness` object (or `null` if never confirmed) — never a page-level
timestamp.

### `PATCH /api/facilities/:id/fields/:fieldKey`
Body: `{ "value": true, "confirmedAt": "2026-08-19" }` (`confirmedAt`
optional, defaults to now). This is the write path an advisor hits after
confirming a fact on a call — in production this becomes an Airtable PATCH.
Frontend can use the freshly-stamped `confirmedAt` to trigger the one
permitted animation (`lnh-stamp-land`).

### `GET /api/facilities/weekly-openings`
Copy-pasteable text block of facilities with confirmed open beds, plus a
count. Real version's date-range picker can filter server-side later;
today it returns "currently known open beds", matching the prototype.

## Deliberately NOT in this bundle
Per the handoff doc's scope and this task's ask: no SQL/Airtable client, no
auth, no deployment config, no frontend wiring. The route/service split
above is meant to make adding those layers additive, not a rewrite.
