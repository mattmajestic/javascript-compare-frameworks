import { defineConfig } from 'astro/config';

// The root build script sets DEMO_BASE so the demo can live under /demos/astro/.
export default defineConfig({
  base: process.env.DEMO_BASE ?? '/',
  server: { port: 5106 },
});
