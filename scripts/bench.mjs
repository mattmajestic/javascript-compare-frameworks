// Runs the query & render benchmark in every demo with headless Chromium and
// writes median timings to site/src/data/bench.json for the comparison site.
//
//   npm run build && npm run bench
//
// Run it locally (it needs a real browser), then commit the JSON. Timings are
// machine-dependent; compare frameworks against each other, not across runs.

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { BENCH_OPS, FRAMEWORKS } from '@compare/core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4174;
const WARMUP = 2;
const ITERATIONS = 10;
// One pass: [op, recorded?]. Consecutive ops always differ, so each result is
// detectable by its data-op. Update and clear are measured on 10,000 rows.
const SEQUENCE = [
  ['load-1k', true],
  ['clear', false],
  ['load-10k', true],
  ['update', true],
  ['clear', true],
];

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

function parse(text) {
  const query = /query ([\d.]+) ms/.exec(text);
  const render = /render ([\d.]+) ms/.exec(text);
  return { queryMs: query ? Number(query[1]) : null, renderMs: Number(render[1]) };
}

async function runOp(page, op) {
  const label = BENCH_OPS.find((o) => o.op === op).label;
  await page.locator('.bench').getByRole('button', { name: label, exact: true }).click();
  const result = page.locator(`.bench-result[data-op="${op}"]`);
  await result.waitFor({ timeout: 30_000 });
  return parse(await result.textContent());
}

async function benchFramework(browser, fw) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/demos/${fw.id}/`);
  await page.locator('.bench').waitFor();

  const samples = { 'load-1k': [], 'load-10k': [], update: [], clear: [] };
  for (let i = 0; i < WARMUP + ITERATIONS; i++) {
    for (const [op, recorded] of SEQUENCE) {
      const sample = await runOp(page, op);
      if (recorded && i >= WARMUP) samples[op].push(sample);
    }
  }
  await page.close();

  const summarize = (list) => ({
    renderMs: median(list.map((s) => s.renderMs)),
    queryMs: list[0].queryMs === null ? null : median(list.map((s) => s.queryMs)),
  });
  return Object.fromEntries(Object.entries(samples).map(([op, list]) => [op, summarize(list)]));
}

const server = spawn('node', [join(root, 'scripts/serve.mjs')], { env: { ...process.env, PORT: String(PORT) } });
try {
  await new Promise((resolve, reject) => {
    server.stdout.once('data', resolve);
    server.once('exit', () => reject(new Error('Static server exited. Run `npm run build` first.')));
  });

  const browser = await chromium.launch();
  const results = { generatedAt: new Date().toISOString(), browser: `Chromium ${browser.version()}`, iterations: ITERATIONS, frameworks: {} };
  for (const fw of FRAMEWORKS) {
    process.stdout.write(`▶ ${fw.name.padEnd(8)} `);
    results.frameworks[fw.id] = await benchFramework(browser, fw);
    const r = results.frameworks[fw.id];
    console.log(
      `1k ${r['load-1k'].renderMs.toFixed(1)} ms · 10k ${r['load-10k'].renderMs.toFixed(1)} ms · ` +
        `update ${r.update.renderMs.toFixed(1)} ms · clear ${r.clear.renderMs.toFixed(1)} ms · ` +
        `query(10k) ${r['load-10k'].queryMs.toFixed(1)} ms`,
    );
  }
  await browser.close();

  const out = join(root, 'site', 'src', 'data', 'bench.json');
  writeFileSync(out, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`\n✔ Wrote site/src/data/bench.json (median of ${ITERATIONS} runs after ${WARMUP} warm-up runs)`);
} finally {
  server.kill();
}
