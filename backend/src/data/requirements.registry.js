/**
 * Requirement registry
 * ---------------------
 * Maps a requirement toggle (as shown in the Match console UI, e.g. "[W] Wanders")
 * to the facility field it checks. This is the single place new requirements get
 * added — the match engine and API stay generic over whatever is registered here.
 *
 * Each field on a facility is tri-state: `true` (yes), `false` (confirmed no),
 * or `null`/undefined (no data). Per the product spec, `null` must NEVER be
 * treated as `true`.
 */

const REQUIREMENTS = {
  W: {
    key: 'W',
    label: 'Wanders',
    field: 'wanderGuard',
    // Human-readable strings used when composing MatchPlate-style reasoning text.
    passText: 'wander management in place',
    failText: 'no wander management / secure unit',
    unknownText: 'wander guard availability',
  },
  T: {
    key: 'T',
    label: 'Two-person transfer',
    field: 'twoPersonTransfer',
    passText: '2-person transfer',
    failText: 'does not provide two-person transfer assistance',
    unknownText: 'transfer assistance level',
  },
  I: {
    key: 'I',
    label: 'Insulin dependent',
    field: 'insulinManagement',
    passText: 'insulin mgmt',
    failText: 'no insulin management capability',
    unknownText: 'insulin management capability',
  },
  M: {
    key: 'M',
    label: 'Memory care',
    field: 'memoryCareUnit',
    passText: 'memory care unit',
    failText: 'no memory care unit',
    unknownText: 'memory care unit availability',
  },
};

function getRequirement(key) {
  return REQUIREMENTS[key] || null;
}

function listRequirements() {
  return Object.values(REQUIREMENTS);
}

module.exports = { REQUIREMENTS, getRequirement, listRequirements };
