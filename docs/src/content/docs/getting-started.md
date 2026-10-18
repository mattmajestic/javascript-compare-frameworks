---
title: Getting started
description: Install, run every demo locally, and build the site.
---

## Requirements

- **Node 22.12 or newer** (`.nvmrc` pins the version CI uses)
- npm (the repo is an npm workspaces monorepo)

## Install and run

```bash
git clone https://github.com/mattmajestic/javascript-compare-frameworks.git
cd javascript-compare-frameworks
npm install

npm run dev
```

`npm run dev` starts every demo, the comparison site and these docs, each on its own port:

| Target | URL |
| --- | --- |
| Comparison site | http://localhost:5100 |
| Docs | http://localhost:5110/docs/ |
| React | http://localhost:5101 |
| Vue | http://localhost:5102 |
| Svelte | http://localhost:5103 |
| Solid | http://localhost:5104 |
| Angular | http://localhost:5105 |
| Astro | http://localhost:5106 |

To run just one, use `npm run dev:react`, `dev:vue`, `dev:svelte`, `dev:solid`, `dev:angular`, `dev:astro`, `dev:site` or `dev:docs`.

:::note
Local dev servers have no `/api` routes, so Airtable syncing quietly does nothing and the demos work exactly as before. To run the API locally too, use `npx vercel dev`. See [Live data](../guides/live-data/#trying-it-locally).
:::

## Build and preview

```bash
npm run build     # build every demo, regenerate metrics, build the site and docs
npm run preview   # serve the assembled site at http://localhost:4173
```

The build assembles one static site in `site/dist`: the comparison site at `/`, each demo at `/demos/<framework>/`, and these docs at `/docs/`.

## Test

```bash
npm test            # unit tests for the shared core
npm run typecheck   # tsc, vue-tsc, svelte-check and astro check
npm run e2e         # Playwright, against the built site
```

Run `npx playwright install chromium` once before the first e2e run. Every command is listed in [Commands](../reference/commands/).
