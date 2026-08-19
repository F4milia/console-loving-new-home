const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateFacility, evaluateAll } = require('./matchEngine');

function facility(fieldsOverride = {}) {
  const base = {
    monthlyRate: { value: 4500, confirmedAt: '2026-08-15' },
    bedsOpen: { value: 2, confirmedAt: '2026-08-15' },
    wanderGuard: { value: true, confirmedAt: '2026-08-15' },
    twoPersonTransfer: { value: true, confirmedAt: '2026-08-15' },
    insulinManagement: { value: true, confirmedAt: '2026-08-15' },
    memoryCareUnit: { value: true, confirmedAt: '2026-08-15' },
  };
  return { id: 'fac_test', name: 'Test Facility', county: 'Test County', fields: { ...base, ...fieldsOverride } };
}

test('match: all active requirements known-yes, budget fits, beds open', () => {
  const f = facility();
  const result = evaluateFacility(f, { requirements: { W: true, T: true }, budget: 5000 });
  assert.equal(result.state, 'match');
});

test('excluded: confirmed zero open beds beats everything else', () => {
  const f = facility({ bedsOpen: { value: 0, confirmedAt: '2026-08-15' } });
  const result = evaluateFacility(f, { requirements: { W: true }, budget: 5000 });
  assert.equal(result.state, 'excluded');
  assert.match(result.reasoning, /no open beds/i);
});

test('excluded: confirmed rate over budget', () => {
  const f = facility({ monthlyRate: { value: 5200, confirmedAt: '2026-08-15' } });
  const result = evaluateFacility(f, { requirements: {}, budget: 4800 });
  assert.equal(result.state, 'excluded');
  assert.match(result.reasoning, /budget/i);
});

test('excluded: confirmed "no" on an active requirement', () => {
  const f = facility({ twoPersonTransfer: { value: false, confirmedAt: '2026-08-15' } });
  const result = evaluateFacility(f, { requirements: { T: true }, budget: 5000 });
  assert.equal(result.state, 'excluded');
  assert.match(result.reasoning, /two-person transfer/i);
});

test('confirm: one active requirement has no data, rest fits', () => {
  const f = facility({ twoPersonTransfer: { value: null, confirmedAt: null } });
  const result = evaluateFacility(f, { requirements: { T: true, W: true }, budget: 5000 });
  assert.equal(result.state, 'confirm');
  assert.equal(result.confirmItem, 'transfer assistance level');
});

test('unknown: no data at all relevant to the query', () => {
  const f = facility({
    monthlyRate: { value: null, confirmedAt: null },
    bedsOpen: { value: null, confirmedAt: null },
    wanderGuard: { value: null, confirmedAt: null },
  });
  const result = evaluateFacility(f, { requirements: { W: true }, budget: 4800 });
  assert.equal(result.state, 'unknown');
});

test('unregistered requirement keys are ignored rather than crashing', () => {
  const f = facility();
  const result = evaluateFacility(f, { requirements: { ZZZ: true }, budget: 5000 });
  assert.equal(result.state, 'match');
});

test('no budget given: rate never excludes or blocks a match', () => {
  const f = facility({ monthlyRate: { value: null, confirmedAt: null } });
  const result = evaluateFacility(f, { requirements: { W: true } });
  assert.equal(result.state, 'match');
});

test('evaluateAll groups into all four fixed buckets, in a stable shape', () => {
  const facilities = [
    facility({ id: 'a' }),
    facility({ bedsOpen: { value: 0, confirmedAt: '2026-08-15' } }),
  ];
  const groups = evaluateAll(facilities, { requirements: { W: true }, budget: 5000 });
  assert.ok('match' in groups);
  assert.ok('confirm' in groups);
  assert.ok('unknown' in groups);
  assert.ok('excluded' in groups);
});
