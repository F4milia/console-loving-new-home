# Vercel Deployment Investigation — console-loving-new-home

## Project
- Repo: `github.com/F4milia/console-loving-new-home`
- Vercel project: `console` (`prj_f1z1gEVKKs2Bkw07Wg7OmfOrRZ7h`), team `developer-4044s-projects` (`team_7oMo95R4bbGTCGfFadczU8Qk`)
- Production URL: `https://console-psi-ten.vercel.app/` (custom domain, exempt from Vercel SSO/deployment protection)
- App: Express backend (`backend/`) — match engine + facility API, Postgres-backed (Neon). No frontend is deployed to Vercel; `frontend/design_system` is a separate static prototype served locally only.
- Vercel project settings (confirmed from dashboard):
  - **Root Directory: `backend`**
  - Framework Preset: **Express** (auto-detected)
  - Build Command: none (framework default) / Install Command: default
  - Node.js version: 24.x
  - Deployment Protection: Vercel Authentication (SSO) enabled, scope "all except custom domains" — so `console-psi-ten.vercel.app` bypasses SSO, but preview/branch URLs do not
  - Env vars present (Neon Postgres integration, added ~2h before this investigation started — i.e., present for the *entire* investigation, not a new variable): `POSTGRES_URL_NON_POOLING`, `DATABASE_URL_UNPOOLED`, `PGHOST`, `PGUSER`, `POSTGRES_PASSWORD`, `NEON_PROJECT_ID`, `POSTGRES_DATABASE`, `PGPASSWORD`, `POSTGRES_USER` (list may be non-exhaustive — user's dashboard view was cut off)

## Problem 1 (RESOLVED): "Invalid export" crash on every request

**Symptom:** All requests returned HTTP 500. Vercel logs showed:
```
Invalid export found in module "/var/task/backend/src/app.js".
The default export must be a function or server.
Node.js process exited with exit status: 1.
```

**Cause:** `backend/src/app.js` exported `{ createApp }` (an object) instead of the `createApp` function itself. `backend/src/server.js` destructured it correctly for local `node src/server.js` use, but Vercel's builder validates the module's own export shape and rejected the object.

**Fix applied** (PR #1, branch `vercel-bug-fix`, merged to `main`):
- `backend/src/app.js`: `module.exports = { createApp }` → `module.exports = createApp`
- `backend/src/server.js`: `const { createApp } = require('./app')` → `const createApp = require('./app')`
- Added root-level `api/index.js` (`module.exports = require('../backend/src/app')()`) and root-level `vercel.json` with a catch-all rewrite to it (legacy `@vercel/node` manual-wiring pattern)
- Also fixed the old `vercel.json`'s deprecated `builds`/`routes` config

**Result:** Build succeeded, "Invalid export" error gone. **But** every request then hung for the full 300s function timeout (see Problem 2). This was not noticed until after merging to `main` and redeploying to production, because the export error had been masking it.

## Problem 2 (STILL UNRESOLVED): every request hangs for the full 300s timeout

**Symptom:** Every route — including `/api/health`, `/`, `/favicon.ico`, and `/api/index.js` — returns **zero bytes, zero HTTP headers, for the entire 300-second function duration**, then Vercel returns 504. Confirmed via:
- Direct `curl -v` (nothing at all comes back — not even response headers — until curl's own timeout or the platform's)
- Vercel's own runtime error aggregation: `Vercel Runtime Timeout Error: Task timed out after 300 seconds`, recorded for every deployment tested so far
- Vercel's authenticated fetch tool (bypasses SSO) — also timed out
- The user's own authenticated browser (bypasses SSO) — also hangs, confirmed twice

**What has been ruled out**, in the order tested:

1. **Routing conflict between manual wiring and native Express detection.**
   Hypothesis: the root `api/index.js` + `vercel.json` rewrite (old `@vercel/node` pattern) was conflicting with Vercel's native "capture the Express app via its own `.listen()` call" mechanism (confirmed real via Vercel docs: https://vercel.com/docs/functions/runtimes/node-js — this project auto-detected `"framework": "express"`).
   **Test:** Removed `api/index.js` and `vercel.json` entirely (PR #2, branch `vercel-native-express`), left only `backend/src/server.js` calling `app.listen()`.
   **Result:** Identical hang, on a fresh preview deployment. **Ruled out** — confirmed via `get_runtime_errors`, which recorded a fresh timeout against the new deployment ID at the exact time the user tested it.

2. **Root Directory mismatch** (i.e., suspecting Vercel was building from repo root, where there's no `package.json`, while the app actually lives in `backend/`).
   **Test:** Asked user to check dashboard directly.
   **Result:** Root Directory is correctly set to `backend`. **Ruled out** as a misconfiguration — settings match what the app needs. (This also means the root-level `api/index.js`/`vercel.json` from PR #1 were likely never even read by Vercel in the first place, since Root Directory was already `backend` before PR #1 — they were probably always inert, not actually the mechanism that caused Problem 1's fix to "work." Problem 1's fix likely worked because of the `app.js` export correction alone, which server.js also depends on for the native capture path.)

3. **Missing/misconfigured `DATABASE_URL`** causing a hung Postgres connection attempt.
   Hypothesis: `pg.Pool`'s default `connectionTimeoutMillis` is 0 (no timeout), so a blocked/unreachable TCP path to a DB host could hang forever.
   **Test/reasoning:** `/api/health` and bare `/` touch zero database code (no query, and the route doesn't exist so Express's routing never reaches `facilities.store.js`'s logic beyond the top-level `require()`, which only constructs a `Pool` object — doesn't connect). These routes hang identically to DB-backed routes. Also confirmed via timeline: the Neon integration predates the *very first* hang observation, so it's not a newly-introduced variable. **Ruled out** as the primary cause, though it's still an untested latent risk for the DB-touching routes specifically (`/api/match`, `/api/facilities`) — worth adding `connectionTimeoutMillis` defensively regardless.

4. **Express 5 incompatibility with Vercel's native `.listen()`-capture bridging.**
   Hypothesis: Express 5 changed internal request/response handling; Vercel's native Express support might not be validated against it.
   **Test:** Downgraded `backend/package.json` from `express: ^5.2.1` to `express: ^4.19.2`, reinstalled, verified locally (server boots, `/api/health` and `/api/facilities` respond correctly, all 15 tests pass), pushed to the same branch, new preview deployment built successfully.
   **Result:** User tested both `/` and `/api/health` on the Express-4 preview — **identical hang, both routes.** **Ruled out.**

**What has NOT been tested / possible remaining leads:**

- **Stale/corrupted build cache.** Every deployment tested so far has been a normal git-triggered build, which Vercel may selectively reuse cached layers for ("Restored build cache from previous deployment..." appeared in build logs, referencing the very first, fundamentally-broken deployment). Have not yet tried a "Redeploy" with "Use existing Build Cache" explicitly unchecked, which requires dashboard access (no MCP tool exposes this action).
- **A minimal bare-Express bisection test** was attempted via `deploy_to_vercel` (creates a brand-new throwaway project) to check whether *any* Express app on this Vercel account/team hangs, isolating platform/account-level causes from this-repo-specific causes. The throwaway project deployed successfully but landed in a different account scope than the team's `console` project, so its settings (deployment protection, etc.) couldn't be managed or queried through the same tools, and it remained behind the same SSO wall with no way to bypass it as an unauthenticated client. **Inconclusive — not a real test of the hypothesis, just blocked by tooling.** Worth revisiting: either disable protection on that throwaway project (need to find its correct scope/teamId) or ask the user to check it directly.
- **Something specific to how this particular project was originally created.** The very first deployment's metadata included `"importSource": "import-candidates"` — this project was created via some automated/templated import flow, not a plain `vercel` CLI link or manual dashboard import. This is a loose end — never confirmed whether that import flow left any non-standard, hidden project configuration (e.g., a Build Output API override, unusual function config, etc.) that isn't visible in the dashboard fields checked so far.
- **Vercel platform-side incident or account-specific issue**, e.g. something wrong with how this specific team/account's functions are provisioned, unrelated to any code or setting we can see. Not tested; would require Vercel support or a completely fresh project in a *known-good* scope to confirm.
- Have not yet tried simplifying `backend/src/server.js` itself down to a **bare `http.createServer` "hello world"** (no Express at all) deployed with Root Directory `backend` — this would test whether Express (any version) is involved at all, vs. something about this Node process/runtime generally.

## Current repo state

- `main`: has the Problem 1 fix merged (PR #1, commit `0ccca50`). Still has the 300s hang in production (`console-psi-ten.vercel.app` is currently broken).
- `vercel-native-express` (PR #2, open, **not yet merged**): has Problem 1's fix, removes the root `api/index.js`/`vercel.json`, and downgrades Express 5→4. Confirmed via preview deployment that the hang persists identically. **Do not merge yet** — it doesn't fix the live issue, and merging would not make production worse but also would not make it better.
- Latest preview deployment tested: `dpl_F6qkMPPA5mqgKRwPPFVcKuV1JBE5` (Express 4, no manual wiring), branch `vercel-native-express`, commit `6408c0d`.

## Useful commands / IDs for continuing this investigation

```
Project ID: prj_f1z1gEVKKs2Bkw07Wg7OmfOrRZ7h
Team ID:    team_7oMo95R4bbGTCGfFadczU8Qk
Production custom domain (SSO-exempt): https://console-psi-ten.vercel.app/
PR #1 (merged): https://github.com/F4milia/console-loving-new-home/pull/1
PR #2 (open):   https://github.com/F4milia/console-loving-new-home/pull/2
```

Via the Vercel MCP tools (`mcp__plugin_vercel_vercel__*`):
- `get_runtime_errors` — fastest way to check if a given deployment is still hanging (look for `Vercel Runtime Timeout Error: Task timed out after 300 seconds`, and check `lastDeployment` matches what you just deployed)
- `get_deployment_build_logs` — build logs are short and unremarkable in every attempt so far (no errors, ~3s build, cache restored each time)
- `list_deployments` / `get_deployment` — deployment metadata, git commit info, alias/target info
- Note: `web_fetch_vercel_url` (meant to bypass SSO) has **not worked** in this investigation — it either times out or returns "Unable to create shareable URL." Testing preview/branch URLs currently requires the user's own authenticated browser.

## Recommended next steps (not yet attempted)

1. Ask user to trigger a **dashboard "Redeploy" with "Use existing Build Cache" unchecked** on the current `vercel-native-express` preview or on `main`, to rule out cache corruption.
2. Try a **bare `http.createServer` "hello world"** with no Express, no Postgres, no other dependencies, Root Directory `backend`, to isolate whether Express itself (any version) is involved.
3. If that also hangs: escalate to Vercel support with this document, since it would point to a platform/account/project-level issue outside what's inspectable via the dashboard or these API tools.
4. If that resolves it: reintroduce Express (version already narrowed to "either" since both 4 and 5 hang identically) and bisect what specifically in `app.js`'s route/middleware setup triggers it.
