import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// Two deploys, one build:
// - Vercel: served from the comparison site at /docs/ (scripts/build.mjs copies
//   dist into site/dist/docs), so the API explorer calls /api/* same-origin.
// - GitHub Pages: .github/workflows/pages.yml sets DOCS_SITE, DOCS_BASE and
//   DOCS_API_ORIGIN, and the explorer calls the production API instead.
// Content links are relative, so they work under either base.
export default defineConfig({
  site: process.env.DOCS_SITE ?? 'https://js-comparisons.vercel.app',
  base: process.env.DOCS_BASE ?? '/docs',
  trailingSlash: 'always',
  server: { port: 5110 },
  integrations: [
    starlight({
      title: 'One App, Six Frameworks',
      description: 'Docs for the framework comparison: architecture, benchmarks, live data in Airtable, and the API.',
      favicon: '/airtable.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/mattmajestic/javascript-compare-frameworks' },
      ],
      editLink: { baseUrl: 'https://github.com/mattmajestic/javascript-compare-frameworks/edit/main/docs/' },
      customCss: ['./src/styles/docs.css'],
      sidebar: [
        { label: 'Start here', items: ['getting-started', 'guides/architecture'] },
        {
          label: 'Guides',
          items: ['guides/benchmarks', 'guides/live-data', 'guides/deploying', 'guides/adding-a-framework'],
        },
        {
          label: 'API',
          items: [
            'reference/api',
            { label: 'API explorer (Swagger)', link: '/api-explorer/', badge: { text: 'Try it', variant: 'tip' } },
          ],
        },
        { label: 'Reference', items: ['reference/core', 'reference/commands'] },
        { label: 'Live site ↗', link: 'https://js-comparisons.vercel.app', attrs: { target: '_blank' } },
      ],
    }),
  ],
});
