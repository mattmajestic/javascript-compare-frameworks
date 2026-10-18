import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BENCH_OPS, benchData, benchSummary, startRenderTimer } from '@compare/core';
import type { BenchOp, BenchResult, BenchRow } from '@compare/core';

@Component({
  selector: 'app-benchmark',
  templateUrl: './benchmark.html',
  // OnPush: only check this component when its own signals change, not on
  // every clock tick in the parent.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Benchmark {
  protected readonly ops = BENCH_OPS;
  protected readonly summary = benchSummary;
  protected readonly rows = signal<BenchRow[]>([]);
  protected readonly result = signal<BenchResult | null>(null);

  protected async run(op: BenchOp) {
    const { rows, queryMs } = await benchData(op, this.rows());
    const rendered = startRenderTimer();
    this.rows.set(rows);
    this.result.set({ op, rows: rows.length, queryMs, renderMs: await rendered() });
  }
}
