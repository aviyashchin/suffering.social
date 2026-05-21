import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page build. Vite's default only emits the root index.html, which
// silently drops every other static HTML in the repo (you get a 404 at
// runtime even though the source file exists). The repo serves three:
//   /                index.html
//   /v2              index-v2.html        (focused single-claim page)
//   /v5              social_media_cost_calculatorv5.html (legacy calculator)
// vercel.json redirects /v2 and /v5 to the .html files; cleanUrls then
// strips the extension. Both ends need this entry list to line up.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        v2: resolve(__dirname, 'index-v2.html'),
        v5: resolve(__dirname, 'social_media_cost_calculatorv5.html'),
      },
    },
  },
});
