import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { resolveSentryBuildConfig } from './src/sentry-build-config.js';

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
export default defineConfig(({ command, mode }) => {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const sentryBuild = resolveSentryBuildConfig(environment, command);

  return {
    plugins: sentryBuild.enabled
      ? [
          sentryVitePlugin({
            authToken: environment.SENTRY_AUTH_TOKEN,
            org: environment.SENTRY_ORG,
            project: environment.SENTRY_PROJECT,
            release: { name: sentryBuild.release },
            sourcemaps: {
              assets: './dist/assets/**',
              filesToDeleteAfterUpload: './dist/**/*.map',
            },
          }),
        ]
      : [],
    build: {
      sourcemap: sentryBuild.enabled ? 'hidden' : false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          calculator: resolve(__dirname, 'calculator.html'),
          v5: resolve(__dirname, 'social_media_cost_calculatorv5.html'),
          privacy: resolve(__dirname, 'privacy.html'),
        },
      },
    },
  };
});
