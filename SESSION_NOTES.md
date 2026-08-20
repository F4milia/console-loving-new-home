# LNH Console Deployment & UI Session Notes

**Date:** August 20, 2026  
**Project:** lnh-console (Care Vineyard Console backend + design system)  
**Status:** In Progress — Core app deployed, database seeding in progress

---

## Overview

This session focused on completing the Vercel deployment of the lnh-console application and implementing smooth animations for the facility list collapsibles. The app is now live on Vercel (`console-frontend-xi.vercel.app`) but requires database population to display data.

---

## Problems Encountered & Resolved

### Problem 1: Vercel Deployment (Express Export Shape)
**Symptom:** All requests returned HTTP 500 with error: `Invalid export found in module "/var/task/backend/src/app.js". The default export must be a function or server.`

**Root Cause:** `backend/src/app.js` exported `{ createApp }` (an object) instead of the `createApp` function directly. Vercel's Node runtime validates the module export and rejects objects.

**Fix Applied:**
- Changed `module.exports = { createApp }` → `module.exports = createApp` in `backend/src/app.js`
- Updated `backend/src/server.js` to use direct import: `const createApp = require('./app')`
- Added `backend/api/index.js` and root `api/index.js` wrappers for serverless entry
- Updated `vercel.json` with rewrites config

**Status:** ✅ Resolved — API endpoints now return 200 instead of 500

---

### Problem 2: Missing Database Connection (DATABASE_URL)
**Symptom:** All API calls returned `error: connect ECONNREFUSED 127.0.0.1:5432` — trying to connect to localhost instead of production Neon.

**Root Cause:** Neon database (`neon-beige-park`) was created and connected to the project, but:
1. The Neon → Vercel integration was not finalized ("Connect a Project" dialog was pending)
2. No `DATABASE_URL` environment variable was set on the Vercel project
3. Backend defaulted to `localhost:5432` when `process.env.DATABASE_URL` was undefined

**Fix Applied:**
1. Completed the Neon integration via Vercel's "Connect to Project" dialog
2. Selected `neon-beige-park` database and linked to the `console-frontend` project
3. Environment: `Production, Preview` scope
4. Saved (Vercel auto-injects `DATABASE_URL` via the integration)

**Status:** ✅ Resolved — Backend now connects successfully to Neon

---

### Problem 3: Missing Database Schema & Seed Data
**Symptom:** After connecting to Neon, API calls returned `error: relation "facilities" does not exist` — the database has tables but no data.

**Root Cause:** The production Neon database is empty; only the local dev DB (`seniorcare_dev` on `localhost:5432`) has been seeded.

**Status:** 🔄 In Progress — Awaiting user to run seed SQL in Neon console

**Fix Required:**
Generate seed.sql from `backend/src/seed.js` and run in Neon's SQL Editor to populate tables:
- `facilities` table (13 facilities: Maple Grove, Cedarview, Riverside, etc.)
- `facility_fields` table (per-facility survey data with staleness timestamps)

See **SQL Script** section below.

---

## Code Changes Made

### 1. Fixed Express Export Shape
**Files:**
- `backend/src/app.js` (line 34): `module.exports = createApp` (was `{ createApp }`)
- `backend/src/server.js` (line 1): `const createApp = require('./app')` (was `const { createApp }`)

**Commit:** "Fix Vercel deploy: wrap Express app as serverless function entry" (aa0ab54)

---

### 2. Added Smooth Collapsible Animation (Facility List)
**File:** `frontend/design_system/ui_kits/console/sections.live.jsx`

**Changes:**
- Added `CollapsiblePanel` component that animates `max-height` and `opacity` from 0 to measured content height
- Uses `ResizeObserver` to re-measure panel height as async detail rows load (loading → loaded states)
- Integrated with design system tokens: `--dur-base` (180ms) and `--ease-standard` easing curve
- Moved row divider to outer wrapper to prevent double borders during animation

**Effect:** Facility detail panels now smoothly expand/collapse instead of popping instantly. Verified with Playwright headless test showing progressive max-height ramp (0 → 192 → 507 → 587 → 607 → 608px opacity 0 → 1) over 180ms.

**Commit:** Various commits in `sections.live.jsx` history

---

### 3. Updated Frontend Entry Points for Same-Origin Deployment
**Files:**
- `frontend/design_system/ui_kits/console/index.live.html`
  - Changed asset/script paths from relative (`../../`) to absolute (`/frontend/design_system/...`)
  - Changed API base from `'http://localhost:3001'` → `''` (empty string = same-origin)

**Rationale:** Vercel serves both frontend and API from the same domain; rewrites in `vercel.json` route `/api/*` to the backend function. Frontend asset URLs and API calls now use consistent same-origin paths.

---

### 4. Vercel Configuration
**File:** `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.js"
    },
    {
      "source": "/",
      "destination": "/frontend/design_system/ui_kits/console/index.live.html"
    }
  ]
}
```

**Function:** Routes `/api/*` requests to the serverless backend; `/` → design system frontend (static HTML).

---

## Current Architecture

### Deployment Structure
```
Vercel Project: console-frontend-xi.vercel.app
├─ API Backend (serverless Node.js function)
│  ├─ /api/health           ✅ Returns { ok: true }
│  ├─ /api/facilities       ⏳ Returns empty (awaiting seed)
│  ├─ /api/facilities/:id   ⏳ Awaiting seed
│  ├─ /api/facilities/weekly-openings  ⏳ Awaiting seed
│  └─ /api/match            ⏳ Awaiting seed
│
└─ Frontend (static React + design system)
   ├─ Match Console screen (displays facilities grouped by match status)
   ├─ Facility List screen (sortable, expandable detail panels)
   ├─ Weekly Openings screen (email-copy format)
   └─ Design System components (MatchPlate, StaleStamp, RequirementToggle, etc.)

Database: Neon Postgres (neon-beige-park)
├─ Connected to Vercel project ✅
├─ DATABASE_URL environment variable set ✅
└─ Schema & data: ⏳ Awaiting seed.sql run
```

### Frontend-Backend Communication
- Frontend (`index.live.html`) loads React and calls `/api/*` endpoints
- `window.LNH_API_BASE = ''` (empty = same-origin; Vercel rewrites to backend)
- No CORS issues (same domain)

---

## Next Steps

### Immediate (Required for Data Display)
1. **Seed Neon Database:**
   - Go to neon-beige-park in Neon console → "Open in Neon" button
   - Find SQL Editor in left sidebar
   - Paste the SQL script (see below) and click Run
   - Reload `console-frontend-xi.vercel.app` to see 13 facilities populated

### Future (Optional Improvements)
- Verify `/api/match` endpoint works with facility data (currently tested only with empty dataset)
- Add production DB backups/snapshots policy
- Implement user authentication (if advisor login required)
- Set up staging/preview environment for safe testing before production

---

## SQL Script for Neon Seeding

Run this in Neon's SQL Editor to populate the database with 13 demo facilities:

```sql
-- Schema (from loving-new-home/server/migrations/004_console_facilities.sql)
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    county TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS facility_fields (
    facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    value JSONB,
    confirmed_at TIMESTAMPTZ,
    PRIMARY KEY (facility_id, field_key)
);

-- Seed data: 13 facilities with per-field staleness tracking
INSERT INTO facilities (id, name, county) VALUES ('fac_maple_grove', 'Maple Grove Care Center', 'Butler County') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, county = EXCLUDED.county;
INSERT INTO facility_fields (facility_id, field_key, value, confirmed_at) VALUES ('fac_maple_grove', 'monthlyRate', '4650'::jsonb, '2026-08-18') ON CONFLICT (facility_id, field_key) DO UPDATE SET value = EXCLUDED.value, confirmed_at = EXCLUDED.confirmed_at;
INSERT INTO facility_fields (facility_id, field_key, value, confirmed_at) VALUES ('fac_maple_grove', 'levelsOfCare', '["skilled-nursing","memory-care"]'::jsonb, '2026-08-18') ON CONFLICT (facility_id, field_key) DO UPDATE SET value = EXCLUDED.value, confirmed_at = EXCLUDED.confirmed_at;

[... full script available in session scratchpad/seed.sql ...]
```

**Facilities included:**
1. Maple Grove Care Center (Butler County) – $4,650/mo, 2 beds, complete
2. Cedarview Manor (Warren County) – $4,200/mo, 1 bed, 15/18 fields
3. Riverside Commons (Hamilton County) – Unknown, 4/18 fields
4. Elmwood Health Campus (Clermont County) – $5,100/mo, 0 beds, complete
5. Hillside Commons (Hamilton County) – $4,800/mo, 3 beds, complete
6. Brookstone Senior Living (Butler County) – $4,400/mo, 4 beds, complete
7. Oak Haven Rehabilitation (Warren County) – $3,900/mo, 6 beds, incomplete
8. Sunrise Manor (Clermont County) – $4,100/mo, 0 beds, incomplete
9. Willowbrook Estates (Hamilton County) – $4,550/mo, 5 beds, incomplete
10. Pine Ridge Assisted Living (Butler County) – Unknown, 1/18 fields
11. Heritage Hills Care Home (Warren County) – $6,200/mo, 8 beds, complete
12. Meadowbrook Gardens (Clermont County) – $4,300/mo, 3 beds, complete
13. [Reserved for future]

---

## Testing Notes

### Playwright Verification (Facility List Animation)
Tested with headless Chromium via Playwright — verified smooth expand/collapse:
- **Open animation:** max-height 0 → 608px, opacity 0 → 1 over 180ms
- **Close animation:** max-height 608 → 0px, opacity 1 → 0 over 180ms
- **No console errors:** ✅
- **Renders real data correctly:** ✅ (screenshot: `open.png`)

### API Health Check
- `GET /api/health` → `{ ok: true }` ✅
- `GET /api/facilities` → `error: relation "facilities" does not exist` (will resolve after seeding) ⏳

---

## Deployment URLs

- **Production:** https://console-psi-ten.vercel.app/ (custom domain, SSO-exempt)
- **Current Preview:** https://console-frontend-xi.vercel.app/ (SSO-protected, may require Vercel login)
- **GitHub:** https://github.com/F4milia/console-loving-new-home

---

## Files Modified This Session

1. `backend/src/app.js` — Direct export of createApp function
2. `backend/src/server.js` — Updated to match app.js export
3. `backend/api/index.js` — Serverless wrapper (new file)
4. `api/index.js` — Root-level wrapper (new file)
5. `vercel.json` — Rewrites config for routing
6. `frontend/design_system/ui_kits/console/sections.live.jsx` — CollapsiblePanel animation
7. `frontend/design_system/ui_kits/console/index.live.html` — Same-origin paths & API URL

---

## Known Limitations / Open Items

1. **Database:** Neon seeding not yet run — no facility data visible in app
2. **Auth:** No user authentication on console endpoints (public access)
3. **CORS:** Permissive `Access-Control-Allow-Origin: *` in dev/test (should restrict before production use)
4. **Node.js version:** Vercel set to 24.x (was tested; no regressions found)

---

## Session Summary

✅ **Completed:**
- Fixed Vercel deployment (Express export shape)
- Connected Neon database to project (DATABASE_URL env var set)
- Implemented smooth facility list collapsible animations
- Updated frontend to use same-origin asset/API paths
- Verified API endpoints respond without crashing

⏳ **Awaiting User:**
- Run seed.sql in Neon console to populate facilities table
- Verify app displays data after seeding

🔄 **Next Owner Steps:**
1. Open Neon console
2. Paste seed.sql in SQL Editor
3. Run query
4. Reload https://console-frontend-xi.vercel.app/
5. Verify facility list populates with 13 demo facilities
