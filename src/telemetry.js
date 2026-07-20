import { initialiseTelemetry } from './telemetry-runtime.js';

initialiseTelemetry({
  environment: {
    MODE: import.meta.env.MODE,
    VITE_TELEMETRY_ENABLED: import.meta.env.VITE_TELEMETRY_ENABLED,
    VITE_GA4_ENABLED: import.meta.env.VITE_GA4_ENABLED,
    VITE_GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID,
    VITE_GTM_ENABLED: import.meta.env.VITE_GTM_ENABLED,
    VITE_GTM_CONTAINER_ID: import.meta.env.VITE_GTM_CONTAINER_ID,
    VITE_POSTHOG_ENABLED: import.meta.env.VITE_POSTHOG_ENABLED,
    VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
    VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
    VITE_SENTRY_ENABLED: import.meta.env.VITE_SENTRY_ENABLED,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  },
  windowObject: window,
  documentObject: document,
  loadPostHog: () => import('posthog-js/dist/module.slim.js'),
  loadSentry: () => import('./sentry-loader.js'),
}).catch(() => {
  // Observability must never prevent the research site from rendering.
});
