// Pulls code straight out of the demo apps at build time, so the snippets on
// the site can never drift from the code that actually runs.
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

// Astro runs builds from the site/ workspace directory.
const appsDir = join(process.cwd(), '..', 'apps');

export interface Snippet {
  file: string;
  code: string;
  lang: string;
}

type Source = { file: string } | { region: string };

const LANGS: Record<string, string> = {
  '.tsx': 'tsx',
  '.ts': 'ts',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.astro': 'astro',
  '.html': 'angular-html',
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

function dedent(lines: string[]) {
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(indent)).join('\n');
}

const isMarker = (line: string) => /#(end)?region\b/.test(line);

function snippet(app: string, path: string, code: string): Snippet {
  return { file: relative(join(appsDir, app), path), code, lang: LANGS[extname(path)] ?? 'ts' };
}

// A region inside a single-file component is either script (TS) or template markup.
function regionLang(path: string, code: string) {
  const ext = extname(path);
  if (ext !== '.vue' && ext !== '.svelte') return LANGS[ext] ?? 'ts';
  if (!code.trimStart().startsWith('<')) return 'ts';
  return ext === '.vue' ? 'vue-html' : 'svelte';
}

function readRegion(app: string, name: string): Snippet[] {
  return sourceFiles(join(appsDir, app, 'src')).flatMap((path) => {
    const lines = readFileSync(path, 'utf8').split('\n');
    const start = lines.findIndex((l) => new RegExp(`#region ${name}\\b`).test(l));
    if (start === -1) return [];
    const end = lines.findIndex((l, i) => i > start && /#endregion\b/.test(l));
    const code = dedent(lines.slice(start + 1, end));
    return [{ ...snippet(app, path, code), lang: regionLang(path, code) }];
  });
}

function readFile(app: string, file: string): Snippet {
  const path = join(appsDir, app, file);
  const code = readFileSync(path, 'utf8').split('\n').filter((l) => !isMarker(l)).join('\n').trimEnd();
  return snippet(app, path, code);
}

export function getSnippets(app: string, sources: Source[]): Snippet[] {
  return sources.flatMap((source) => ('file' in source ? [readFile(app, source.file)] : readRegion(app, source.region)));
}

const region = (name: string): Source[] => [{ region: name }];

const COMPONENT_FILES: Record<string, Source[]> = {
  react: [{ file: 'src/Countdown.tsx' }],
  vue: [{ file: 'src/Countdown.vue' }],
  svelte: [{ file: 'src/Countdown.svelte' }],
  solid: [{ file: 'src/Countdown.tsx' }],
  angular: [{ file: 'src/app/countdown.ts' }, { file: 'src/app/countdown.html' }],
  astro: [{ file: 'src/components/Countdown.astro' }, { region: 'props' }],
};

const FORM_FILES: Record<string, Source[]> = {
  react: [{ file: 'src/AddEventForm.tsx' }],
  vue: [{ file: 'src/AddEventForm.vue' }],
  svelte: [{ file: 'src/AddEventForm.svelte' }],
  solid: [{ file: 'src/AddEventForm.tsx' }],
  angular: [{ file: 'src/app/add-event-form.ts' }, { file: 'src/app/add-event-form.html' }],
  astro: [{ file: 'src/components/AddEventForm.astro' }, { region: 'form' }],
};

const BENCH_FILES: Record<string, Source[]> = {
  react: [{ file: 'src/Benchmark.tsx' }],
  vue: [{ file: 'src/Benchmark.vue' }],
  svelte: [{ file: 'src/Benchmark.svelte' }],
  solid: [{ file: 'src/Benchmark.tsx' }],
  angular: [{ file: 'src/app/benchmark.ts' }, { file: 'src/app/benchmark.html' }],
  astro: [{ file: 'src/components/Benchmark.astro' }, { file: 'src/scripts/benchmark.ts' }],
};

export const CONCEPTS = [
  {
    id: 'state',
    title: 'State',
    summary: 'Three pieces of state: the ticking clock, custom events loaded from localStorage, and the selected id.',
    sources: (_app: string) => region('state'),
  },
  {
    id: 'derived',
    title: 'Derived state',
    summary: 'The sorted event list and the selected event are computed from state and never stored separately.',
    sources: (_app: string) => region('derived'),
  },
  {
    id: 'effects',
    title: 'Effects & cleanup',
    summary: 'Tick once a second, clear the timer on teardown, and persist custom events whenever they change.',
    sources: (_app: string) => region('effects'),
  },
  {
    id: 'list',
    title: 'Lists & events',
    summary: 'Render the keyed event list, highlight the selection, and only show a remove button for custom events.',
    sources: (_app: string) => region('list'),
  },
  {
    id: 'component',
    title: 'Components & props',
    summary: 'The countdown hero takes the event and the current time as props and renders the four time units.',
    sources: (app: string) => COMPONENT_FILES[app],
  },
  {
    id: 'form',
    title: 'Forms & binding',
    summary: 'A validated two-field form that reports errors and hands the new event to its parent.',
    sources: (app: string) => FORM_FILES[app],
  },
  {
    id: 'bench',
    title: 'Big lists',
    summary:
      'The benchmark panel: query rows, render up to 10,000 of them, and keep the clock tick from re-rendering them all.',
    sources: (app: string) => BENCH_FILES[app],
  },
];
