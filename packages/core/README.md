# @compare/core

Everything the demos share, so each app folder contains only framework code.

| Export | Purpose |
| --- | --- |
| `getHolidays(now)` | Built-in holidays resolved to their next occurrence (a holiday stays current for its whole day) |
| `mergeEvents(holidays, custom)` | Combined list, soonest first |
| `timeLeft(date, now)` | `{ total, done, units: [{ key, label, value }] }`, ready to render as a list |
| `daysLabel(date, now)` | `"Today"`, `"Tomorrow"`, `"21 days"` |
| `formatDate(date)` | `"Saturday, October 31, 2026"` |
| `createCustomEvent(name, isoDate)` | Validates form input and returns `{ ok: true, event }` or `{ ok: false, error }` |
| `loadCustomEvents()` / `saveCustomEvents(events)` | `localStorage` persistence that tolerates bad data and missing storage. Saves also sync this page's own adds and removes to Airtable via `/api/events/` |
| `benchData(op, rows)`, `startRenderTimer()`, `benchSummary(result)` | The query & render benchmark: mock-API data, paint-aware timing, result text. Runs are reported to `/api/bench/` (skipped in automated browsers) |
| `FRAMEWORKS`, `sourceUrl(id)` | Framework metadata used by the demos, site, build script and e2e suite |
| `@compare/core/styles.css` | The design system |

Run the tests with `npm test`.

## Markup contract

Every demo renders this structure, which the stylesheet and the e2e suite rely on. Elements marked *(if …)* are rendered conditionally (or toggled with `hidden`).

```html
<div class="app" data-theme="{event.theme}" data-framework="{id}">
  <header class="topbar">
    <span class="badge"><span class="badge-dot"></span>{Framework}</span>
    <a class="source-link" href="{sourceUrl(id)}">View source ↗</a>
  </header>

  <main class="layout">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-emoji" aria-hidden="true">{emoji}</div>
      <h1 class="hero-title" id="hero-title">{name}</h1>
      <p class="hero-date">{formatDate(date)}</p>
      <p class="hero-done">🎉 It's here!</p>                      <!-- (if done) -->
      <div class="units" role="timer">                             <!-- (if not done) -->
        <div class="unit" data-unit="{key}">
          <span class="unit-value">{value}</span>
          <span class="unit-label">{label}</span>
        </div>
      </div>
    </section>

    <aside class="sidebar">
      <section class="panel">
        <h2 class="panel-title">Upcoming</h2>
        <ul class="event-list">
          <li class="event-item">
            <button type="button" class="event" aria-pressed="{selected}">
              <span class="event-emoji" aria-hidden="true">{emoji}</span>
              <span class="event-name">{name}</span>
              <span class="event-days">{daysLabel}</span>
            </button>
            <button type="button" class="event-remove" aria-label="Remove {name}">×</button> <!-- (if custom) -->
          </li>
        </ul>
      </section>

      <form class="panel add-form" novalidate>
        <h2 class="panel-title">Add a countdown</h2>
        <label class="field"><span>Name</span><input name="name" /></label>
        <label class="field"><span>Date</span><input type="date" name="date" /></label>
        <p class="form-error" role="alert">{error}</p>             <!-- (if error) -->
        <button type="submit" class="button">Add countdown</button>
        <p class="form-note"><span class="airtable-mark" aria-hidden="true"></span>Synced to Airtable</p>
      </form>
    </aside>
  </main>
</div>
```

### Benchmark panel

Rendered after `</main>`, inside `.app`. Use `benchData(op, rows)` for the data and wrap the state change in `startRenderTimer()` so every framework is timed the same way.

```html
<section class="panel bench" aria-labelledby="bench-title">
  <div class="bench-header">
    <h2 class="panel-title" id="bench-title">Query &amp; render benchmark</h2>
    <p class="bench-result" data-op="{last op}">{benchSummary(result)}</p>
  </div>
  <div class="bench-actions">
    <button type="button" class="bench-button">{label}</button>   <!-- one per BENCH_OPS entry -->
  </div>
  <div class="bench-table-wrap">
    <table class="bench-table" aria-label="Query results">
      <tbody>
        <tr>                                                       <!-- keyed by row.id -->
          <td class="bench-id">{id}</td>
          <td class="bench-emoji">{emoji}</td>
          <td class="bench-name">{name}</td>
          <td class="bench-date">{date}</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```
