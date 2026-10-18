---
title: Commands
description: Every npm script in the repo.
---

Run these from the repo root.

## Develop

| Command | What it does |
| --- | --- |
| `npm run dev` | Every demo, the site and the docs, each on its own port |
| `npm run dev:<target>` | One target: `react`, `vue`, `svelte`, `solid`, `angular`, `astro`, `site` or `docs` |
| `npx vercel dev` | The site plus the `/api` functions, using `.env` |

## Build

| Command | What it does |
| --- | --- |
| `npm run build` | Build every demo, regenerate `metrics.json`, build the site and docs, assemble `site/dist` |
| `npm run preview` | Serve `site/dist` at http://localhost:4173 |
| `npm run bench` | Run the lab benchmark in headless Chromium and write `bench.json` (run `build` first) |

## Test

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests for `@compare/core` (Node's built-in test runner) |
| `npm run typecheck` | `tsc`, `vue-tsc`, `svelte-check` and `astro check` across the workspaces |
| `npm run e2e` | Playwright against the built site: every demo, plus the site |

## Database

These read `AIRTABLE_TOKEN` and `AIRTABLE_BASE_ID` from `.env`. See [Live data](../../guides/live-data/#setup).

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Create any tables and fields from `db/schema.mjs` that the base is missing |
| `npm run db:sync` | Refresh the Snapshots table from `metrics.json` and `bench.json` |
| `npm run db:backup` | Download every table to `db/backups/` (gitignored) |
