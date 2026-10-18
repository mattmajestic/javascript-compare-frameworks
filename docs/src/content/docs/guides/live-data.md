---
title: Live data (Airtable)
description: What's stored in Airtable, how it gets there, how to set it up, and how to keep it safe.
---

<img src="../../airtable.svg" alt="Airtable logo" width="40" height="40" />

The demos and the build write to an [Airtable](https://airtable.com) base, and the site's [Live section](https://js-comparisons.vercel.app/#live) reads aggregate numbers back.

## Data flow

```
demos       ─POST─▶  /api/events/  ─▶  Events
            ─POST─▶  /api/bench/   ─▶  Benchmarks
build       ──────▶  db/sync.mjs   ─▶  Snapshots
Live section ◀─GET─  /api/stats/   ◀─  Events + Benchmarks
```

`/api/stats/` is edge-cached for 30 seconds, and the Snapshots table is only refreshed on production deploys.

- The **Airtable token never reaches the browser.** The demos and the site only talk to the [`/api` functions](../../reference/api/), which run on Vercel with the token in an environment variable.
- **No framework code knows about Airtable.** Syncing lives in the shared core (`sync.js`, `saveCustomEvents`, `benchData`/`startRenderTimer`), so every demo gets it for free.
- **Failures are invisible to users.** Requests are fire-and-forget. If the API is down or missing (local dev), the demos keep working from `localStorage`.

## Tables

The schema is defined in code in [`db/schema.mjs`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/db/schema.mjs).

### Events

One row per custom countdown, added in any demo.

| Field | Type | Notes |
| --- | --- | --- |
| Name | Single line text | As typed, max 40 characters. Never shown on the site. |
| Event ID | Single line text | The client id (`custom-…`). Upserts merge on this, so repeats update the same row. |
| Date | Date | The countdown's date |
| Framework | Single select | Which demo it was added from |
| Status | Single select | `Active`, or `Deleted` once removed. Rows are never erased. |
| Created At / Deleted At | Date and time (UTC) | Set by the API |

Each demo reports **only its own changes**. Two demos side by side share one `localStorage`, so each page diffs against its own baseline rather than the storage, which the other demo may have changed.

### Benchmarks

Visitors' benchmark runs, kept as **running averages** per framework × operation × browser, so the table stays around 120 rows no matter how much traffic comes in.

| Field | Type | Notes |
| --- | --- | --- |
| Key | Single line text | `Framework · operation · browser`. Upserts merge on this. |
| Framework, Operation, Browser | Single select | Browser is a coarse family: Chrome, Edge, Firefox, Safari, Other |
| Runs | Number | Total runs folded into this row |
| Avg Render ms, Best Render ms, Avg Query ms | Number | Query time only exists for the load operations |
| Updated At | Date and time (UTC) | |

### Snapshots

The **latest** build metrics and lab benchmark (`metrics.json` and `bench.json`): exactly **one row per framework**, overwritten in place. That keeps it at 6 rows, a single small request to read.

| Field | Notes |
| --- | --- |
| Key | The framework name. Upserts merge on this. |
| Framework, Version, Commit, Recorded At | Where the numbers came from |
| JS gzip bytes, JS raw bytes, CSS gzip bytes | Bundle sizes |
| Source lines, Source files, Config lines, Build ms | Code size and build time |
| Lab render 1k / 10k / update / clear ms, Lab query 10k ms, Lab browser | From `npm run bench` |

A row is only written when a measured value changed. Build time is stored but doesn't count as a change, since it's different on every run.

## Privacy

- **Event names** are written to Airtable but never read back or shown on the site. `/api/stats/` only ever requests the Framework and Status fields.
- **Benchmarks** store a browser family, never a user agent, IP address or identifier.
- **Backups** contain event names, so `db/backups/` is gitignored.

## Setup

1. **Create a base** in Airtable (any name).
2. **Create a token** at [airtable.com/create/tokens](https://airtable.com/create/tokens) with these scopes, limited to that base:
   - `data.records:read` and `data.records:write`
   - `schema.bases:read` and `schema.bases:write` (for migrations)
3. **Configure `.env`.** Copy `.env.example` to `.env`:

   ```bash
   AIRTABLE_TOKEN=pat...
   AIRTABLE_BASE_ID=app...   # the app… part of the base's URL
   AIRTABLE_TABLE=Events
   ```

4. **Create the tables:**

   ```bash
   npm run db:migrate
   ```

   It only adds tables and fields that are missing, never deletes or renames, so it's safe to re-run after changing `db/schema.mjs`.

5. **Add the same variables in Vercel** under Settings → Environment Variables: Production, plus Preview if you want PR previews to sync too. Then redeploy.

:::caution
Never prefix these variables with `VITE_` or `PUBLIC_`. That would bundle the token into the browser JavaScript.
:::

## Trying it locally

```bash
npx vercel dev
```

That runs the site and the `/api` functions together, with your `.env`.

## Keeping the data safe

| Command | What it does |
| --- | --- |
| `npm run db:backup` | Downloads every table, schema included, to `db/backups/airtable-<time>.json` |
| `npm run db:sync` | Refreshes the Snapshots table by hand, e.g. after `npm run bench` |
| `npm run db:migrate` | Recreates the tables in a fresh base from `db/schema.mjs` |

Airtable also keeps revision history for every record.

## Limits

- Airtable allows about **5 requests per second per base**. `/api/stats/` is edge-cached for 30 seconds, so however many visitors poll it, Airtable sees only a few reads a minute.
- The free plan caps records per base (about 1,000). Benchmarks and Snapshots stay small by design, so in practice only Events grows.
- Anyone can call the write endpoints. They reject cross-origin requests and validate every field, but crowd-sourced numbers can still be faked. Treat the Live section accordingly.
