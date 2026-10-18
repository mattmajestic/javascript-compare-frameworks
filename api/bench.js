// Vercel serverless function: POST /api/bench/
// Benchmark runs from visitors' browsers, folded into running averages per
// framework × operation × browser.
//
// Body: { framework: 'vue', runs: [{ op: 'load-10k', renderMs: 312.4, queryMs: 18.1 }] }

import { BENCH_OPS, FRAMEWORKS } from '../packages/core/src/index.js';
import { BENCH_FIELDS as F, BENCH_TABLE } from '../db/schema.mjs';
import { airtable, browserFamily, config, json, readBody } from './_airtable.js';

const MAX_RUNS = 20;
const OPS = new Set(BENCH_OPS.map((o) => o.op));
const isMs = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 60_000;
const isRun = (r) => OPS.has(r?.op) && isMs(r.renderMs) && (r.queryMs === null || isMs(r.queryMs));
const round = (v) => Math.round(v * 10) / 10;

export async function POST(request) {
  const cfg = config();
  if (cfg.error) return cfg.error;
  const { body, error } = await readBody(request);
  if (error) return error;

  const framework = FRAMEWORKS.find((f) => f.id === body?.framework)?.name;
  const runs = Array.isArray(body?.runs) ? body.runs : [];
  if (!framework || runs.length === 0 || runs.length > MAX_RUNS || !runs.every(isRun)) {
    return json(400, { error: `Send a framework and 1–${MAX_RUNS} valid runs.` });
  }
  const browser = browserFamily(request.headers.get('user-agent') ?? '');

  // Group this batch by op, so each Airtable row is read and written once.
  const batch = new Map();
  for (const r of runs) {
    const g = batch.get(r.op) ?? { runs: 0, render: 0, best: Infinity, query: 0, queryRuns: 0 };
    g.runs += 1;
    g.render += r.renderMs;
    g.best = Math.min(g.best, r.renderMs);
    if (r.queryMs !== null) (g.query += r.queryMs), (g.queryRuns += 1);
    batch.set(r.op, g);
  }
  const keyFor = (op) => `${framework} · ${op} · ${browser}`;

  try {
    // Read-modify-write. Two batches racing on the same row can drop one
    // batch's counts; for crowd-sourced averages that's an acceptable trade
    // for staying on Airtable's plain REST API.
    const keys = [...batch.keys()].map(keyFor); // Built from validated enums only.
    const formula = `OR(${keys.map((k) => `{${F.key}}="${k}"`).join(',')})`;
    const { records } = await airtable(cfg, BENCH_TABLE, { query: `?filterByFormula=${encodeURIComponent(formula)}` });
    const existing = new Map(records.map((r) => [r.fields[F.key], r.fields]));

    const now = new Date().toISOString();
    const updates = [...batch].map(([op, g]) => {
      const prev = existing.get(keyFor(op)) ?? {};
      const n = prev[F.runs] ?? 0;
      const total = n + g.runs;
      const avgQuery = g.queryRuns
        ? ((prev[F.avgQueryMs] ?? 0) * n + g.query) / (n + g.queryRuns)
        : prev[F.avgQueryMs];
      return {
        fields: {
          [F.key]: keyFor(op),
          [F.framework]: framework,
          [F.op]: op,
          [F.browser]: browser,
          [F.runs]: total,
          [F.avgRenderMs]: round(((prev[F.avgRenderMs] ?? 0) * n + g.render) / total),
          [F.bestRenderMs]: round(Math.min(prev[F.bestRenderMs] ?? Infinity, g.best)),
          ...(avgQuery !== undefined ? { [F.avgQueryMs]: round(avgQuery) } : {}),
          [F.updatedAt]: now,
        },
      };
    });

    await airtable(cfg, BENCH_TABLE, {
      method: 'PATCH',
      body: JSON.stringify({ performUpsert: { fieldsToMergeOn: [F.key] }, records: updates, typecast: true }),
    });
  } catch (err) {
    console.error(err);
    return json(502, { error: 'Could not save to Airtable.' });
  }
  return new Response(null, { status: 204 });
}
