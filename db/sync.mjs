// Keep Airtable's Snapshots table up to date with the latest build metrics
// and lab benchmark: one row per framework, overwritten in place.
//
//   npm run db:sync            manual run (reads .env)
//   npm run build on Vercel    automatic, production deploys only (see scripts/build.mjs)
//
// A row is only written when one of its measured values changed. Build time
// is stored but ignored for that check, since it differs on every run.

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
    [F.key]: fw.name,
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

  const current = new Map(
    (await listAll(cfg, SNAPSHOTS_TABLE, [F.key, ...COMPARED])).map(({ fields }) => [fields[F.key], fields]),
  );

  const now = new Date().toISOString();
  const changed = FRAMEWORKS.map((fw) => snapshotFields(fw, metrics, bench, commit)).filter((fields) => {
    const prev = current.get(fields[F.key]);
    return !prev || COMPARED.some((k) => (prev[k] ?? null) !== (fields[k] ?? null));
  });

  if (changed.length === 0) {
    log('✔ Snapshots: already up to date');
    return 0;
  }
  // Upsert on Key (the framework name), so each framework keeps a single row.
  await airtable(cfg, SNAPSHOTS_TABLE, {
    method: 'PATCH',
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: [F.key] },
      records: changed.map((fields) => ({ fields: { ...fields, [F.recordedAt]: now } })),
      typecast: true,
    }),
  });
  log(`✔ Snapshots: updated ${changed.map((f) => f[F.framework]).join(', ')} (${commit})`);
  return changed.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await syncSnapshots();
}
