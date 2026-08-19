const { FIELD_KEYS } = require('../data/facilities.store');

/**
 * Survey completeness — count of populated fields out of the full tracked
 * set, used both in the Facility list screen ("18/18") and to help the
 * match engine decide when a facility has too little data to judge at all
 * (the "unknown" state) rather than just one missing item ("confirm").
 */
function computeCompleteness(facility) {
  const total = FIELD_KEYS.length;
  const populated = FIELD_KEYS.filter(
    key => facility.fields[key] && facility.fields[key].value !== null && facility.fields[key].value !== undefined
  ).length;

  return {
    populated,
    total,
    fraction: total === 0 ? 0 : populated / total,
    display: `${populated}/${total}`,
  };
}

module.exports = { computeCompleteness };
