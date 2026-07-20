import {
  buildEvent,
  buildTelemetryConfig,
  sanitizePostHogProperties,
  scrubSentryEvent,
} from './telemetry-core.js';

function appendProviderScript(documentObject, provider, source) {
  if (documentObject.querySelector(`script[data-telemetry-provider="${provider}"]`)) return;

  const script = documentObject.createElement('script');
  script.async = true;
  script.src = source;
  script.dataset.telemetryProvider = provider;
  documentObject.head.appendChild(script);
}

function installConsentDefaults(windowObject) {
  windowObject.dataLayer = windowObject.dataLayer || [];
  windowObject.gtag =
    windowObject.gtag ||
    ((...args) => {
      windowObject.dataLayer.push(args);
    });
  windowObject.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
}

export async function initialiseTelemetry({
  environment,
  windowObject,
  documentObject,
  loadPostHog,
  loadSentry,
}) {
  if (windowObject.__sufferingTelemetry) return windowObject.__sufferingTelemetry;

  const config = buildTelemetryConfig(environment);
  const enabledProviders = [];
  const globalPrivacyControl = windowObject.navigator?.globalPrivacyControl === true;
  let posthog;
  let clickHandler = null;

  const controller = {
    enabledProviders,
    globalPrivacyControl,
    destroy() {
      if (clickHandler) documentObject.removeEventListener('click', clickHandler);
      if (windowObject.__sufferingTelemetry === controller) {
        delete windowObject.__sufferingTelemetry;
      }
    },
    capture(name, input = {}) {
      const event = buildEvent(name, {
        ...input,
        environment: config.environment,
        pathname: input.pathname || windowObject.location.pathname,
      });
      if (!event) return;

      if (config.ga4.enabled && windowObject.gtag) {
        windowObject.gtag('event', event.name, {
          ...event.properties,
          page_location: `https://${event.properties.canonical_host}${event.properties.pathname}`,
          page_referrer: '',
        });
      }
      posthog?.capture(event.name, event.properties);
    },
  };
  windowObject.__sufferingTelemetry = controller;

  if (config.sentry.enabled) {
    try {
      const sentryModule = await loadSentry();
      const sentry = sentryModule.default || sentryModule;
      sentry.init({
        dsn: config.sentry.dsn,
        environment: config.environment,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        beforeSend: scrubSentryEvent,
      });
      enabledProviders.push('sentry');
    } catch {
      // A blocked or unavailable vendor must not break the site.
    }
  }

  if (config.ga4.enabled || config.gtm.enabled) installConsentDefaults(windowObject);

  if (config.ga4.enabled) {
    windowObject.gtag('js', new Date());
    windowObject.gtag('config', config.ga4.measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      send_page_view: false,
    });
    appendProviderScript(
      documentObject,
      'ga4',
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4.measurementId)}`
    );
    enabledProviders.push('ga4');
  }

  if (config.posthog.enabled) {
    try {
      const posthogModule = await loadPostHog();
      posthog = posthogModule.default || posthogModule;
      posthog.init(config.posthog.key, {
        api_host: config.posthog.host,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        capture_exceptions: false,
        capture_performance: false,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        person_profiles: 'identified_only',
        persistence: 'localStorage',
        save_referrer: false,
        property_denylist: ['$current_url', '$referrer', '$referring_domain'],
        before_send: (event) => ({
          ...event,
          properties: sanitizePostHogProperties(event.properties),
        }),
      });
      enabledProviders.push('posthog');
    } catch {
      // A blocked or unavailable vendor must not break the site.
    }
  }

  if (config.gtm.enabled) {
    windowObject.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    appendProviderScript(
      documentObject,
      'gtm',
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtm.containerId)}`
    );
    enabledProviders.push('gtm');
  }

  controller.capture('page_view');
  clickHandler = (event) => {
    const anchor = event.target.closest?.('a[data-telemetry-cta]');
    if (!anchor) return;
    controller.capture('cta_clicked', {
      ctaId: anchor.dataset.telemetryCta,
      destination: anchor.getAttribute('href'),
    });
  };
  documentObject.addEventListener('click', clickHandler);

  return controller;
}
