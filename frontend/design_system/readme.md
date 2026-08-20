# Care Vineyard Design System

## Company & context
Care Vineyard is a senior-living placement guide serving Hamilton, Butler, Warren, and Clermont counties (Cincinnati-area Ohio). It helps hospital/nursing-home social workers, discharge planners, elder-law attorneys, and adult children (40s–60s) evaluate care options for an aging relative.

The single, defining constraint: **visitors are checking whether this service is legitimate**, in about 20 seconds — not browsing. Professionals are wary of referral services that take undisclosed placement fees; families in crisis are wary of sales pressure. The entire design personality is built around disclosing the business model up front, plainly, as the most confident element on the page — not fine print.

No existing codebase, Figma file, or brand assets were attached to this project — everything here (tokens, components, the site) was authored from scratch against the brief below. There is no logo; the wordmark is set in plain type (Archivo) wherever a mark would go.

**Source brief (verbatim intent, condensed):**
- Hero = a hospital-directory board, not a headline+image: four routes in the family's own words — "She needs help at home," "She can't stay home," "Medicare days are ending," "I don't know yet."
- Signature element = the fee disclosure, set in signage type: "Facilities pay us a flat fee when someone moves in. You pay nothing. We list facilities that don't pay us."
- Must state: service area (4 counties), not paid by families, no Medicaid-waiver placements, will recommend home care over placement when appropriate.
- One phone number, one email, both large; a short contact form.
- Forbidden: stock photography, testimonial carousels, trust badges, "Get Started"/"Free Consultation"/"Learn More", numbered step markers, gradients, urgency/sales pressure.
- Mobile-first, accessible contrast, fast.

## Content fundamentals
- **Voice:** plain, declarative, short sentences. No adjectives selling the service to itself ("trusted," "compassionate," "leading"). Say what is true and let it stand: *"Facilities pay us a flat fee when someone moves in. You pay nothing."*
- **Person:** speaks as "we," addresses the reader as "you" — direct, not third-person institutional voice.
- **Casing:** sentence case everywhere except mono labels/route codes, which are set in small uppercase with letterspacing (a signage convention, not an emphasis device).
- **Structure:** the four hero routes are phrased exactly as a stressed family member would say them out loud — not clinical categories ("In-Home Care," "Skilled Nursing"). This is deliberate; it's how the copy proves it understands the visitor before selling anything.
- **No emoji, no exclamation points, no urgency language** ("today," "now," "don't wait"). Confidence comes from plainness, not enthusiasm.
- **Never** "Get Started" / "Free Consultation" / "Learn More" as CTA copy — buttons say what will literally happen: "Call (513) 555-0134," "Send."

## Visual foundations
- **Motif:** a hospital/office lobby directory board. The hero and the fee disclosure are both literal "plates" — dark, mounted, signage-like blocks with a hard offset shadow, not soft cards.
- **Color:** warm parchment neutrals (`--paper-0..2`) against a muted slate-ink plate (`--ink-0..4`, deliberately NOT near-black — a soft blue-cast charcoal); one muted gold accent (`--brass-0..2`) and a slate-teal for standard links (`--teal-0/1`); desaturated sage/amber/brick for the console's semantic states. Defined in oklch for perceptual harmony. Deliberately avoids both a stark near-black+bright-accent pairing and a cream+terracotta pairing — the palette sits in the middle of the value range, warm but not saturated, calm but not flat.
- **Type:** Archivo (display/signage — headlines, directory labels, buttons, always at least medium weight) + Public Sans (body copy, form labels) + IBM Plex Mono (phone numbers, route codes, county badges — anything that reads like a plate engraving or a printed number). Google Fonts CDN substitutes — see Font note below.
- **Backgrounds:** flat solid fills only (paper or ink plate). No photography, no gradients, no texture/grain, no illustration.
- **Shadows:** one system — a hard 2–3px offset shadow (`--shadow-plate`, `--shadow-plate-sm`) that reads as a mounted plaque, not a blurred drop shadow. A softer `--shadow-card` exists only for low-emphasis containers.
- **Corners:** nearly flat. `--radius-sm` (3px) is the default for buttons/plates; `--radius-md`/`lg` (5/8px) only for larger recessed containers. Never pill-shaped, never a rounded card with a colored left border.
- **Borders:** 1px hairlines at low opacity (`--border-default` on paper, `--border-on-plate` on ink) — the visual seam between directory rows.
- **Hover/press:** hover = subtle background shift (a few % opacity) or underline; primary buttons press by translating 2px and dropping their offset shadow to flat — a physical "pressed plate" cue, not a color change alone.
- **Animation:** none decorative. Only fast (120–180ms) transitions on hover/press/focus state changes. No entrance animations, no bounces, no parallax — matches the "no urgency" mandate.
- **Layout:** single column mobile-first; content constrained to `--maxw-content` (1120px) / `--maxw-text` (640px) for prose. No fixed/sticky elements besides the header bar.
- **Transparency/blur:** none, aside from a ~5% white overlay for hover state on dark rows.
- **Imagery:** none — the brief forbids stock photography, and no brand photography was supplied. Every "visual" is typographic or a flat plate.

## Iconography
No icon set was supplied with the brief. **Lucide** (open, thin-stroke line icons, MIT licensed) is used via CDN as the nearest match to the brand's flat, unornamented signage aesthetic — stroke width ~1.6–1.8, no fills, no duotone, no emoji. Icons appear only where they clarify direction (an arrow on each directory row) or a contact method (phone/mail) — never as decoration. This is a substitution; if the client has a preferred icon set, swap it in `guidelines/iconography.card.html` and the `DirectoryTile`/contact markup.

## Font note (flag for the user)
No font files were provided. Archivo, Public Sans, and IBM Plex Mono are loaded from Google Fonts as the nearest open substitutes for a signage grotesk / humanist body / mono numeral set; **Martian Mono** was added for the console's figures (bed counts, rates), per that brief's explicit call-out. **If Care Vineyard has (or wants) licensed brand fonts, please provide the files** and they'll replace the CDN import in `tokens/fonts.css`.

## Logo concepts
No brand mark was supplied, so four original directions were explored (all avoiding hearts, house outlines, cradling hands, suns, trees, swooshes):
1. **Room plate (chosen)** — the wordmark set inside a door-number plaque: spruce plate, paper-colored letterspaced type. It reads as a sign, not a symbol, and doubles as the reusable device the rest of the system is built from — favicon to van decal. Built as the `RoomPlateMark` component and used as the mark in the site header/footer and the console top bar.
2. **The threshold** — two verticals + a floor line forming a doorway at a slight angle, one jamb lit. Abstract "door," no house drawn.
3. **The keyplate** — an escutcheon (the plate around a door handle). Warmer, more domestic, non-clinical; about being let in rather than placed. Held in reserve if the room-plate direction tests as too institutional.
4. **The wing letter** — a single letterform (facility wings run A/B/C) in a plate. Most abstract, weakest name connection; kept as a foil to react against.

See `guidelines/logo-concepts.card.html` for a side-by-side. A **secondary mark** — a stamped date block, `VERIFIED · 08 AUG` in Martian Mono inside a thin rotated rule box (`guidelines/verified-stamp.card.html`) — is used on internal documents; it's the visual argument for the business, not the master logo.

## Components
Standard set, sized to this brief (no source component library existed, so this is an authored-from-scratch inventory):
- `components/core/` — Button, Card, Badge, Tooltip
- `components/forms/` — Input, Textarea, Checkbox
- `components/brand/` — **DirectoryTile** (the hero wayfinding row), **FeePlate** (the signature fee-disclosure block), **RoomPlateMark** (the chosen logo device) — intentional additions for the public site; each is a named device from the brief with no generic equivalent.
- `components/console/` — **MatchPlate** (the bed-board result row: match/confirm/unknown/excluded states), **StaleStamp** (the physical staleness stamp — fresh → faded → amber UNCONFIRMED past 21 days), **RequirementToggle** (keyboard-shortcut intake chip) — intentional additions for the internal console; each is a named device from that brief with no generic equivalent.

## Products
Two surfaces exist in this system:
1. **Public site** (`ui_kits/website/`) — CareVineyard.com, the single-page marketing/trust page (see above).
2. **Internal console** (`ui_kits/console/`) — a private, login-gated operational tool for 1–3 placement-advisor staff. One `Console` component with an in-page screen switcher (not a nav sidebar — a flat top tab bar) covering: Match console (primary — keyboard-first intake + the bed-board results column), Facility detail (every field with its own staleness stamp), Facility list (sortable, survey completeness visible), Weekly openings (plain mono list formatted to paste into a partner email). Figures are set in Martian Mono; the console consistently uses a single 3px radius (`--radius-sm`) with no larger radii. Motion is limited to the stamp-landing animation (`@keyframes lnh-stamp-land`, 180ms, rotate+overshoot), guarded by `prefers-reduced-motion`.

## UI kits
- `ui_kits/website/` — the full single-page CareVineyard.com recreation: sticky header, directory-board hero (4 routes), fee disclosure plate, what-we-do/don't-do, service-area badges, contact section (phone/email + short form), footer.
- `ui_kits/console/` — the four console screens described above, composing MatchPlate/StaleStamp/RequirementToggle plus core/forms components.

## Index
- `styles.css` — root stylesheet entry (imports everything below)
- `tokens/` — colors.css, typography.css, spacing.css, elevation.css, fonts.css
- `base.css` — global resets/link states
- `guidelines/` — 14 foundation specimen cards (colors, type, spacing, plates/shadows, radii, borders, wordmark, directory motif, fee-plate motif, iconography, grid)
- `components/core/`, `components/forms/`, `components/brand/`, `components/console/` — see above
- `ui_kits/website/` — the CareVineyard.com single page (`index.html`, `sections.jsx`)
- `ui_kits/console/` — the internal operational console, 4 screens (`index.html`, `sections.jsx`)
- `thumbnail.html` — homepage tile
- `SKILL.md` — Claude-Code-compatible skill export
