/**
 * Staleness math — must stay byte-for-byte in sync with
 * design_system/components/console/StaleStamp.jsx.txt so the number the
 * advisor sees on screen always matches what the backend used to decide
 * confirm/match/excluded.
 *
 *   0–10 days:  fresh, opacity 1
 *   11–21 days: aging, opacity fades linearly: max(0.45, 1 - days/24)
 *   >21 days:   unconfirmed, opacity 1, flagged
 *
 * Returns null for fields with no confirmedAt at all ("no data"), which is
 * a distinct concept from "confirmed a long time ago" and must be surfaced
 * differently by the UI (a neutral "No data" badge, not a stamp).
 */

const DAY_MS = 86400000;

function computeStaleness(confirmedAt, now = Date.now()) {
  if (!confirmedAt) return null;

  // Clamp to 0: a confirmedAt in the future (clock skew, timezone rounding)
  // should never render as a negative-day stamp.
  const days = Math.max(0, Math.floor((now - new Date(confirmedAt).getTime()) / DAY_MS));
  const unconfirmed = days > 21;
  const tier = unconfirmed ? 'unconfirmed' : days > 10 ? 'aging' : 'fresh';
  const opacity = unconfirmed ? 1 : Math.max(0.45, 1 - days / 24);
  const label = unconfirmed ? 'UNCONFIRMED' : `CONFIRMED ${days === 0 ? 'TODAY' : days + 'D AGO'}`;

  return { days, tier, opacity, label, confirmedAt };
}

module.exports = { computeStaleness };
