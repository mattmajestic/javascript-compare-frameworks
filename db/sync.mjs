// Record the build metrics and lab benchmark in Airtable's Snapshots table.
//
//   npm run db:sync            manual run (reads .env)
//   npm run build on Vercel    automatic, production deploys only (see scripts/build.mjs)
//
// A framework gets a new row only when one of its measured values changed
// since its latest snapshot. Build time is recorded but ignored for that
// check, since it differs on every run.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRAMEWORKS } from '../packages/core/src/frameworks.js';
import { airtable, listAll } from '../api/_airtable.js';
import { SNAPSHOTS_TABLE, SNAPSHOT_FIELDS as F } from './schema.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(readFileSync(join(root, 'site', 'src', 'data', file), 'utf8'));
const round1 = (v) => (typeof v === 'number' ? Math.round(v * 10) / 10 : undefined);

function currentCommit() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    const sha = execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim();
    const dirty = execSync('git status --porcelain', { cwd: root, encoding: 'utf8' }).trim();
    return dirty ? `${sha}-dirty` : sha;
  } catch {
    return 'unknown';
  }
}

/** The Snapshots fields for one framework, from the generated JSON files. */
function snapshotFields(fw, metrics, bench, commit) {
  const m = metrics.frameworks[fw.id];
  const b = bench.frameworks[fw.id] ?? {};
  return {
    [F.key]: `${fw.name} · ${commit}`,
    [F.framework]: fw.name,
    [F.version]: m.version,
    [F.commit]: commit,
    [F.jsGzip]: m.bundle.js.gzip,
    [F.jsRaw]: m.bundle.js.raw,
    [F.cssGzip]: m.bundle.css.gzip,
    [F.sourceLines]: m.source.lines,
    [F.sourceFiles]: m.source.files.length,
    [F.configLines]: m.config.lines,
    [F.buildMs]: m.buildMs,
    [F.labRender1k]: round1(b['load-1k']?.renderMs),
    [F.labRender10k]: round1(b['load-10k']?.renderMs),
    [F.labUpdate]: round1(b.update?.renderMs),
    [F.labClear]: round1(b.clear?.renderMs),
    [F.labQuery10k]: round1(b['load-10k']?.queryMs),
    [F.labBrowser]: bench.browser,
  };
}

// Fields that define "changed". Key, commit, time and build ms don't count.
const COMPARED = [
  F.version, F.jsGzip, F.jsRaw, F.cssGzip, F.sourceLines, F.sourceFiles, F.configLines,
  F.labRender1k, F.labRender10k, F.labUpdate, F.labClear, F.labQuery10k, F.labBrowser,
];

export async function syncSnapshots({ log = console.log } = {}) {
  const { AIRTABLE_TOKEN: token, AIRTABLE_BASE_ID: baseId } = process.env;
  if (!token || !baseId) throw new Error('Set AIRTABLE_TOKEN and AIRTABLE_BASE_ID first.');
  const cfg = { token, baseId };

  const metrics = readJson('metrics.json');
  const bench = readJson('bench.json');
  const commit = currentCommit();

  // Latest snapshot per framework.
  const latest = new Map();
  for (const { fields } of await listAll(cfg, SNAPSHOTS_TABLE, [F.framework, F.recordedAt, ...COMPARED])) {
    const prev = latest.get(fields[F.framework]);
    if (!prev || (fields[F.recordedAt] ?? '') > (prev[F.recordedAt] ?? '')) latest.set(fields[F.framework], fields);
  }

  const now = new Date().toISOString();
  const changed = FRAMEWORKS.map((fw) => snapshotFields(fw, metrics, bench, commit)).filter((fields) => {
    const prev = latest.get(fields[F.framework]);
    return !prev || COMPARED.some((k) => (prev[k] ?? null) !== (fields[k] ?? null));
  });

  if (changed.length === 0) {
    log('✔ Snapshots: nothing changed since the last snapshot');
    return 0;
  }
  // Upsert on Key, so redeploying the same commit updates its rows instead of adding more.
  await airtable(cfg, SNAPSHOTS_TABLE, {
    method: 'PATCH',
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: [F.key] },
      records: changed.map((fields) => ({ fields: { ...fields, [F.recordedAt]: now } })),
      typecast: true,
    }),
  });
  log(`✔ Snapshots: recorded ${changed.map((f) => f[F.framework]).join(', ')} at ${commit}`);
  return changed.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await syncSnapshots();
}
