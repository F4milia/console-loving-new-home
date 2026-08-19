const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStaleness } = require('./staleness');

const DAY_MS = 86400000;
const NOW = new Date('2026-08-19T12:00:00Z').getTime();

function daysAgo(n) {
  return new Date(NOW - n * DAY_MS).toISOString();
}

test('null confirmedAt returns null (no data, not a stamp)', () => {
  assert.equal(computeStaleness(null, NOW), null);
});

test('0 days -> fresh, "CONFIRMED TODAY", opacity 1', () => {
  const s = computeStaleness(daysAgo(0), NOW);
  assert.equal(s.tier, 'fresh');
  assert.equal(s.label, 'CONFIRMED TODAY');
  assert.equal(s.opacity, 1);
});

test('10 days -> still fresh tier', () => {
  const s = computeStaleness(daysAgo(10), NOW);
  assert.equal(s.tier, 'fresh');
  assert.equal(s.label, 'CONFIRMED 10D AGO');
});

test('15 days -> aging, fading opacity', () => {
  const s = computeStaleness(daysAgo(15), NOW);
  assert.equal(s.tier, 'aging');
  assert.equal(s.opacity, Math.max(0.45, 1 - 15 / 24));
});

test('21 days -> still aging (boundary is > 21, not >=)', () => {
  const s = computeStaleness(daysAgo(21), NOW);
  assert.equal(s.tier, 'aging');
});

test('22 days -> unconfirmed, opacity forced to 1', () => {
  const s = computeStaleness(daysAgo(22), NOW);
  assert.equal(s.tier, 'unconfirmed');
  assert.equal(s.label, 'UNCONFIRMED');
  assert.equal(s.opacity, 1);
});
