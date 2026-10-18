# One App, Six Frameworks ⏳

The same holiday countdown app built **idiomatically** in **React, Vue, Svelte, Solid, Angular and Astro**, all to a single spec. They share their logic and styles, so the only differences between them come from the framework. Every app is measured from its production build and checked against one end-to-end test suite.

**Live comparison site:** <https://js-comparisons.vercel.app> (side-by-side demos, charts, concept-by-concept code, and live data from visitors)

![CI](https://github.com/mattmajestic/javascript-compare-frameworks/actions/workflows/ci.yml/badge.svg)

## Results

| Framework | Version | JS shipped (gzip) | App source lines | Source files | Config lines |
| --- | --- | --- | --- | --- | --- |
| React | 19.3.0 | 70.9 kB | 192 | 5 | 50 |
| Vue | 3.5.43 | 28.5 kB | 167 | 6 | 45 |
| Svelte | 5.57.2 | 17.9 kB | 164 | 5 | 47 |
| Solid | 1.9.17 | 10.8 kB | 196 | 5 | 48 |
| Angular | 22.2.2 | 58.1 kB | 216 | 12 | 103 |
| Astro | 7.3.8 | 3.3 kB | 271 | 7 | 30 |

<sub>Snapshot from `npm run build` (Oct 2026). Line counts skip blank lines. The shared `@compare/core` package is excluded from line counts but included in every bundle. The live site always shows the latest numbers from `site/src/data/metrics.json`.</sub>

### Query & render benchmark

Each demo queries rows from a mock API (a real `fetch()` plus JSON parsing of a Blob URL, so there's no network noise), then times the frames until they're painted. Median of 10 runs after warm-up, headless Chromium:

| Framework | Render 1k rows | Render 10k rows | Update every 10th (of 10k) | Clear 10k | API query (10k) |
| --- | --- | --- | --- | --- | --- |
| React | 45.5 ms | 422.8 ms | 48.6 ms | 50.0 ms | 17.4 ms |
| Vue | 46.6 ms | 328.3 ms | 48.1 ms | 37.0 ms | 17.3 ms |
| Svelte | 48.0 ms | 336.0 ms | 39.5 ms | 24.3 ms | 16.9 ms |
| Solid | 47.0 ms | 368.9 ms | 47.3 ms | 27.6 ms | 17.6 ms |
| Angular | 47.9 ms | 347.9 ms | 52.0 ms | 55.5 ms | 22.3 ms |
| Astro (vanilla) | 49.1 ms | 306.4 ms | 41.4 ms | 23.6 ms | 16.8 ms |

<sub>Measured with `npm run bench`, which writes `site/src/data/bench.json`. Absolute numbers depend on the machine, so compare frameworks against each other.</sub>

**Takeaways**

- **Svelte and Vue** need the least code: two-way binding (`bind:value`, `v-model`) and auto-tracked derived values remove most of the glue.
- **Solid** ships the smallest framework bundle. Its JSX looks like React, but components run once and signals update the DOM directly.
- **React** ships the most JavaScript, and its dependency arrays are the easiest place to introduce bugs.
- **Angular** has the most files and config, but signals, the `@for`/`@if` control flow and standalone components make it far leaner than it used to be.
- **Astro** ships almost no JavaScript, but its interactive island is plain DOM code. That makes it the longest source here, and it shows exactly what a framework does for you.
- **API query time doesn't depend on the framework.** It's the same `fetch()` everywhere, so pick a framework for rendering and DX, not data fetching.
- **At 1,000 rows every framework is within a few milliseconds**, because the browser's layout and paint dominate. At 10,000 rows hand-written DOM code is fastest and React is slowest. Svelte leads the component frameworks on updates and clears.
- **Idioms matter more than frameworks.** Without `memo`, React re-renders all 10,000 rows on every clock tick. Solid's update time halved after switching from a plain signal to a store with `reconcile`, at the cost of slower initial loads and 3 kB more bundle.

## The spec

Every demo implements the same features, and each one exercises a core concept:

| Feature | Concept |
| --- | --- |
| Live days/hours/minutes/seconds countdown | Effects, timers and cleanup |
| Holidays with correctly computed dates (Thanksgiving = 4th Thursday of November) | Shared logic |
| Holidays and custom events merged and sorted soonest-first | Derived state |
| Selecting an event switches the theme | Lists, keys, events |
| The countdown hero as a child component | Components and props |
| Add a custom countdown with validation | Forms and binding |
| Custom events persisted to `localStorage` (shared across demos) and synced to Airtable | Side effects |
| Query, render, update and clear up to 10,000 rows, with timings | Big lists and rendering performance |

All six render identical markup ([the contract](packages/core/README.md)) against one shared stylesheet, and [`e2e/countdown.spec.ts`](e2e/countdown.spec.ts) runs the same tests against each demo with a frozen clock.

## Live data (Airtable)

The demos write to an [Airtable](https://airtable.com) base, and the site's **Live** section reads aggregate numbers back:

- **Events**: every custom countdown added or removed in any demo, with the framework it came from. Removing one marks it `Deleted` rather than erasing the row.
- **Benchmarks**: real-world benchmark runs from visitors' browsers, kept as running averages per framework × operation × browser (around 120 rows at most, so it fits the free plan).
- **Snapshots**: a history of the build metrics and lab benchmark (`metrics.json` and `bench.json`). Every production deploy records one row per framework whose numbers changed. Build time alone doesn't count as a change, so the table grows only when something real moves, like a version bump or a bundle size change.

```
demo (any framework) ──POST──▶ /api/events/, /api/bench/ ──▶ Airtable
site Live section ◀──GET── /api/stats/ (counts + averages only, edge-cached 30 s) ◀── Airtable
```

How it fits together:

- The Airtable token stays server-side, in [Vercel functions](api/). The browser only ever talks to `/api/*`.
- Syncing lives in the shared core ([`sync.js`](packages/core/src/sync.js), `saveCustomEvents`, `benchData`/`startRenderTimer`), so no framework code knows about Airtable. Each demo reports only its own changes, even with two demos open side by side.
- Event names are written to Airtable but never read back or shown on the site.
- Automated browsers (`npm run bench`, the e2e suite) don't report, so they can't skew the real-world numbers. Without the API (local dev servers), syncing does nothing and the demos work exactly as before.
- The table schema lives in code in [`db/schema.mjs`](db/schema.mjs).

### Setup

1. Create a [personal access token](https://airtable.com/create/tokens) with the `data.records:read`, `data.records:write`, `schema.bases:read` and `schema.bases:write` scopes, limited to your base.
2. Copy [`.env.example`](.env.example) to `.env` and fill in `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` (the `app…` part of the base's URL).
3. Run `npm run db:migrate` to create the tables and fields. It only adds what's missing, so it's safe to re-run after changing the schema.
4. Add the same variables in Vercel → Settings → Environment Variables (Production, and Preview if you want PR previews to sync).

To try the full flow locally, run `npx vercel dev`.

### Keeping the data safe

- `npm run db:backup` downloads every table, schema included, to `db/backups/airtable-<time>.json`. That folder is gitignored because it contains the event names visitors typed, so keep backups somewhere private.
- `npm run db:sync` records a snapshot by hand, e.g. after `npm run bench`. Production deploys do this automatically, and a failed sync never fails the build.
- Airtable keeps its own revision history per record, and `db/schema.mjs` with `npm run db:migrate` can rebuild the tables in a fresh base.

## Concept cheat sheet

| | React | Vue | Svelte 5 | Solid | Angular | Astro (vanilla) |
| --- | --- | --- | --- | --- | --- | --- |
| State | `useState` | `ref` | `$state` | `createSignal` | `signal` | `let` + manual render |
| Derived | recompute in render | `computed` | `$derived` | `createMemo` / function | `computed` | recompute in `render()` |
| Effect | `useEffect` + deps | `onMounted` / `watch` | `$effect` | `createEffect` / `onCleanup` | `effect` / `DestroyRef` | `setInterval` |
| Two-way input | `value` + `onChange` | `v-model` | `bind:value` | `value` + `onInput` | `[(ngModel)]` | `FormData` |
| List | `.map()` + `key` | `v-for` + `:key` | `{#each (key)}` | `<For>` / `<Index>` | `@for (track)` | `<template>` + `cloneNode` |
| Conditional | `&&` / ternary | `v-if` | `{#if}` | `<Show>` | `@if` | `hidden` |

## Repo layout

```
apps/
  react/      Vite + React 19
  vue/        Vite + Vue 3 (<script setup>)
  svelte/     Vite + Svelte 5 (runes)
  solid/      Vite + Solid
  angular/    Angular CLI (standalone, signals, zoneless)
  astro/      Astro, static HTML + a vanilla TypeScript island
packages/
  core/       Shared date logic, validation, persistence, framework metadata, CSS (+ unit tests)
site/         Astro comparison site: side-by-side demos, metrics charts, live data, code comparison
api/          Vercel functions: /api/events, /api/bench, /api/stats (Airtable)
db/           Airtable schema as code, plus migrate, sync and backup scripts
e2e/          One Playwright spec run against every demo
scripts/      build (build + measure + assemble), bench (runtime benchmark), dev (run everything), serve (preview)
```

## Getting started

Requires Node 22.12+.

```bash
npm install

npm run dev            # every demo + the site, each on its own port (site: http://localhost:5100)
npm run dev:svelte     # or just one demo (dev:react, dev:vue, dev:solid, dev:angular, dev:astro, dev:site)

npm test               # unit tests for the shared core
npm run typecheck      # tsc / vue-tsc / svelte-check / astro check
npm run build          # build all demos, regenerate metrics, build the site with demos under /demos/<id>/
npm run preview        # serve the assembled site at http://localhost:4173
npm run e2e            # Playwright suite against the built site (run `npx playwright install chromium` once)
npm run bench          # run the query & render benchmark in Chromium and update site/src/data/bench.json
npm run db:migrate     # create/update the Airtable tables from db/schema.mjs (needs .env)
npm run db:sync        # record a metrics + benchmark snapshot in Airtable
npm run db:backup      # download every Airtable table to db/backups/ (gitignored)
```

## Deploying

The whole thing deploys to Vercel as **one static site plus three serverless functions**. [`vercel.json`](vercel.json) runs `npm run build` from the repo root and serves `site/dist`, so each demo is available at `/demos/<framework>/`. The functions in [`api/`](api/) are picked up automatically and need the Airtable env vars (see [Live data](#live-data-airtable)). Without them, the site still works and the Live section says its data is unavailable.

## Adding a framework

1. Add an entry to [`packages/core/src/frameworks.js`](packages/core/src/frameworks.js) (id, npm package, colour, dev port, verdict).
2. Create `apps/<id>` with a `@compare/<id>` package that has `dev` and `build` scripts, emitting relative asset URLs to `dist/`.
3. Render the [markup contract](packages/core/README.md) (including `data-framework="<id>"` on `.app`, which tells Airtable sync where events came from) and import `@compare/core/styles.css`.
4. Add a benchmark component that renders the `.bench` markup using `benchData()` and `startRenderTimer()` from core.
5. Add `#region state|derived|effects|list` markers, plus file entries in [`site/src/lib/code.ts`](site/src/lib/code.ts) for the component, form and benchmark comparisons.
6. Run `npm run build && npm run e2e && npm run bench`. The spec and the benchmark pick up the new framework automatically.
7. Run `npm run db:migrate` to add the framework to Airtable's Framework fields. Writes still work before you do, because the API creates missing choices on the fly.
