import {
  buildEvent,
  buildTelemetryConfig,
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
    function gtag() {
      windowObject.dataLayer.push(arguments);
    };
  windowObject.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
}

export async function initialiseTelemetry({
  environment,
  buildInfo,
  windowObject,
  documentObject,
  loadSentry,
}) {
  if (windowObject.__sufferingTelemetry) return windowObject.__sufferingTelemetry;

  const config = buildTelemetryConfig(environment, buildInfo);
  const enabledProviders = [];
  const globalPrivacyControl = windowObject.navigator?.globalPrivacyControl === true;
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
        location: input.location || windowObject.location.href,
        referrer: input.referrer || documentObject.referrer,
      });
      if (!event) return;

      if (config.gtm.enabled) {
        windowObject.dataLayer.push({ event: event.name, ...event.properties });
      }
    },
  };
  windowObject.__sufferingTelemetry = controller;

  if (config.gtm.enabled) {
    installConsentDefaults(windowObject);
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
    const target = event.target.closest?.('[data-telemetry-cta]');
    if (!target) return;
    controller.capture('cta_clicked', {
      ctaId: target.dataset.telemetryCta,
    });
  };
  documentObject.addEventListener('click', clickHandler);

  if (config.sentry.enabled) {
    try {
      const sentryModule = await loadSentry();
      const sentry = sentryModule.default || sentryModule;
      sentry.init({
        dsn: config.sentry.dsn,
        environment: config.environment,
        release: config.sentry.release,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        integrations(defaultIntegrations) {
          return defaultIntegrations.filter(
            (integration) => !/(?:replay|browser.?tracing|tracing)/i.test(integration.name || '')
          );
        },
        beforeSend: scrubSentryEvent,
      });
      enabledProviders.push('sentry');
    } catch {
      // A blocked or unavailable vendor must not break the site.
    }
  }

  return controller;
}
