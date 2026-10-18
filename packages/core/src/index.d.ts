export type Theme = 'newyear' | 'valentine' | 'halloween' | 'thanksgiving' | 'christmas' | 'custom';

export interface CountdownEvent {
  id: string;
  name: string;
  emoji: string;
  theme: Theme;
  date: Date;
  custom: boolean;
}

export interface TimeUnit {
  key: 'days' | 'hours' | 'minutes' | 'seconds';
  label: string;
  value: string;
}

export interface TimeLeft {
  total: number;
  done: boolean;
  units: TimeUnit[];
}

export type CreateResult = { ok: true; event: CountdownEvent } | { ok: false; error: string };

export interface Framework {
  id: 'react' | 'vue' | 'svelte' | 'solid' | 'angular' | 'astro';
  /** npm package whose version is reported on the comparison site. */
  package: string;
  name: string;
  color: string;
  port: number;
  paradigm: string;
  tagline: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export const NAME_MAX_LENGTH: number;
export const REPO_URL: string;
export const FRAMEWORKS: Framework[];

export function getFramework(id: string): Framework | undefined;
export function sourceUrl(id: string): string;
export function nthWeekday(year: number, month: number, weekday: number, n: number): Date;
export function getHolidays(now?: Date): CountdownEvent[];
export function mergeEvents(holidays: CountdownEvent[], custom: CountdownEvent[]): CountdownEvent[];
export function timeLeft(date: Date, now?: Date): TimeLeft;
export function daysLabel(date: Date, now?: Date): string;
export function formatDate(date: Date): string;
export function toISODate(date: Date): string;
export function createCustomEvent(name: string, dateValue: string, now?: Date): CreateResult;
export function loadCustomEvents(storage?: Storage): CountdownEvent[];
export interface CustomEventChange {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'deleted';
}
export function saveCustomEvents(
  events: CountdownEvent[],
  storage?: Storage,
  sync?: (changes: CustomEventChange[]) => void,
): void;

export type BenchOp = 'load-1k' | 'load-10k' | 'update' | 'clear';

export interface BenchRow {
  id: number;
  name: string;
  emoji: string;
  /** Pre-formatted, e.g. "Oct 31, 2026". */
  date: string;
}

export interface BenchResult {
  op: BenchOp;
  rows: number;
  /** null for operations that don't query (update, clear). */
  queryMs: number | null;
  renderMs: number;
}

export const BENCH_OPS: { op: BenchOp; label: string }[];
export function queryRows(count: number): Promise<{ rows: BenchRow[]; queryMs: number }>;
export function updateEvery10th(rows: BenchRow[]): BenchRow[];
export function benchData(op: BenchOp, current: BenchRow[]): Promise<{ rows: BenchRow[]; queryMs: number | null }>;
export function startRenderTimer(): () => Promise<number>;
export function benchSummary(result: BenchResult | null): string;
