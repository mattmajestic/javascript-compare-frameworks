// Airtable schema for the `javascript-compare-framework` base, as code.
// `npm run db:migrate` creates any table or field listed here that the base
// is missing. It never deletes or renames anything, so it is safe to re-run.
// Field options follow https://airtable.com/developers/web/api/field-model

import { BENCH_OPS } from '../packages/core/src/bench.js';
import { FRAMEWORKS } from '../packages/core/src/frameworks.js';

const utcDateTime = { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'utc' };
const choices = (names) => ({ choices: names.map((name) => ({ name })) });
const frameworkChoices = choices(FRAMEWORKS.map((f) => f.name));

export const BROWSERS = ['Chrome', 'Edge', 'Firefox', 'Safari', 'Other'];

// Overridable so the table name in .env and in the base stay in sync.
export const EVENTS_TABLE = process.env.AIRTABLE_TABLE || 'Events';
export const BENCH_TABLE = 'Benchmarks';

export const EVENTS_FIELDS = {
  name: 'Name',
  eventId: 'Event ID',
  date: 'Date',
  framework: 'Framework',
  status: 'Status',
  createdAt: 'Created At',
  deletedAt: 'Deleted At',
};

export const STATUS = { active: 'Active', deleted: 'Deleted' };

// One row per framework × operation × browser, holding running averages.
// Aggregating keeps the table tiny (≈120 rows max) no matter how many runs
// come in, well inside the free plan's per-base record limit.
export const BENCH_FIELDS = {
  key: 'Key',
  framework: 'Framework',
  op: 'Operation',
  browser: 'Browser',
  runs: 'Runs',
  avgRenderMs: 'Avg Render ms',
  bestRenderMs: 'Best Render ms',
  avgQueryMs: 'Avg Query ms',
  updatedAt: 'Updated At',
};

export const TABLES = [
  {
    name: EVENTS_TABLE,
    description: 'Custom countdowns added in any of the demo apps.',
    fields: [
      // The first field becomes the table's primary field.
      { name: EVENTS_FIELDS.name, type: 'singleLineText', description: 'Countdown name, as typed (max 40 chars).' },
      { name: EVENTS_FIELDS.eventId, type: 'singleLineText', description: 'Client id (custom-…). Upserts merge on this.' },
      { name: EVENTS_FIELDS.date, type: 'date', options: { dateFormat: { name: 'iso' } } },
      { name: EVENTS_FIELDS.framework, type: 'singleSelect', description: 'Which demo the event was added from.', options: frameworkChoices },
      {
        name: EVENTS_FIELDS.status,
        type: 'singleSelect',
        options: { choices: [{ name: STATUS.active, color: 'greenLight2' }, { name: STATUS.deleted, color: 'grayLight2' }] },
      },
      { name: EVENTS_FIELDS.createdAt, type: 'dateTime', options: utcDateTime },
      { name: EVENTS_FIELDS.deletedAt, type: 'dateTime', options: utcDateTime },
    ],
  },
  {
    name: BENCH_TABLE,
    description: 'Real-world benchmark runs from visitors, as running averages.',
    fields: [
      { name: BENCH_FIELDS.key, type: 'singleLineText', description: 'framework · operation · browser. Upserts merge on this.' },
      { name: BENCH_FIELDS.framework, type: 'singleSelect', options: frameworkChoices },
      { name: BENCH_FIELDS.op, type: 'singleSelect', options: choices(BENCH_OPS.map((o) => o.op)) },
      { name: BENCH_FIELDS.browser, type: 'singleSelect', options: choices(BROWSERS) },
      { name: BENCH_FIELDS.runs, type: 'number', options: { precision: 0 } },
      { name: BENCH_FIELDS.avgRenderMs, type: 'number', options: { precision: 1 } },
      { name: BENCH_FIELDS.bestRenderMs, type: 'number', options: { precision: 1 } },
      { name: BENCH_FIELDS.avgQueryMs, type: 'number', options: { precision: 1 } },
      { name: BENCH_FIELDS.updatedAt, type: 'dateTime', options: utcDateTime },
    ],
  },
];
