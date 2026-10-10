# One App, Six Frameworks ⏳

The same holiday countdown app built **idiomatically** in **React, Vue, Svelte, Solid, Angular and Astro**, all to a single spec. They share their logic and styles, so the only differences between them come from the framework. Every app is measured from its production build and checked against one end-to-end test suite.

**Live comparison site:** <https://js-comparisons.vercel.app> (side-by-side demos, charts, and concept-by-concept code)

![CI](https://github.com/mattmajestic/javascript-compare-frameworks/actions/workflows/ci.yml/badge.svg)

## Results

| Framework | Version | JS shipped (gzip) | App source lines | Source files | Config lines |
| --- | --- | --- | --- | --- | --- |
| React | 19.3.0 | 69.9 kB | 146 | 4 | 50 |
| Vue | 3.5.43 | 27.4 kB | 125 | 5 | 45 |
| Svelte | 5.57.2 | 16.7 kB | 123 | 4 | 47 |
| Solid | 1.9.17 | 7.5 kB | 144 | 4 | 48 |
| Angular | 22.2.2 | 56.9 kB | 167 | 10 | 103 |
| Astro | 7.3.8 | 1.9 kB | 198 | 5 | 30 |

<sub>Snapshot from `npm run build` (Oct 2026). Line counts skip blank lines. The shared `@compare/core` package is excluded from line counts but included in every bundle. The live site always shows the latest numbers from `site/src/data/metrics.json`.</sub>

**Takeaways**

- **Svelte and Vue** need the least code: two-way binding (`bind:value`, `v-model`) and auto-tracked derived values remove most of the glue.
- **Solid** ships the smallest framework bundle. Its JSX looks like React, but components run once and signals update the DOM directly.
- **React** ships the most JavaScript, and its dependency arrays are the easiest place to introduce bugs.
- **Angular** has the most files and config, but signals, the `@for`/`@if` control flow and standalone components make it far leaner than it used to be.
- **Astro** ships almost no JavaScript, but its interactive island is plain DOM code. That makes it the longest source here, and it shows exactly what a framework does for you.

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
| Custom events persisted to `localStorage` (shared across demos) | Side effects |

All six render identical markup ([the contract](packages/core/README.md)) against one shared stylesheet, and [`e2e/countdown.spec.ts`](e2e/countdown.spec.ts) runs the same tests against each demo with a frozen clock.

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
site/         Astro comparison site: side-by-side demos, metrics charts, code comparison
e2e/          One Playwright spec run against every demo
scripts/      build (build + measure + assemble), dev (run everything), serve (preview)
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
npm run preview        # serve the assembled site at http://localhost:5100
npm run e2e            # Playwright suite against the built site (run `npx playwright install chromium` once)
```

## Deploying

The whole thing deploys as **one static site**. [`vercel.json`](vercel.json) runs `npm run build` from the repo root and serves `site/dist`, so each demo is available at `/demos/<framework>/`.

## Adding a framework

1. Add an entry to [`packages/core/src/frameworks.js`](packages/core/src/frameworks.js) (id, npm package, colour, dev port, verdict).
2. Create `apps/<id>` with a `@compare/<id>` package that has `dev` and `build` scripts, emitting relative asset URLs to `dist/`.
3. Render the [markup contract](packages/core/README.md) and import `@compare/core/styles.css`.
4. Add `#region state|derived|effects|list` markers, plus file entries in [`site/src/lib/code.ts`](site/src/lib/code.ts) for the component and form comparisons.
5. Run `npm run build && npm run e2e`. The spec picks up the new framework automatically.
