import { memo, useState } from 'react';
import { BENCH_OPS, benchData, benchSummary, startRenderTimer } from '@compare/core';
import type { BenchOp, BenchResult, BenchRow } from '@compare/core';

// memo: App re-renders every second for the clock. Without it, React would
// re-render every row on every tick, even though nothing here changed.
export const Benchmark = memo(function Benchmark() {
  const [rows, setRows] = useState<BenchRow[]>([]);
  const [result, setResult] = useState<BenchResult | null>(null);

  async function run(op: BenchOp) {
    const { rows: next, queryMs } = await benchData(op, rows);
    const rendered = startRenderTimer();
    setRows(next);
    setResult({ op, rows: next.length, queryMs, renderMs: await rendered() });
  }

  return (
    <section className="panel bench" aria-labelledby="bench-title">
      <div className="bench-header">
        <h2 className="panel-title" id="bench-title">Query &amp; render benchmark</h2>
        <p className="bench-result" data-op={result?.op}>{benchSummary(result)}</p>
      </div>
      <div className="bench-actions">
        {BENCH_OPS.map(({ op, label }) => (
          <button key={op} type="button" className="bench-button" onClick={() => run(op)}>
            {label}
          </button>
        ))}
      </div>
      <div className="bench-table-wrap">
        <table className="bench-table" aria-label="Query results">
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="bench-id">{row.id}</td>
                <td className="bench-emoji">{row.emoji}</td>
                <td className="bench-name">{row.name}</td>
                <td className="bench-date">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});
