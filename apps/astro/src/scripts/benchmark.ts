// The benchmark island without a framework: rendering and list diffing by hand.
import { benchData, benchSummary, startRenderTimer } from '@compare/core';
import type { BenchOp, BenchRow } from '@compare/core';

const tbody = document.querySelector('.bench-table tbody')!;
const result = document.querySelector<HTMLElement>('.bench-result')!;
let rows: BenchRow[] = [];

function rowElement(row: BenchRow) {
  const tr = document.createElement('tr');
  const cells: [string, string][] = [
    ['bench-id', String(row.id)],
    ['bench-emoji', row.emoji],
    ['bench-name', row.name],
    ['bench-date', row.date],
  ];
  for (const [className, text] of cells) {
    const td = document.createElement('td');
    td.className = className;
    td.textContent = text;
    tr.append(td);
  }
  return tr;
}

function render(op: BenchOp, next: BenchRow[]) {
  // Hand-written diff: an update keeps the same rows in the same order, so only
  // patch the rows that changed. Anything else rebuilds the table.
  if (op === 'update') {
    next.forEach((row, i) => {
      if (row !== rows[i]) tbody.children[i].querySelector('.bench-name')!.textContent = row.name;
    });
  } else {
    tbody.replaceChildren(...next.map(rowElement));
  }
  rows = next;
}

async function run(op: BenchOp) {
  const { rows: next, queryMs } = await benchData(op, rows);
  const rendered = startRenderTimer();
  render(op, next);
  const renderMs = await rendered();
  result.dataset.op = op;
  result.textContent = benchSummary({ op, rows: next.length, queryMs, renderMs });
}

for (const button of document.querySelectorAll<HTMLButtonElement>('.bench-actions [data-op]')) {
  button.addEventListener('click', () => run(button.dataset.op as BenchOp));
}
