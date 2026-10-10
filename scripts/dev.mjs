// Starts every demo plus the comparison site in dev mode, with prefixed logs.
// In dev the site embeds each demo from its own port (see FRAMEWORKS[].port).

import { spawn } from 'node:child_process';
import { FRAMEWORKS } from '@compare/core';

const targets = [...FRAMEWORKS.map((f) => ({ id: f.id, port: f.port })), { id: 'site', port: 5100 }];
const width = Math.max(...targets.map((t) => t.id.length));

const children = targets.map(({ id }) => {
  const child = spawn('npm', ['run', 'dev', '-w', `@compare/${id}`], { env: { ...process.env, FORCE_COLOR: '1' } });
  const prefix = `${id.padEnd(width)} │ `;
  const pipe = (stream, out) =>
    stream.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) if (line.trim()) out.write(prefix + line + '\n');
    });
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  return child;
});

console.log(targets.map(({ id, port }) => `  ${id.padEnd(width)}  http://localhost:${port}/`).join('\n') + '\n');

const stop = () => {
  for (const child of children) child.kill('SIGTERM');
  process.exit();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
