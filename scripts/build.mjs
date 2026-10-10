// Builds every demo, measures it, then builds the comparison site with each
// demo nested under /demos/<id>/ so the whole thing deploys as one static site.
//
//   node scripts/build.mjs            build demos + metrics + site
//   node scripts/build.mjs --no-site  build demos + metrics only

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { FRAMEWORKS } from '@compare/core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const withSite = !process.argv.includes('--no-site');

function run(workspace, env = {}) {
  const started = performance.now();
  const result = spawnSync('npm', ['run', 'build', '-w', workspace], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    console.error(`\n✖ ${workspace} failed to build`);
    process.exit(result.status ?? 1);
  }
  return Math.round(performance.now() - started);
}

function walk(dir, skip = []) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (skip.includes(entry.name)) return [];
    return entry.isDirectory() ? walk(path, skip) : [path];
  });
}

/** Non-blank lines, ignoring the `#region` markers used by the comparison site. */
function countLines(file) {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !/#(end)?region\b/.test(line)).length;
}

function assetSizes(distDir) {
  const totals = { js: { raw: 0, gzip: 0 }, css: { raw: 0, gzip: 0 }, html: { raw: 0, gzip: 0 } };
  for (const file of walk(distDir)) {
    const kind = { '.js': 'js', '.mjs': 'js', '.css': 'css', '.html': 'html' }[extname(file)];
    if (!kind) continue;
    const content = readFileSync(file);
    totals[kind].raw += content.length;
    totals[kind].gzip += gzipSync(content, { level: 9 }).length;
  }
  return totals;
}

function measure(framework, buildMs) {
  const appDir = join(root, 'apps', framework.id);
  const sourceFiles = walk(join(appDir, 'src'));
  const projectFiles = readdirSync(appDir).filter((name) => statSync(join(appDir, name)).isFile());
  const require = createRequire(join(appDir, 'package.json'));
  const { version } = JSON.parse(readFileSync(require.resolve(`${framework.package}/package.json`), 'utf8'));

  return {
    version,
    buildMs,
    bundle: assetSizes(join(appDir, 'dist')),
    source: {
      files: sourceFiles.map((file) => relative(appDir, file)).sort(),
      lines: sourceFiles.reduce((sum, file) => sum + countLines(file), 0),
    },
    config: {
      files: projectFiles.sort(),
      lines: projectFiles.reduce((sum, name) => sum + countLines(join(appDir, name)), 0),
    },
  };
}

const metrics = { generatedAt: new Date().toISOString(), node: process.version, frameworks: {} };

for (const framework of FRAMEWORKS) {
  console.log(`\n▶ Building ${framework.name}`);
  rmSync(join(root, 'apps', framework.id, 'dist'), { recursive: true, force: true });
  const env = framework.id === 'astro' ? { DEMO_BASE: '/demos/astro/' } : {};
  metrics.frameworks[framework.id] = measure(framework, run(`@compare/${framework.id}`, env));
}

const metricsFile = join(root, 'site', 'src', 'data', 'metrics.json');
writeFileSync(metricsFile, `${JSON.stringify(metrics, null, 2)}\n`);
console.log(`\n✔ Wrote ${relative(root, metricsFile)}`);

if (withSite) {
  console.log('\n▶ Building comparison site');
  run('@compare/site');
  for (const { id } of FRAMEWORKS) {
    cpSync(join(root, 'apps', id, 'dist'), join(root, 'site', 'dist', 'demos', id), { recursive: true });
  }
  console.log('\n✔ site/dist is ready. Run `npm run preview` to serve it.');
}
