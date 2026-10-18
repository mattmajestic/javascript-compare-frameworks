// Query & render benchmark, shared by every demo.
//
// The "API" is a real fetch() + JSON parse of a Blob URL, so the query path is
// identical in every framework and free of network noise. Only rendering is
// left to the framework, which is the part that actually differs.

import { currentFramework, post } from './sync.js';

const DAY = 86_400_000;
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const NAMES = ['Launch', 'Deadline', 'Birthday', 'Release', 'Meetup', 'Trip', 'Concert', 'Wedding', 'Exam', 'Demo day'];
const EMOJIS = ['🚀', '📅', '🎂', '📦', '🤝', '✈️', '🎸', '💍', '📝', '🎤'];

export const BENCH_OPS = [
  { op: 'load-1k', label: 'Query 1,000 rows' },
  { op: 'load-10k', label: 'Query 10,000 rows' },
  { op: 'update', label: 'Update every 10th' },
  { op: 'clear', label: 'Clear' },
];

/** Deterministic PRNG (mulberry32), so every framework gets the same data. */
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nextId = 1;

/** The "server": builds a JSON response body. Not timed. */
function serverResponse(count) {
  const random = seeded(count);
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const rows = Array.from({ length: count }, () => {
    const i = Math.floor(random() * NAMES.length);
    const id = nextId++;
    return { id, name: `${NAMES[i]} #${id}`, emoji: EMOJIS[i], date: base + (1 + Math.floor(random() * 730)) * DAY };
  });
  return URL.createObjectURL(new Blob([JSON.stringify(rows)], { type: 'application/json' }));
}

/**
 * Query `count` rows from the mock API. Every call returns fresh ids, like a
 * real refetch. `queryMs` covers fetch + JSON parsing + mapping to display rows.
 */
export async function queryRows(count) {
  const url = serverResponse(count);
  const start = performance.now();
  try {
    const response = await fetch(url);
    const rows = (await response.json()).map((r) => ({ ...r, date: shortDate.format(r.date) }));
    return { rows, queryMs: performance.now() - start };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Every 10th row gets a new object with an updated name; the rest are untouched. */
export function updateEvery10th(rows) {
  return rows.map((row, i) => (i % 10 === 0 ? { ...row, name: `${row.name} ✓` } : row));
}

/** The rows an operation produces, so each framework only has to render them. */
export async function benchData(op, current) {
  const data =
    op === 'load-1k' || op === 'load-10k'
      ? await queryRows(op === 'load-1k' ? 1_000 : 10_000)
      : { rows: op === 'update' ? updateEvery10th(current) : [], queryMs: null };
  pending = { op, queryMs: data.queryMs };
  return data;
}

// Real-world results: every demo calls benchData() then startRenderTimer(),
// so the run can be reported from here without touching framework code.
let pending = null;
let queue = [];
let reported = 0;
let flushTimer;
const MAX_REPORTS_PER_PAGE = 100;

function flush() {
  clearTimeout(flushTimer);
  if (queue.length) post('bench', { framework: currentFramework(), runs: queue.splice(0, 20) });
}

function report(run) {
  // Skip automated browsers (npm run bench, e2e): they'd skew real-world data.
  if (!globalThis.document || globalThis.navigator?.webdriver || reported >= MAX_REPORTS_PER_PAGE) return;
  reported += 1;
  queue.push(run);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 3000);
  if (queue.length === 1) globalThis.addEventListener?.('pagehide', flush, { once: true });
}

/**
 * Call right before changing state; await the returned function right after.
 * It resolves once the browser has painted the result, so it covers the
 * framework's own scheduling, DOM work, style, layout and paint.
 */
export function startRenderTimer() {
  const start = performance.now();
  const run = pending;
  pending = null;
  return () =>
    new Promise((resolve) =>
      requestAnimationFrame(() =>
        setTimeout(() => {
          const renderMs = performance.now() - start;
          resolve(renderMs);
          if (run) report({ ...run, renderMs });
        }),
      ),
    );
}

const ms = (value) => `${value.toFixed(1)} ms`;

/** One-line summary shown under the benchmark buttons. */
export function benchSummary(result) {
  if (!result) return 'Pick an operation to time it.';
  const parts = [`${result.rows.toLocaleString('en-US')} rows`];
  if (result.queryMs !== null) parts.push(`query ${ms(result.queryMs)}`);
  parts.push(`render ${ms(result.renderMs)}`);
  return parts.join(' · ');
}
