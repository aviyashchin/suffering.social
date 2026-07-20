import { initialiseTelemetry } from './telemetry-runtime.js';

initialiseTelemetry({
  environment: import.meta.env,
  windowObject: window,
  documentObject: document,
  loadPostHog: () => import('posthog-js/dist/module.slim.js'),
  loadSentry: () => import('./sentry-loader.js'),
}).catch(() => {
  // Observability must never prevent the research site from rendering.
});
