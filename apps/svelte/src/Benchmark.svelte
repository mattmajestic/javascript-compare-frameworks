<script lang="ts">
  import { BENCH_OPS, benchData, benchSummary, startRenderTimer } from '@compare/core';
  import type { BenchOp, BenchResult, BenchRow } from '@compare/core';

  // $state.raw: rows are replaced, never mutated, so skip deep proxies for
  // 10,000 objects.
  let rows = $state.raw<BenchRow[]>([]);
  let result = $state.raw<BenchResult | null>(null);

  async function run(op: BenchOp) {
    const { rows: next, queryMs } = await benchData(op, rows);
    const rendered = startRenderTimer();
    rows = next;
    result = { op, rows: next.length, queryMs, renderMs: await rendered() };
  }
</script>

<section class="panel bench" aria-labelledby="bench-title">
  <div class="bench-header">
    <h2 id="bench-title" class="panel-title">Query &amp; render benchmark</h2>
    <p class="bench-result" data-op={result?.op}>{benchSummary(result)}</p>
  </div>
  <div class="bench-actions">
    {#each BENCH_OPS as { op, label } (op)}
      <button type="button" class="bench-button" onclick={() => run(op)}>{label}</button>
    {/each}
  </div>
  <div class="bench-table-wrap">
    <table class="bench-table" aria-label="Query results">
      <tbody>
        {#each rows as row (row.id)}
          <tr>
            <td class="bench-id">{row.id}</td>
            <td class="bench-emoji">{row.emoji}</td>
            <td class="bench-name">{row.name}</td>
            <td class="bench-date">{row.date}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
