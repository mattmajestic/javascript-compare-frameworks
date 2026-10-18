import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCustomEvent,
  daysLabel,
  getHolidays,
  loadCustomEvents,
  mergeEvents,
  nthWeekday,
  saveCustomEvents,
  timeLeft,
  toISODate,
} from '../src/index.js';

const memoryStorage = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
};

test('Thanksgiving is the 4th Thursday of November, not a fixed date', () => {
  assert.equal(toISODate(nthWeekday(2023, 10, 4, 4)), '2023-11-23');
  assert.equal(toISODate(nthWeekday(2024, 10, 4, 4)), '2024-11-28');
  assert.equal(toISODate(nthWeekday(2026, 10, 4, 4)), '2026-11-26');
});

test('holidays resolve to their next occurrence', () => {
  const byId = Object.fromEntries(getHolidays(new Date(2026, 9, 10)).map((h) => [h.id, toISODate(h.date)]));
  assert.deepEqual(byId, {
    'new-year': '2027-01-01',
    valentines: '2027-02-14',
    halloween: '2026-10-31',
    thanksgiving: '2026-11-26',
    christmas: '2026-12-25',
  });
});

test('a holiday stays current for the whole day, then rolls to next year', () => {
  const find = (now) => toISODate(getHolidays(now).find((h) => h.id === 'christmas').date);
  assert.equal(find(new Date(2026, 11, 25, 23, 59)), '2026-12-25');
  assert.equal(find(new Date(2026, 11, 26, 0, 0)), '2027-12-25');
});

test('mergeEvents sorts soonest first', () => {
  const custom = [{ id: 'c', date: new Date(2026, 9, 20) }];
  const ids = mergeEvents(getHolidays(new Date(2026, 9, 10)), custom).map((e) => e.id);
  assert.deepEqual(ids, ['c', 'halloween', 'thanksgiving', 'christmas', 'new-year', 'valentines']);
});

test('timeLeft breaks the remaining time into padded units', () => {
  const now = new Date(2026, 9, 10, 12, 0, 0);
  const target = new Date(2026, 9, 12, 13, 2, 3);
  const { done, units } = timeLeft(target, now);
  assert.equal(done, false);
  assert.deepEqual(units.map((u) => u.value), ['2', '01', '02', '03']);
  assert.equal(timeLeft(now, target).done, true);
});

test('daysLabel uses calendar days', () => {
  const now = new Date(2026, 9, 10, 23, 0);
  assert.equal(daysLabel(new Date(2026, 9, 10), now), 'Today');
  assert.equal(daysLabel(new Date(2026, 9, 11), now), 'Tomorrow');
  assert.equal(daysLabel(new Date(2026, 9, 31), now), '21 days');
});

test('createCustomEvent validates input', () => {
  const now = new Date(2026, 9, 10, 12);
  assert.equal(createCustomEvent('  ', '2026-12-01', now).error, 'Give your countdown a name.');
  assert.equal(createCustomEvent('x'.repeat(41), '2026-12-01', now).ok, false);
  assert.equal(createCustomEvent('Launch', '', now).error, 'Pick a date.');
  assert.equal(createCustomEvent('Launch', '2026-02-30', now).error, 'Pick a date.');
  assert.equal(createCustomEvent('Launch', '2026-10-10', now).error, 'Pick a date in the future.');
  const result = createCustomEvent('  Launch ', '2026-12-01', now);
  assert.equal(result.ok, true);
  assert.equal(result.event.name, 'Launch');
  assert.equal(result.event.custom, true);
  assert.equal(toISODate(result.event.date), '2026-12-01');
});

test('custom events round-trip through storage and ignore bad data', () => {
  const storage = memoryStorage();
  const { event } = createCustomEvent('Launch', '2026-12-01', new Date(2026, 9, 10));
  saveCustomEvents([event], storage);
  const [loaded] = loadCustomEvents(storage);
  assert.equal(loaded.id, event.id);
  assert.equal(toISODate(loaded.date), '2026-12-01');

  storage.setItem('countdown:custom-events', '{not json');
  assert.deepEqual(loadCustomEvents(storage), []);
  storage.setItem('countdown:custom-events', JSON.stringify([{ id: 1 }, { id: 'a', name: 'ok', date: '2026-12-01' }]));
  assert.equal(loadCustomEvents(storage).length, 1);
  assert.deepEqual(loadCustomEvents(undefined), []);
});

test('benchmark: queries deterministic rows with fresh ids, then updates and clears', async () => {
  const { benchData, benchSummary, updateEvery10th } = await import('../src/bench.js');
  const first = await benchData('load-1k', []);
  const again = await benchData('load-1k', []);
  assert.equal(first.rows.length, 1000);
  assert.equal(typeof first.queryMs, 'number');
  assert.deepEqual(first.rows.map((r) => r.emoji), again.rows.map((r) => r.emoji));
  assert.notEqual(first.rows[0].id, again.rows[0].id);
  assert.match(first.rows[0].date, /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);

  const updated = updateEvery10th(first.rows);
  assert.ok(updated[0].name.endsWith(' ✓'));
  assert.equal(updated[1], first.rows[1]);
  assert.equal(updated.filter((r, i) => r !== first.rows[i]).length, 100);

  assert.deepEqual(await benchData('clear', first.rows), { rows: [], queryMs: null });
  assert.equal(benchSummary({ op: 'update', rows: 1000, queryMs: null, renderMs: 12.34 }), '1,000 rows · render 12.3 ms');
});

test('custom events: only real adds and removes are synced', () => {
  const storage = memoryStorage();
  const calls = [];
  const sync = (changes) => calls.push(changes);
  const a = createCustomEvent('A', '2099-01-01').event;
  const b = createCustomEvent('B', '2099-02-01').event;

  saveCustomEvents([], storage, sync);
  saveCustomEvents([a], storage, sync);
  saveCustomEvents([a], storage, sync); // re-save (reload, StrictMode) → nothing
  saveCustomEvents([a, b], storage, sync);
  saveCustomEvents([b], storage, sync);

  assert.deepEqual(
    calls.map((c) => c.map((e) => `${e.status}:${e.name}`)),
    [['active:A'], ['active:B'], ['deleted:A']],
  );
  assert.equal(calls[2][0].date, '2099-01-01');
});

test('custom events: side-by-side demos sharing storage only sync their own changes', () => {
  // Two iframes: separate JS realms (so separate baselines), one localStorage.
  const shared = memoryStorage();
  const pageView = () => ({ getItem: shared.getItem, setItem: shared.setItem });
  const svelteStorage = pageView();
  const solidStorage = pageView();
  const svelte = [];
  const solid = [];
  const log = (calls) => calls.map((c) => c.map((e) => `${e.status}:${e.name}`));

  loadCustomEvents(svelteStorage);
  loadCustomEvents(solidStorage); // Solid's list is now stale once Svelte adds.
  saveCustomEvents([createCustomEvent('From Svelte', '2099-01-01').event], svelteStorage, (c) => svelte.push(c));
  saveCustomEvents([createCustomEvent('From Solid', '2099-02-01').event], solidStorage, (c) => solid.push(c));

  assert.deepEqual(log(svelte), [['active:From Svelte']]);
  assert.deepEqual(log(solid), [['active:From Solid']]); // No bogus "deleted: From Svelte".
  assert.deepEqual(loadCustomEvents(shared).map((e) => e.name).sort(), ['From Solid', 'From Svelte']);
});
