/**
 * Match engine
 * ------------
 * Given a facility record and a match query (active requirement toggles +
 * an optional budget), decides which of the four non-negotiable states the
 * facility falls into, and produces the reasoning text the MatchPlate shows.
 *
 * State precedence (checked in this order — first match wins):
 *   1. unknown  — we don't have enough data on this facility to judge the
 *                 query at all. Never inferred as a soft yes.
 *   2. excluded — a hard requirement definitively fails (known "no" on an
 *                 active requirement, budget confirmed over range, or zero
 *                 open beds confirmed). Always named specifically.
 *   3. confirm  — everything we *do* know fits, but at least one active
 *                 requirement (or the budget/availability check) has no
 *                 data yet. Always names the specific unconfirmed item.
 *   4. match    — every active requirement is confirmed "yes", budget fits
 *                 (or wasn't specified), and there's a confirmed open bed.
 *
 * "Unknown" vs "confirm" distinction: unknown means *none* of the fields
 * needed to evaluate this specific query have any data — we know nothing
 * relevant to this call. Confirm means we know *most* of it and only a
 * specific item needs a follow-up question. This mirrors the product
 * intent ("no data — must never be inferred as a yes") while still letting
 * well-surveyed facilities with a single gap route to the more actionable
 * "confirm" bucket instead of burying them in "unknown".
 */

const { listRequirements, getRequirement } = require('../data/requirements.registry');
const { computeCompleteness } = require('../utils/completeness');

function isKnown(fieldEntry) {
  return !!fieldEntry && fieldEntry.value !== null && fieldEntry.value !== undefined;
}

/**
 * @param {object} facility - a facility record from the store (with .fields)
 * @param {object} query
 * @param {Object.<string, boolean>} query.requirements - e.g. { W: true, T: true }
 *   Only keys with a truthy value are treated as "active" for this query.
 * @param {number|null} [query.budget] - monthly budget ceiling, optional
 */
function evaluateFacility(facility, query = {}) {
  const activeReqKeys = Object.entries(query.requirements || {})
    .filter(([, active]) => !!active)
    .map(([key]) => key)
    .filter(key => !!getRequirement(key)); // ignore unregistered/unknown toggle keys

  const rateField = facility.fields.monthlyRate;
  const bedsField = facility.fields.bedsOpen;
  const budgetGiven = query.budget !== undefined && query.budget !== null && query.budget !== '';
  const budget = budgetGiven ? Number(query.budget) : null;

  // --- Gather the fields actually needed to answer THIS query ---
  const neededFields = [];
  if (budgetGiven) neededFields.push(rateField);
  neededFields.push(bedsField);
  for (const key of activeReqKeys) {
    neededFields.push(facility.fields[getRequirement(key).field]);
  }

  const anyNeededFieldKnown = neededFields.some(isKnown);

  // --- 1. UNKNOWN: nothing relevant to this query has any data on record ---
  if (!anyNeededFieldKnown) {
    return {
      state: 'unknown',
      reasoning: 'No survey data on record',
      confirmItem: null,
      figures: [],
    };
  }

  // --- 2. EXCLUDED: check hard fails, in a fixed, predictable order ---
  if (isKnown(bedsField) && bedsField.value === 0) {
    return {
      state: 'excluded',
      reasoning: 'No open beds',
      confirmItem: null,
      figures: buildFigures(facility, activeReqKeys, budget),
    };
  }

  if (budgetGiven && isKnown(rateField) && rateField.value > budget) {
    return {
      state: 'excluded',
      reasoning: 'Budget exceeds stated range',
      confirmItem: null,
      figures: buildFigures(facility, activeReqKeys, budget),
    };
  }

  for (const key of activeReqKeys) {
    const req = getRequirement(key);
    const fieldEntry = facility.fields[req.field];
    if (isKnown(fieldEntry) && fieldEntry.value === false) {
      return {
        state: 'excluded',
        reasoning: capitalize(req.failText),
        confirmItem: null,
        figures: buildFigures(facility, activeReqKeys, budget),
      };
    }
  }

  // --- 3. CONFIRM: something needed for this query has no data yet ---
  const unresolved = [];
  if (budgetGiven && !isKnown(rateField)) unresolved.push('monthly rate');
  if (!isKnown(bedsField)) unresolved.push('bed availability');
  for (const key of activeReqKeys) {
    const req = getRequirement(key);
    if (!isKnown(facility.fields[req.field])) unresolved.push(req.unknownText);
  }

  if (unresolved.length > 0) {
    const [firstItem, ...rest] = unresolved;
    const tail = rest.length > 0 ? ` (and ${rest.length} other item${rest.length > 1 ? 's' : ''} to confirm)` : '';
    return {
      state: 'confirm',
      reasoning: `everything else fits${tail}`,
      confirmItem: firstItem,
      figures: buildFigures(facility, activeReqKeys, budget),
    };
  }

  // --- 4. MATCH: everything needed is known and satisfied ---
  return {
    state: 'match',
    reasoning: buildMatchReasoning(facility, activeReqKeys),
    confirmItem: null,
    figures: buildFigures(facility, activeReqKeys, budget),
  };
}

function buildFigures(facility, activeReqKeys, budget) {
  const figures = [];
  const rate = facility.fields.monthlyRate;
  figures.push(isKnown(rate) ? `$${rate.value.toLocaleString()}/mo` : '—');
  for (const key of activeReqKeys) {
    const req = getRequirement(key);
    const fieldEntry = facility.fields[req.field];
    if (isKnown(fieldEntry) && fieldEntry.value === true) figures.push(req.passText);
  }
  return figures;
}

function buildMatchReasoning(facility, activeReqKeys) {
  const passes = activeReqKeys
    .map(key => getRequirement(key))
    .filter(req => facility.fields[req.field] && facility.fields[req.field].value === true)
    .map(req => req.passText);
  if (passes.length === 0) return 'Meets budget and availability.';
  return `Confirmed: ${passes.join('; ')}.`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Evaluates every facility against the query and groups results into the
 * four fixed sections in the fixed order the UI expects: match, confirm,
 * unknown, excluded.
 */
function evaluateAll(facilities, query) {
  const groups = { match: [], confirm: [], unknown: [], excluded: [] };

  for (const facility of facilities) {
    const result = evaluateFacility(facility, query);
    const completeness = computeCompleteness(facility);
    groups[result.state].push({
      id: facility.id,
      name: facility.name,
      county: facility.county,
      telephone: facility.fields.telephone ? facility.fields.telephone.value : null,
      completeness,
      ...result,
    });
  }

  return groups;
}

module.exports = { evaluateFacility, evaluateAll, listRequirements };
