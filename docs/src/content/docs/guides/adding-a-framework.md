---
title: Adding a framework
description: A checklist for adding a seventh demo.
---

The build, the site, the e2e suite, the benchmark and the Airtable sync all read the framework list from one place, so adding a framework is mostly about writing the app itself.

1. **Register it.** Add an entry to [`packages/core/src/frameworks.js`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/packages/core/src/frameworks.js): `id`, npm `package`, `name`, `color`, dev `port` (next free one after 5106), `paradigm`, `tagline`, `pros`, `cons` and `bestFor`.

2. **Create the app.** Add `apps/<id>` as an npm workspace named `@compare/<id>`, with `dev` and `build` scripts. The build must emit **relative asset URLs** into `dist/`, because the app is served from `/demos/<id>/`.

3. **Render the markup contract.** Follow [the contract](../../reference/core/#markup-contract) exactly, including `data-framework="<id>"` on `.app` (Airtable sync reads it to know where an event came from) and the "Synced to Airtable" note under the form. Import `@compare/core/styles.css`.

4. **Use the core for everything that isn't rendering:** `getHolidays`, `mergeEvents`, `timeLeft`, `createCustomEvent`, `loadCustomEvents` and `saveCustomEvents`. Call `loadCustomEvents()` once at startup and `saveCustomEvents(list)` whenever the list changes.

5. **Add the benchmark panel.** Render the [`.bench` markup](../../reference/core/#benchmark-panel). For each operation, `await benchData(op, rows)`, then call `startRenderTimer()` right before the state change and await its result right after.

6. **Mark the code for the comparison.** Add `#region state`, `derived`, `effects` and `list` markers, plus file entries in [`site/src/lib/code.ts`](https://github.com/mattmajestic/javascript-compare-frameworks/blob/main/site/src/lib/code.ts) for the component, form and benchmark comparisons.

7. **Measure and test:**

   ```bash
   npm run build && npm run e2e && npm run bench
   ```

   The e2e spec and the benchmark pick up the new framework automatically.

8. **Update Airtable.** Run `npm run db:migrate` to add the framework to the Framework select fields. Writes work before you do, because the API creates missing choices on the fly.
