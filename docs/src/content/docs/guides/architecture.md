---
title: Architecture
description: How the monorepo is laid out, what the shared core does, and how the comparison stays fair.
---

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
  core/       Shared logic, validation, persistence, sync, benchmark, CSS (+ unit tests)
site/         Astro comparison site: side-by-side demos, charts, live data, code comparison
docs/         These docs (Astro Starlight) and the OpenAPI spec
api/          Vercel functions: /api/events, /api/bench, /api/stats → Airtable
db/           Airtable schema as code + migrate, sync and backup scripts
e2e/          One Playwright spec run against every demo, plus the site
scripts/      build, bench, dev and serve
```

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
| Custom events persisted to `localStorage` and synced to Airtable | Side effects |
| Query, render, update and clear up to 10,000 rows, with timings | Big lists and rendering performance |

## The shared core

[`@compare/core`](../../reference/core/) holds everything that isn't framework code: date logic, form validation, persistence, Airtable sync, the benchmark harness, framework metadata and the stylesheet. Each app folder therefore contains **only** framework code, which is what makes line counts and bundle sizes comparable.

Two parts of the core deserve a closer look:

- **Sync without framework code.** `saveCustomEvents()` and `startRenderTimer()` report to the API themselves, so no demo knows Airtable exists. See [Live data](../live-data/).
- **The markup contract.** Every demo renders [the same HTML structure](../../reference/core/#markup-contract). One stylesheet styles it, and one e2e suite tests it.

## How the comparison stays fair

- **Same spec, same markup, same styles.** Only the framework layer differs.
- **Shared logic is excluded from line counts but included in every bundle**, so bundles compare like for like.
- **Production builds only.** Every number on the site comes from `npm run build`, measured by `scripts/build.mjs`.
- **One test suite.** [`e2e/countdown.spec.ts`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/e2e/countdown.spec.ts) runs the same assertions against every demo with a frozen clock.
- **Idiomatic code.** Each demo uses its framework's normal approach for large immutable data: React `memo`, Vue `shallowRef`, Svelte `$state.raw`, a Solid store with `reconcile`, and Angular `OnPush`.

## Concept cheat sheet

| | React | Vue | Svelte 5 | Solid | Angular | Astro (vanilla) |
| --- | --- | --- | --- | --- | --- | --- |
| State | `useState` | `ref` | `$state` | `createSignal` | `signal` | `let` + manual render |
| Derived | recompute in render | `computed` | `$derived` | `createMemo` / function | `computed` | recompute in `render()` |
| Effect | `useEffect` + deps | `onMounted` / `watch` | `$effect` | `createEffect` / `onCleanup` | `effect` / `DestroyRef` | `setInterval` |
| Two-way input | `value` + `onChange` | `v-model` | `bind:value` | `value` + `onInput` | `[(ngModel)]` | `FormData` |
| List | `.map()` + `key` | `v-for` + `:key` | `{#each (key)}` | `<For>` / `<Index>` | `@for (track)` | `<template>` + `cloneNode` |
| Conditional | `&&` / ternary | `v-if` | `{#if}` | `<Show>` | `@if` | `hidden` |
