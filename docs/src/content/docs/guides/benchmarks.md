---
title: Benchmarks
description: How the query & render benchmark works, in the lab and in visitors' browsers.
---

Every demo has a **Query & render benchmark** panel with four operations:

| Operation | What happens |
| --- | --- |
| Query 1,000 rows | Fetch and parse 1,000 rows, then render them |
| Query 10,000 rows | The same with 10,000 rows |
| Update every 10th | Rename 1,000 of the 10,000 rows |
| Clear | Remove every row |

## What's timed

- **Query time**: `fetch()` plus JSON parsing of a Blob URL, so there's no network noise. It's the same code in every framework, so it lands in the same band everywhere. That's the point: data fetching doesn't depend on the framework.
- **Render time**: from the state change to the next painted frame (`requestAnimationFrame` followed by `setTimeout`). This covers the framework's scheduling, DOM work, style, layout and paint.

Every demo calls the same two core functions, `benchData(op, rows)` and `startRenderTimer()`, so every framework is timed the same way. The row data comes from a seeded random generator, so every framework gets identical data.

## Lab numbers

```bash
npm run build
npm run bench
```

`scripts/bench.mjs` runs each operation in headless Chromium, takes the median of 10 runs after warm-up, and writes `site/src/data/bench.json`. The site's [Performance section](https://js-comparisons.vercel.app/#performance) and the README read from that file.

Absolute numbers depend on the machine, so compare the frameworks with each other, not the milliseconds.

## Real-world numbers

When a visitor runs the benchmark in any demo, the result is reported to [`POST /api/bench/`](../../reference/api/#post-apibench) and folded into running averages in Airtable, per framework × operation × browser. The site's [Live section](https://js-comparisons.vercel.app/#live) shows those averages.

- Runs are batched: the core waits 3 seconds after the last run (or until the page is hidden) and sends up to 20 runs in one request.
- Each page reports at most 100 runs.
- **Automated browsers are skipped** (`navigator.webdriver`), so `npm run bench` and the e2e suite never skew the real-world numbers.
- Only a coarse browser family (Chrome, Edge, Firefox, Safari, Other) is stored, never the full user agent.

## Reading the results

- At **1,000 rows** every framework is within a few milliseconds, because the browser's layout and paint dominate.
- At **10,000 rows** the gaps open up. Hand-written DOM code (Astro) is fastest and React is slowest.
- **Idioms matter more than frameworks.** Without `memo`, React re-renders all 10,000 rows on every clock tick. Solid's update time halved after switching to a store with `reconcile`.
