import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page build. Vite's default only emits the root index.html, which
// silently drops every other static HTML in the repo (you get a 404 at
// runtime even though the source file exists).
//
// Routes (after /v2 was promoted to /):
//   /            index.html               (the editorial calculator, was /v2)
//   /calculator  calculator.html          (legacy chartjunky calculator)
//   /v5          social_media_cost_calculatorv5.html (older legacy calculator)
//
// Both /v2 and /index-v2 redirect to / for backward compatibility with
// shared links. See vercel.json.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        calculator: resolve(__dirname, 'calculator.html'),
        v5:         resolve(__dirname, 'social_media_cost_calculatorv5.html'),
      },
    },
  },
});
