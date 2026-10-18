// Vercel serverless function: GET /api/stats/
// Aggregate numbers for the site's "Live from the demos" section. Only
// counts and averages leave this function; event names are never read.
// Cached briefly at Vercel's edge, so however many visitors poll it, Airtable
// sees only a few reads a minute (its limit is 5 requests/second per base).

import { BENCH_OPS, FRAMEWORKS } from '../packages/core/src/index.js';
import { BENCH_FIELDS as B, BENCH_TABLE, EVENTS_FIELDS as E, EVENTS_TABLE, STATUS } from '../db/schema.mjs';
import { config, json, listAll } from './_airtable.js';

// Public, read-only aggregates, so any origin may read them (the docs'
// API explorer on GitHub Pages calls this cross-origin).
const HEADERS = {
  'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=30',
  'Access-Control-Allow-Origin': '*',
};
const idByName = new Map(FRAMEWORKS.map((f) => [f.name, f.id]));

export async function GET() {
  const cfg = config();
  if (cfg.error) return cfg.error;

  try {
    const [events, bench] = await Promise.all([
      listAll(cfg, EVENTS_TABLE, [E.framework, E.status]),
      listAll(cfg, BENCH_TABLE, [B.framework, B.op, B.browser, B.runs, B.avgRenderMs, B.avgQueryMs]),
    ]);

    const zeroes = () => Object.fromEntries(FRAMEWORKS.map((f) => [f.id, 0]));
    const added = zeroes();
    let active = 0;
    for (const { fields } of events) {
      const id = idByName.get(fields[E.framework]);
      if (id) added[id] += 1;
      if (fields[E.status] === STATUS.active) active += 1;
    }

    // Weighted average across browsers for each framework × op.
    const acc = {};
    const browsers = {};
    let runs = 0;
    for (const { fields: f } of bench) {
      const id = idByName.get(f[B.framework]);
      const n = f[B.runs] ?? 0;
      if (!id || !n) continue;
      const cell = ((acc[id] ??= {})[f[B.op]] ??= { runs: 0, render: 0, query: 0 });
      cell.runs += n;
      cell.render += (f[B.avgRenderMs] ?? 0) * n;
      cell.query += (f[B.avgQueryMs] ?? 0) * n;
      browsers[f[B.browser]] = (browsers[f[B.browser]] ?? 0) + n;
      runs += n;
    }
    const benchmarks = Object.fromEntries(
      FRAMEWORKS.map(({ id }) => [
        id,
        Object.fromEntries(
          BENCH_OPS.map(({ op }) => {
            const c = acc[id]?.[op];
            return [op, c ? { runs: c.runs, renderMs: c.render / c.runs, queryMs: c.query ? c.query / c.runs : null } : null];
          }),
        ),
      ]),
    );

    return json(
      200,
      { generatedAt: new Date().toISOString(), events: { total: events.length, active, byFramework: added }, benchmarks, runs, browsers },
      HEADERS,
    );
  } catch (err) {
    console.error(err);
    return json(502, { error: 'Could not read from Airtable.' });
  }
}
