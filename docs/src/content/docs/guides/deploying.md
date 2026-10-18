---
title: Deploying
description: How the project deploys to Vercel, and what happens on each deploy.
---

Everything is hosted on **Vercel**: one static site plus three serverless functions.

## What gets deployed

| Path | What it is | Source |
| --- | --- | --- |
| `/` | Comparison site | `site/` |
| `/demos/<framework>/` | The six demos | `apps/<framework>/` |
| `/docs/` | These docs | `docs/` |
| `/api/events/`, `/api/bench/`, `/api/stats/` | Vercel functions | `api/` |

[`vercel.json`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/vercel.json) runs `npm run build` from the repo root and serves `site/dist`. Vercel picks up the functions in `api/` automatically. Files starting with an underscore, like `api/_airtable.js`, are shared modules, not endpoints.

## On every deploy

`npm run build` (`scripts/build.mjs`):

1. Builds each demo and measures it: bundle sizes, line counts, config lines, build time.
2. Writes `site/src/data/metrics.json`.
3. Builds the comparison site and the docs.
4. Copies every demo into `site/dist/demos/<id>/` and the docs into `site/dist/docs/`.
5. **On production deploys only**, refreshes the Airtable [Snapshots](../live-data/#snapshots) table. If that fails, it logs a warning and the deploy still succeeds.

## Environment variables

| Variable | Needed by | Notes |
| --- | --- | --- |
| `AIRTABLE_TOKEN` | `api/*`, build | Personal access token, server-side only |
| `AIRTABLE_BASE_ID` | `api/*`, build | The `app…` id from the base URL |
| `AIRTABLE_TABLE` | `api/*`, build | Optional. Events table name, defaults to `Events` |

Without them the site still deploys and works: the API returns `503`, the demos don't sync, and the Live section says its data is unavailable.

## Deploying by hand

```bash
npx vercel deploy          # preview
npx vercel deploy --prod   # production
```

Pushing to `main` deploys production automatically through the Vercel GitHub integration, and every pull request gets a preview deploy. CI ([`.github/workflows/ci.yml`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/.github/workflows/ci.yml)) runs the unit tests, typecheck, build and e2e suite on every push and PR.
