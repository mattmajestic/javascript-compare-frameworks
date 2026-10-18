export const REPO_URL = 'https://github.com/mattmajestic/javascript-compare-frameworks';

/**
 * Single source of truth for the frameworks in this repo. Used by the demo
 * headers, the comparison site, the metrics script, and the e2e suite.
 */
export const FRAMEWORKS = [
  {
    id: 'react',
    package: 'react',
    name: 'React',
    color: '#58c4dc',
    port: 5101,
    paradigm: 'Virtual DOM + hooks',
    tagline: 'The default choice. Huge ecosystem, explicit re-renders.',
    pros: ['Largest ecosystem and hiring pool', 'Plain JavaScript mental model (JSX)', 'Great docs and learning resources'],
    cons: ['Dependency arrays are easy to get wrong', 'Whole component re-runs on every tick', 'Heaviest runtime here'],
    bestFor: 'Teams that want the safest bet and the biggest ecosystem.',
  },
  {
    id: 'vue',
    package: 'vue',
    name: 'Vue',
    color: '#42b883',
    port: 5102,
    paradigm: 'Reactive refs + compiled templates',
    tagline: 'Approachable single-file components with batteries included.',
    pros: ['`v-model` makes forms trivial', 'Computed values track dependencies automatically', 'Gentle learning curve'],
    cons: ['Template DSL and `.value` to learn', 'Two API styles (Options vs Composition) in the wild'],
    bestFor: 'Product teams who want productivity without much ceremony.',
  },
  {
    id: 'svelte',
    package: 'svelte',
    name: 'Svelte',
    color: '#ff3e00',
    port: 5103,
    paradigm: 'Compiler + runes',
    tagline: 'Write less code. The compiler does the work.',
    pros: ['Least ceremony: `$state`, `$derived` and `$effect` read like plain JS', 'Two-way binding with `bind:value`', 'Small runtime, compiled away where possible'],
    cons: ['Smaller ecosystem than React/Vue', 'Svelte 5 runes changed idioms from v3/v4'],
    bestFor: 'Small teams and apps where code size and clarity matter most.',
  },
  {
    id: 'solid',
    package: 'solid-js',
    name: 'Solid',
    color: '#4f88c6',
    port: 5104,
    paradigm: 'Fine-grained signals + JSX',
    tagline: 'React-like JSX, but components run once and signals update the DOM directly.',
    pros: ['Fine-grained updates: only the changed text node re-renders', 'Smallest framework bundle here', 'Familiar JSX'],
    cons: ['Destructuring props breaks reactivity', 'Smaller community'],
    bestFor: 'Performance-sensitive UIs from developers who like JSX.',
  },
  {
    id: 'angular',
    package: '@angular/core',
    name: 'Angular',
    color: '#dd0031',
    port: 5105,
    paradigm: 'Signals + DI, full platform',
    tagline: 'A full platform: CLI, forms, DI, router, testing, all in the box.',
    pros: ['Everything is official and integrated', 'Signals and new control flow modernised the DX', 'Strong conventions for big teams'],
    cons: ['Most config files and concepts to learn (decorators, DI, NgModule-era docs)', 'Heavier than the compiler-first frameworks'],
    bestFor: 'Large teams and enterprise apps that want one opinionated stack.',
  },
  {
    id: 'astro',
    package: 'astro',
    name: 'Astro',
    color: '#bc52ee',
    port: 5106,
    paradigm: 'Static HTML + vanilla island',
    tagline: 'Ships HTML, adds JavaScript only where you ask for it.',
    pros: ['Zero JS by default, so content renders without scripts', 'Best CLI and DX of the bunch', 'Can host React/Vue/Svelte islands'],
    cons: ['Interactive parts are plain DOM code (or another framework)', 'Not designed for app-like state'],
    bestFor: 'Content sites, docs and marketing pages with a few interactive bits.',
  },
];

export const getFramework = (id) => FRAMEWORKS.find((f) => f.id === id);

export const sourceUrl = (id) => `${REPO_URL}/tree/main/apps/${id}`;
