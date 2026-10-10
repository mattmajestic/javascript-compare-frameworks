// Framework-agnostic logic shared by every demo app.
// Keeping this out of the apps means each framework folder contains only
// framework code, so line counts and bundle sizes compare like-for-like.

export { FRAMEWORKS, REPO_URL, getFramework, sourceUrl } from './frameworks.js';

const DAY = 86_400_000;
const STORAGE_KEY = 'countdown:custom-events';

/** Date of the nth weekday (0 = Sunday) of a month, e.g. the 4th Thursday of November. */
export function nthWeekday(year, month, weekday, n) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month, day);
}

const HOLIDAYS = [
  { id: 'new-year', name: "New Year's Day", emoji: '🎆', theme: 'newyear', on: (y) => new Date(y, 0, 1) },
  { id: 'valentines', name: "Valentine's Day", emoji: '💘', theme: 'valentine', on: (y) => new Date(y, 1, 14) },
  { id: 'halloween', name: 'Halloween', emoji: '🎃', theme: 'halloween', on: (y) => new Date(y, 9, 31) },
  { id: 'thanksgiving', name: 'Thanksgiving', emoji: '🦃', theme: 'thanksgiving', on: (y) => nthWeekday(y, 10, 4, 4) },
  { id: 'christmas', name: 'Christmas', emoji: '🎄', theme: 'christmas', on: (y) => new Date(y, 11, 25) },
];

/** A holiday stays "current" for its whole day, then rolls over to next year. */
function nextOccurrence(on, now) {
  const year = now.getFullYear();
  const date = on(year);
  return now.getTime() < date.getTime() + DAY ? date : on(year + 1);
}

/** Built-in holidays with their next occurrence relative to `now`. */
export function getHolidays(now = new Date()) {
  return HOLIDAYS.map(({ on, ...holiday }) => ({ ...holiday, date: nextOccurrence(on, now), custom: false }));
}

/** Holidays and custom events merged and sorted soonest-first. */
export function mergeEvents(holidays, custom) {
  return [...holidays, ...custom].sort((a, b) => a.date.getTime() - b.date.getTime());
}

const pad = (n) => String(n).padStart(2, '0');

/** Breakdown of the time remaining until `date`, ready to render as a list of units. */
export function timeLeft(date, now = new Date()) {
  const total = Math.max(0, date.getTime() - now.getTime());
  const s = Math.floor(total / 1000);
  return {
    total,
    done: total === 0,
    units: [
      { key: 'days', label: 'Days', value: String(Math.floor(s / 86_400)) },
      { key: 'hours', label: 'Hours', value: pad(Math.floor(s / 3600) % 24) },
      { key: 'minutes', label: 'Minutes', value: pad(Math.floor(s / 60) % 60) },
      { key: 'seconds', label: 'Seconds', value: pad(s % 60) },
    ],
  };
}

/** Compact label for list items: "Today", "Tomorrow", "21 days". */
export function daysLabel(date, now = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((date.getTime() - startOfToday.getTime()) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

export function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/** `YYYY-MM-DD` in local time, the format used by `<input type="date">`. */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 ? date : null;
}

function toEvent({ id, name, date }) {
  return { id, name, emoji: '⭐', theme: 'custom', date, custom: true };
}

export const NAME_MAX_LENGTH = 40;

/** Validate form input and build a custom event, or explain what's wrong. */
export function createCustomEvent(name, dateValue, now = new Date()) {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return { ok: false, error: 'Give your countdown a name.' };
  if (trimmed.length > NAME_MAX_LENGTH) return { ok: false, error: `Keep the name under ${NAME_MAX_LENGTH} characters.` };
  const date = parseISODate(dateValue);
  if (!date) return { ok: false, error: 'Pick a date.' };
  if (date.getTime() <= now.getTime()) return { ok: false, error: 'Pick a date in the future.' };
  const id = `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { ok: true, event: toEvent({ id, name: trimmed, date }) };
}

/** Custom events are shared across demos served from the same origin. */
export function loadCustomEvents(storage = globalThis.localStorage) {
  try {
    const records = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(records)) return [];
    return records.flatMap((r) => {
      const date = parseISODate(r?.date);
      return typeof r?.id === 'string' && typeof r?.name === 'string' && date ? [toEvent({ ...r, date })] : [];
    });
  } catch {
    return [];
  }
}

export function saveCustomEvents(events, storage = globalThis.localStorage) {
  try {
    const records = events.map(({ id, name, date }) => ({ id, name, date: toISODate(date) }));
    storage?.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage can be unavailable (private mode, quota); the app still works in memory.
  }
}
