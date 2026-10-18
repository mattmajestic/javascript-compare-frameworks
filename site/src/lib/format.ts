/** The docs site: served at /docs/ in production, from its own dev server locally. */
export const docsUrl = (path = '') => `${import.meta.env.DEV ? 'http://localhost:5110/docs/' : '/docs/'}${path}`;

/** The README's Documentation section on GitHub. */
export const repoDocsUrl = (repo: string) => `${repo}#documentation`;

export const kB = (bytes: number) => `${(bytes / 1000).toFixed(1)} kB`;

export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

/** In dev each demo runs on its own port; in the built site they live under /demos/. */
export const demoUrl = (id: string, port: number) =>
  import.meta.env.DEV ? `http://localhost:${port}/` : `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}demos/${id}/`;

/** Minimal inline markdown for the framework blurbs: escapes HTML, then renders `code`. */
export const inlineCode = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
