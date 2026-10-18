import { createSignal, For } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { BENCH_OPS, benchData, benchSummary, startRenderTimer } from '@compare/core';
import type { BenchOp, BenchResult, BenchRow } from '@compare/core';

export function Benchmark() {
  // A store + reconcile() is Solid's idiom for server data: it diffs new data
  // in by id, so an update patches just the changed names instead of
  // replacing whole rows.
  const [rows, setRows] = createStore<BenchRow[]>([]);
  const [result, setResult] = createSignal<BenchResult | null>(null);

  async function run(op: BenchOp) {
    const { rows: next, queryMs } = await benchData(op, rows);
    const rendered = startRenderTimer();
    setRows(reconcile(next, { key: 'id' }));
    setResult({ op, rows: next.length, queryMs, renderMs: await rendered() });
  }

  return (
    <section class="panel bench" aria-labelledby="bench-title">
      <div class="bench-header">
        <h2 class="panel-title" id="bench-title">Query &amp; render benchmark</h2>
        <p class="bench-result" data-op={result()?.op}>{benchSummary(result())}</p>
      </div>
      <div class="bench-actions">
        <For each={BENCH_OPS}>
          {({ op, label }) => (
            <button type="button" class="bench-button" onClick={() => run(op)}>
              {label}
            </button>
          )}
        </For>
      </div>
      <div class="bench-table-wrap">
        <table class="bench-table" aria-label="Query results">
          <tbody>
            <For each={rows}>
              {(row) => (
                <tr>
                  <td class="bench-id">{row.id}</td>
                  <td class="bench-emoji">{row.emoji}</td>
                  <td class="bench-name">{row.name}</td>
                  <td class="bench-date">{row.date}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </section>
  );
}
