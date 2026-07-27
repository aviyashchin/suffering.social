import { initialiseTelemetry } from './telemetry-runtime.js';
import { buildInfo } from './runtime-build-info.js';

const environment = {
  VITE_TELEMETRY_ENABLED: import.meta.env.VITE_TELEMETRY_ENABLED,
  VITE_GTM_ENABLED: import.meta.env.VITE_GTM_ENABLED,
  VITE_GTM_CONTAINER_ID: import.meta.env.VITE_GTM_CONTAINER_ID,
  VITE_SENTRY_ENABLED: import.meta.env.VITE_SENTRY_ENABLED,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
};

initialiseTelemetry({
  environment,
  buildInfo,
  windowObject: window,
  documentObject: document,
  loadSentry: () => import('./sentry-loader.js'),
}).catch(() => {
  // Observability must never prevent the research site from rendering.
});
