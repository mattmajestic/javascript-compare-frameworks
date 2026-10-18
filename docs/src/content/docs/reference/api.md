---
title: API reference
description: The three Vercel functions behind the Airtable sync and the Live section.
---

The API is three small [Vercel functions](https://github.com/mattmajestic/javascript-compare-frameworks/tree/main/api). They exist for one reason: to keep the Airtable token on the server. Browsers only ever talk to `/api/*`, and the functions talk to Airtable.

:::tip[Try it]
The **[API explorer](../../api-explorer/)** renders the full OpenAPI spec with Swagger UI, and can call `GET /api/stats/` live. The raw spec is at [`/docs/openapi.yaml`](../../openapi.yaml), ready for Postman, Insomnia or a code generator.
:::

## Endpoints

| Method | Path | Called by | Writes to |
| --- | --- | --- | --- |
| `POST` | [`/api/events/`](#post-apievents) | `saveCustomEvents()` in every demo | Events |
| `POST` | [`/api/bench/`](#post-apibench) | The benchmark harness in every demo | Benchmarks |
| `GET` | [`/api/stats/`](#get-apistats) | The site's Live section, every 30 s | (reads Events + Benchmarks) |

All paths end in `/`. The site sets `trailingSlash`, so `/api/events` without a slash gets a `308` redirect.

## Conventions

- **No auth, same-origin only.** Write endpoints reject any request whose `Origin` header names a different host (`403`). There's no API key, because the endpoints only accept data the demos already produce.
- **Strict validation.** Every field is checked against the rules below, and anything else gets `400`. Bodies over 8,000 characters get `413`.
- **Fire-and-forget clients.** The demos never wait for a response or retry. A failed call just means one event or run isn't recorded.
- **Errors** are JSON: `{ "error": "Send 1–10 valid events." }`.

| Status | Meaning |
| --- | --- |
| `204` | Saved (writes) |
| `200` | OK (stats) |
| `400` | Invalid JSON or failed validation |
| `403` | Cross-origin request |
| `413` | Body too large |
| `502` | Airtable rejected the request or was unreachable (details in the function logs) |
| `503` | This deployment has no Airtable environment variables |

## POST /api/events/

Records countdowns that were added or removed. Each event is **upserted on `Event ID`**, so sending the same event twice updates one row.

```http
POST /api/events/
Content-Type: application/json

{
  "framework": "vue",
  "events": [
    { "id": "custom-mve3jqg4fw4u", "name": "Product launch", "date": "2026-12-01", "status": "active" }
  ]
}
```

| Field | Rule |
| --- | --- |
| `framework` | Optional framework id. An unknown value is stored without a framework. |
| `events` | 1 to 10 items (Airtable's per-request limit) |
| `events[].id` | `custom-` followed by 1–24 lowercase letters or digits |
| `events[].name` | 1–40 characters, not blank after trimming |
| `events[].date` | `YYYY-MM-DD` |
| `events[].status` | `active` sets Created At and Framework. `deleted` sets Status to Deleted and Deleted At. |

## POST /api/bench/

Reports benchmark runs. They're folded into **running averages** in one row per framework × operation × browser, so the table stays small however many runs arrive.

```http
POST /api/bench/
Content-Type: application/json

{
  "framework": "svelte",
  "runs": [
    { "op": "load-10k", "renderMs": 383.4, "queryMs": 23.8 },
    { "op": "update", "renderMs": 39.5, "queryMs": null }
  ]
}
```

| Field | Rule |
| --- | --- |
| `framework` | Required framework id |
| `runs` | 1 to 20 items |
| `runs[].op` | `load-1k`, `load-10k`, `update` or `clear` |
| `runs[].renderMs` | A number from 0 up to (not including) 60,000 |
| `runs[].queryMs` | The same range, or `null` for `update` and `clear`. Required. |

The browser family comes from the `User-Agent` header and is the only thing stored about the visitor.

## GET /api/stats/

Everything the Live section shows: event counts, benchmark averages per framework and operation, total runs, and runs per browser. Event names are never read.

```bash
curl https://js-comparisons.vercel.app/api/stats/
```

```json
{
  "generatedAt": "2026-10-18T17:54:30.000Z",
  "events": { "total": 11, "active": 8, "byFramework": { "react": 3, "vue": 1, "svelte": 4, "solid": 2, "angular": 0, "astro": 1 } },
  "benchmarks": {
    "svelte": {
      "load-1k": { "runs": 12, "renderMs": 51.2, "queryMs": 13.9 },
      "load-10k": { "runs": 9, "renderMs": 371.4, "queryMs": 21.6 },
      "update": { "runs": 7, "renderMs": 44.1, "queryMs": null },
      "clear": null
    }
  },
  "runs": 163,
  "browsers": { "Chrome": 120, "Safari": 31, "Firefox": 12 }
}
```

A `null` cell means no visitor has run that operation in that framework yet. Responses are **edge-cached for 30 seconds**.

## Source

| File | Purpose |
| --- | --- |
| [`api/events.js`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/api/events.js) | `POST /api/events/` |
| [`api/bench.js`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/api/bench.js) | `POST /api/bench/` |
| [`api/stats.js`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/api/stats.js) | `GET /api/stats/` |
| [`api/_airtable.js`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/api/_airtable.js) | Shared helpers (not an endpoint: Vercel skips files starting with `_`) |
| [`docs/public/openapi.yaml`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/docs/public/openapi.yaml) | The OpenAPI 3.1 spec |
