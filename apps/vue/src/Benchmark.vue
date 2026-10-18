<script setup lang="ts">
import { shallowRef } from 'vue';
import { BENCH_OPS, benchData, benchSummary, startRenderTimer } from '@compare/core';
import type { BenchOp, BenchResult, BenchRow } from '@compare/core';

// shallowRef: rows are replaced, never mutated, so there's no need to make
// 10,000 objects deeply reactive.
const rows = shallowRef<BenchRow[]>([]);
const result = shallowRef<BenchResult | null>(null);

async function run(op: BenchOp) {
  const { rows: next, queryMs } = await benchData(op, rows.value);
  const rendered = startRenderTimer();
  rows.value = next;
  result.value = { op, rows: next.length, queryMs, renderMs: await rendered() };
}
</script>

<template>
  <section class="panel bench" aria-labelledby="bench-title">
    <div class="bench-header">
      <h2 id="bench-title" class="panel-title">Query &amp; render benchmark</h2>
      <p class="bench-result" :data-op="result?.op">{{ benchSummary(result) }}</p>
    </div>
    <div class="bench-actions">
      <button v-for="{ op, label } in BENCH_OPS" :key="op" type="button" class="bench-button" @click="run(op)">
        {{ label }}
      </button>
    </div>
    <div class="bench-table-wrap">
      <table class="bench-table" aria-label="Query results">
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td class="bench-id">{{ row.id }}</td>
            <td class="bench-emoji">{{ row.emoji }}</td>
            <td class="bench-name">{{ row.name }}</td>
            <td class="bench-date">{{ row.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
