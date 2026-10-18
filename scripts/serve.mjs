// Tiny static server for the assembled site (site/dist), used by
// `npm run preview` and the Playwright suite. No dependencies.

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'site', 'dist');
// Not 5100: that is the site's dev server, which may be running at the same time.
const port = Number(process.env.PORT ?? 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

if (!existsSync(dist)) {
  console.error('site/dist not found. Run `npm run build` first.');
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = join(dist, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));

  if (existsSync(path) && statSync(path).isDirectory()) {
    // Demos use relative asset URLs, so directories must end with a slash.
    if (!url.pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
      return;
    }
    path = join(path, 'index.html');
  }

  if (!existsSync(path)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }

  res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
  createReadStream(path).pipe(res);
}).listen(port, () => console.log(`Serving site/dist at http://localhost:${port}`));
