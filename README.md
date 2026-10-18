<h1 align="center">⏳ One App, Six Frameworks</h1>

<p align="center">
  The same holiday countdown, built <b>idiomatically</b> in React, Vue, Svelte, Solid, Angular and Astro against one spec,<br>
  then measured side by side from real production builds and from visitors' real browsers.
</p>

<p align="center">
  <a href="https://js-comparisons.vercel.app"><b>Live site</b></a> ·
  <a href="https://js-comparisons.vercel.app/#demos">Side-by-side demos</a> ·
  <a href="https://js-comparisons.vercel.app/#live">Live data</a> ·
  <a href="https://js-comparisons.vercel.app/docs/"><b>Docs</b></a> ·
  <a href="https://js-comparisons.vercel.app/docs/api-explorer/">API explorer</a>
</p>

<p align="center">
  <a href="https://github.com/mattmajestic/javascript-compare-frameworks/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/mattmajestic/javascript-compare-frameworks/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://js-comparisons.vercel.app"><img alt="Deployed on Vercel" src="https://img.shields.io/badge/deployed%20on-Vercel-000000?logo=vercel&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/docs/guides/live-data/"><img alt="Data in Airtable" src="https://img.shields.io/badge/data%20in-Airtable-18BFFF?logo=airtable&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/docs/api-explorer/"><img alt="OpenAPI 3.1" src="https://img.shields.io/badge/API-OpenAPI%203.1-85EA2D?logo=swagger&logoColor=black"></a>
  <a href="https://js-comparisons.vercel.app/docs/"><img alt="Docs: Starlight" src="https://img.shields.io/badge/docs-Starlight-BC52EE?logo=astro&logoColor=white"></a>
</p>

<p align="center">
  <a href="https://js-comparisons.vercel.app/demos/react/"><img alt="React" src="https://img.shields.io/badge/React-19.3-58c4dc?logo=react&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/demos/vue/"><img alt="Vue" src="https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/demos/svelte/"><img alt="Svelte" src="https://img.shields.io/badge/Svelte-5.57-ff3e00?logo=svelte&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/demos/solid/"><img alt="Solid" src="https://img.shields.io/badge/Solid-1.9-4f88c6?logo=solid&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/demos/angular/"><img alt="Angular" src="https://img.shields.io/badge/Angular-22.2-dd0031?logo=angular&logoColor=white"></a>
  <a href="https://js-comparisons.vercel.app/demos/astro/"><img alt="Astro" src="https://img.shields.io/badge/Astro-7.3-bc52ee?logo=astro&logoColor=white"></a>
</p>

---

Every demo shares its date logic, validation and styles through one core package, renders the same markup, and passes the same end-to-end suite. So the differences you see in bundle size, code and rendering speed come from the framework itself.

## Try it

| Framework | Live demo | Source | Paradigm |
| --- | --- | --- | --- |
| React | [▶ Open demo](https://js-comparisons.vercel.app/demos/react/) | [`apps/react`](apps/react) | Virtual DOM + hooks |
| Vue | [▶ Open demo](https://js-comparisons.vercel.app/demos/vue/) | [`apps/vue`](apps/vue) | Reactive refs + compiled templates |
| Svelte | [▶ Open demo](https://js-comparisons.vercel.app/demos/svelte/) | [`apps/svelte`](apps/svelte) | Compiler + runes |
| Solid | [▶ Open demo](https://js-comparisons.vercel.app/demos/solid/) | [`apps/solid`](apps/solid) | Fine-grained signals + JSX |
| Angular | [▶ Open demo](https://js-comparisons.vercel.app/demos/angular/) | [`apps/angular`](apps/angular) | Signals + DI, full platform |
| Astro | [▶ Open demo](https://js-comparisons.vercel.app/demos/astro/) | [`apps/astro`](apps/astro) | Static HTML + vanilla island |

Or open the **[comparison site](https://js-comparisons.vercel.app)** to run any two side by side, see the charts, and compare the code concept by concept.

## Results

### Build

| Framework | Version | JS shipped (gzip) | App source lines | Source files | Config lines |
| --- | --- | --- | --- | --- | --- |
| [React](https://js-comparisons.vercel.app/demos/react/) | 19.3.0 | 71.5 kB | 193 | 5 | 50 |
| [Vue](https://js-comparisons.vercel.app/demos/vue/) | 3.5.43 | 29.0 kB | 168 | 6 | 45 |
| [Svelte](https://js-comparisons.vercel.app/demos/svelte/) | 5.57.2 | 18.4 kB | 165 | 5 | 47 |
| [Solid](https://js-comparisons.vercel.app/demos/solid/) | 1.9.17 | 11.4 kB | 197 | 5 | 48 |
| [Angular](https://js-comparisons.vercel.app/demos/angular/) | 22.2.2 | 58.7 kB | 217 | 12 | 103 |
| [Astro](https://js-comparisons.vercel.app/demos/astro/) | 7.3.8 | 3.9 kB | 272 | 7 | 30 |

<sub>From <code>npm run build</code> (Oct 2026). Line counts skip blank lines. The shared <code>@compare/core</code> package is excluded from line counts but included in every bundle. The <a href="https://js-comparisons.vercel.app/#metrics">live site</a> always shows the latest numbers.</sub>

### Query & render benchmark

Each demo fetches rows from a mock API, then times state change → painted frame. Median of 10 runs after warm-up in headless Chromium:

| Framework | Render 1k rows | Render 10k rows | Update every 10th | Clear 10k | API query (10k) |
| --- | --- | --- | --- | --- | --- |
| [React](https://js-comparisons.vercel.app/demos/react/) | 45.5 ms | 422.8 ms | 48.6 ms | 50.0 ms | 17.4 ms |
| [Vue](https://js-comparisons.vercel.app/demos/vue/) | 46.6 ms | 328.3 ms | 48.1 ms | 37.0 ms | 17.3 ms |
| [Svelte](https://js-comparisons.vercel.app/demos/svelte/) | 48.0 ms | 336.0 ms | 39.5 ms | 24.3 ms | 16.9 ms |
| [Solid](https://js-comparisons.vercel.app/demos/solid/) | 47.0 ms | 368.9 ms | 47.3 ms | 27.6 ms | 17.6 ms |
| [Angular](https://js-comparisons.vercel.app/demos/angular/) | 47.9 ms | 347.9 ms | 52.0 ms | 55.5 ms | 22.2 ms |
| [Astro](https://js-comparisons.vercel.app/demos/astro/) (vanilla) | 49.1 ms | 306.4 ms | 41.4 ms | 23.6 ms | 16.8 ms |

<sub>From <code>npm run bench</code>. Absolute numbers depend on the machine, so compare the frameworks with each other. For numbers from visitors' devices, see <a href="https://js-comparisons.vercel.app/#live">Live data</a>. Method: <a href="https://js-comparisons.vercel.app/docs/guides/benchmarks/">Benchmarks guide</a>.</sub>

### Takeaways

- **Svelte and Vue** need the least code: two-way binding (`bind:value`, `v-model`) and auto-tracked derived values remove most of the glue.
- **Solid** ships the smallest framework bundle. Its JSX looks like React, but components run once and signals update the DOM directly.
- **React** ships the most JavaScript, and its dependency arrays are the easiest place to introduce bugs.
- **Angular** has the most files and config, but signals, `@for`/`@if` and standalone components make it far leaner than it used to be.
- **Astro** ships almost no JavaScript, but its interactive island is plain DOM code. That makes it the longest source here, and shows exactly what a framework does for you.
- **API query time doesn't depend on the framework.** It's the same `fetch()` everywhere, so pick a framework for rendering and DX, not data fetching.
- **Idioms matter more than frameworks.** Without `memo`, React re-renders all 10,000 rows on every clock tick. Solid's update time halved after switching to a store with `reconcile`.

## <img src="docs/public/airtable.svg" width="24" height="24" alt="Airtable logo"> Live data in Airtable

Countdowns added in any demo, benchmark runs from visitors' browsers, and the latest build metrics are stored in an [Airtable](https://airtable.com) base. The site's [Live section](https://js-comparisons.vercel.app/#live) reads aggregate numbers back. Event names are never shown.

```
demo (any framework) ──POST──▶ /api/events/, /api/bench/ ──▶ Airtable ◀── db/sync.mjs (production deploys)
site Live section    ◀──GET─── /api/stats/ (counts + averages, edge-cached 30 s)
```

| Table | What it holds | Size |
| --- | --- | --- |
| **Events** | Custom countdowns added or removed, and which demo they came from | One row per countdown |
| **Benchmarks** | Visitors' benchmark runs, as running averages per framework × operation × browser | About 120 rows at most |
| **Snapshots** | The latest build metrics and lab benchmark, overwritten in place | Always 6 rows |

The Airtable token stays on the server, and no framework code knows about Airtable, because syncing lives in the shared core. Setup takes five steps: [Live data guide → Setup](https://js-comparisons.vercel.app/docs/guides/live-data/#setup).

## API

Three Vercel functions in [`api/`](api) keep the Airtable token off the browser. They're described by an **OpenAPI 3.1** spec and rendered with **Swagger UI** in the [API explorer](https://js-comparisons.vercel.app/docs/api-explorer/).

| Method | Path | What it does |
| --- | --- | --- |
| `POST` | `/api/events/` | Records countdowns added or removed in a demo (upserts on event id) |
| `POST` | `/api/bench/` | Folds visitors' benchmark runs into running averages |
| `GET` | `/api/stats/` | Aggregate counts and averages for the Live section (no names) |

```bash
curl https://js-comparisons.vercel.app/api/stats/
```

Spec: [`docs/public/openapi.yaml`](docs/public/openapi.yaml) · Reference: [API guide](https://js-comparisons.vercel.app/docs/reference/api/)

## Quick start

Requires Node 22.12+.

```bash
npm install
npm run dev        # every demo, the site (http://localhost:5100) and the docs (http://localhost:5110/docs/)
npm run build      # build all demos, regenerate metrics, assemble site + docs
npm run e2e        # one Playwright suite against every demo
```

Every command: [Commands reference](https://js-comparisons.vercel.app/docs/reference/commands/).

## Documentation

The full docs are at **[js-comparisons.vercel.app/docs](https://js-comparisons.vercel.app/docs/)**, built with [Starlight](https://starlight.astro.build) from [`docs/`](docs/src/content/docs) and deployed with the site.

| Guide | What's in it |
| --- | --- |
| [Getting started](https://js-comparisons.vercel.app/docs/getting-started/) | Install, dev ports, build, preview and test |
| [Architecture](https://js-comparisons.vercel.app/docs/guides/architecture/) | Repo layout, the spec, the shared core, how the comparison stays fair, concept cheat sheet |
| [Benchmarks](https://js-comparisons.vercel.app/docs/guides/benchmarks/) | How the lab and real-world benchmarks are measured, and how to read them |
| [Live data (Airtable)](https://js-comparisons.vercel.app/docs/guides/live-data/) | Tables and fields, data flow, privacy, setup, backups and limits |
| [Deploying](https://js-comparisons.vercel.app/docs/guides/deploying/) | Vercel, environment variables, and what happens on each deploy |
| [Adding a framework](https://js-comparisons.vercel.app/docs/guides/adding-a-framework/) | Checklist for a seventh demo |
| [API reference](https://js-comparisons.vercel.app/docs/reference/api/) | Endpoints, payloads, validation, status codes and caching |
| [API explorer](https://js-comparisons.vercel.app/docs/api-explorer/) | The OpenAPI spec in Swagger UI, with `GET /api/stats/` live |
| [Core package](https://js-comparisons.vercel.app/docs/reference/core/) | The `@compare/core` API and the markup every demo renders |
| [Commands](https://js-comparisons.vercel.app/docs/reference/commands/) | Every npm script |

To edit the docs, change the Markdown in [`docs/src/content/docs`](docs/src/content/docs) and run `npm run dev:docs`.

## Repo layout

```
apps/        One demo per framework: react, vue, svelte, solid, angular, astro
packages/    core: shared logic, validation, persistence, sync, benchmark, CSS (+ unit tests)
site/        Astro comparison site: demos, charts, live data, code comparison
docs/        Starlight docs site and the OpenAPI spec (served at /docs/)
api/         Vercel functions: /api/events, /api/bench, /api/stats → Airtable
db/          Airtable schema as code + migrate, sync and backup scripts
e2e/         One Playwright spec run against every demo, plus the site
scripts/     build, bench, dev and serve
```

---

<p align="center">
  Built by <a href="https://www.youtube.com/@majesticcoding">Majestic Coding</a> ·
  Hosted on <a href="https://vercel.com">Vercel</a> ·
  Data in <a href="https://airtable.com">Airtable</a> ·
  Docs with <a href="https://starlight.astro.build">Starlight</a>
</p>
