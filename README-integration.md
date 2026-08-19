# Pairing the design system with the backend

## One issue first
Your handoff zip's `index.html` references `../../_ds_bundle.js`, but that
file isn't actually in the zip — only the individual component sources
under `design_system/components/*.jsx.txt` are. Without it, the original
`index.html` prototype won't run at all (blank page, console error:
`window.LovingNewHomeDesignSystem_f5372f is undefined`).

I built `_ds_bundle.js` by concatenating those component sources (they're
already plain `React.createElement` calls, no JSX, so no build step is
needed) and exposing them on the global the prototype expects.

## What's in this pack
Drop these three files into your existing `design_system/` folder, in the
same relative positions:

```
design_system/
  _ds_bundle.js                          ← new (fills the gap above)
  ui_kits/console/
    index.live.html                      ← new, live-wired entry point
    sections.live.jsx                    ← new, calls the real API
    index.html                           ← unchanged, still the offline demo
    sections.jsx                         ← unchanged, still hardcoded FACILITIES
```

Nothing in your original files is touched — `index.html`/`sections.jsx`
still work exactly as before, as a no-backend visual reference. The `.live`
files are a parallel set that hit the real API instead.

## What changed, screen by screen
`sections.live.jsx` mirrors `sections.jsx` structurally (same components,
same layout) but swaps the data source:

| Screen | Prototype (`sections.jsx`) | Live (`sections.live.jsx`) |
|---|---|---|
| Match console | Reads hardcoded `FACILITIES`, buckets client-side | `POST /api/match` on every toggle/budget change, renders the returned `groups` |
| Facility list | Sorts the hardcoded array client-side | `GET /api/facilities?sortKey=...`, with each row expandable in place (fetches `GET /api/facilities/:id` on first expand) to show its full field detail — this replaced the old standalone "Facility detail" screen, which only ever showed `FACILITIES[0]` with no way to pick another facility |
| Weekly openings | Filters hardcoded array | `GET /api/facilities/weekly-openings` |

Note: the live version's data now comes from Postgres (the same database
loving-new-home uses — see `facilities`/`facility_fields` tables), not the
in-memory store this pack originally shipped with.

I also wired up the keyboard shortcuts (W/T/I/M) with an actual `keydown`
listener — the handoff doc calls this out as non-negotiable ("used
one-handed while on a call") but the click-through prototype only wired the
buttons' visual state, not real keys.

## Running it

**1. Start the backend** (from the `lnh-console-backend` folder I gave you earlier):
```bash
npm install
npm start
# LovingNewHome console backend listening on :3001
```

**2. Serve the design system as static files** (any static server works —
opening `index.live.html` directly via `file://` will hit CORS/module
issues, so use a server):
```bash
cd design_system
python3 -m http.server 8080
# or: npx serve .
```

**3. Open** `http://localhost:8080/ui_kits/console/index.live.html`

If your backend isn't on `localhost:3001`, change the one line at the top
of `index.live.html`:
```html
<script>window.LNH_API_BASE = 'http://localhost:3001';</script>
```

## Verifying it's actually live
- Toggle a requirement chip or change the budget field — you should see a
  brief "Matching…" flash and the plates re-group. That round-trip only
  happens if it's hitting the real API (the old prototype re-grouped
  instantly and always showed the same 5 fixed facilities).
- Open browser devtools → Network tab, confirm calls to
  `localhost:3001/api/match`, `/api/facilities`, etc.
- Try a budget that excludes everyone (e.g. `1000`) — the Match/Confirm/
  Unknown sections should all empty out and Excluded should show 5.
- PATCH a field via curl and refresh Facility detail to see it reflect
  immediately (no restart needed — it's in-memory but live):
  ```bash
  curl -X PATCH localhost:3001/api/facilities/fac_cedarview/fields/twoPersonTransfer \
    -H 'Content-Type: application/json' -d '{"value": true}'
  ```

## Before this goes further
This CORS setup (`Access-Control-Allow-Origin: *` in `app.js`) is
dev-only — tighten it to your actual frontend origin before anything
resembling a real deployment. And per the original scope split, this still
has no auth and no Airtable — those come later.
