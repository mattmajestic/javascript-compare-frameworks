// Starts every demo plus the comparison site in dev mode, with prefixed logs.
// In dev the site embeds each demo from its own port (see FRAMEWORKS[].port).

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { FRAMEWORKS } from '@compare/core';

const targets = [
  ...FRAMEWORKS.map((f) => ({ id: f.id, port: f.port })),
  { id: 'site', port: 5100 },
  { id: 'docs', port: 5110 },
];
const width = Math.max(...targets.map((t) => t.id.length));

const isFree = (port) =>
  new Promise((resolve) => {
    const server = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => server.close(() => resolve(true)))
      .listen(port);
  });

const busy = [];
for (const target of targets) if (!(await isFree(target.port))) busy.push(target);
if (busy.length) {
  console.error(`These dev ports are already in use: ${busy.map((t) => `${t.port} (${t.id})`).join(', ')}`);
  console.error('Is another `npm run dev` still running? Find the process with `lsof -i :<port>` and stop it.');
  process.exit(1);
}

let stopping = false;
const children = [];

// Each dev server runs in its own process group, so stopping kills the whole
// tree (npm -> sh -> vite/ng/astro), not just the npm wrapper.
function killAll() {
  stopping = true;
  for (const child of children) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      // Already exited.
    }
  }
}

function stop(code = 0) {
  if (stopping) return;
  killAll();
  process.exit(code);
}

for (const { id } of targets) {
  const child = spawn('npm', ['run', 'dev', '-w', `@compare/${id}`], {
    detached: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  const prefix = `${id.padEnd(width)} │ `;
  const pipe = (stream, out) =>
    stream.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) if (line.trim()) out.write(prefix + line + '\n');
    });
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    if (stopping) return;
    console.error(`\n${id} dev server exited (code ${code}). Stopping the others.`);
    stop(code || 1);
  });
  children.push(child);
}

console.log(targets.map(({ id, port }) => `  ${id.padEnd(width)}  http://localhost:${port}/`).join('\n') + '\n');

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
process.on('SIGHUP', () => stop());
process.on('exit', killAll);
