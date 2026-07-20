import { jest } from '@jest/globals';

let runtime = {};

beforeAll(async () => {
  runtime = await import('./telemetry-runtime.js').catch(() => ({}));
});

function enabledEnvironment() {
  return {
    MODE: 'production',
    VITE_TELEMETRY_ENABLED: 'true',
    VITE_GA4_ENABLED: 'true',
    VITE_GA_MEASUREMENT_ID: 'G-ABC1234',
    VITE_GTM_ENABLED: 'true',
    VITE_GTM_CONTAINER_ID: 'GTM-ABC123',
    VITE_POSTHOG_ENABLED: 'true',
    VITE_POSTHOG_KEY: 'phc_abc123',
    VITE_POSTHOG_HOST: 'https://us.i.posthog.com',
    VITE_SENTRY_ENABLED: 'true',
    VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
  };
}

describe('browser telemetry runtime', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    delete window.dataLayer;
    delete window.gtag;
    delete window.__sufferingTelemetry;
    window.history.replaceState({}, '', '/calculator?email=person@example.com');
  });

  afterEach(() => window.__sufferingTelemetry?.destroy());

  test('loads nothing when deployment configuration is absent', async () => {
    expect(typeof runtime.initialiseTelemetry).toBe('function');
    const loadPostHog = jest.fn();
    const loadSentry = jest.fn();

    const controller = await runtime.initialiseTelemetry({
      environment: {},
      windowObject: window,
      documentObject: document,
      loadPostHog,
      loadSentry,
    });

    expect(controller.enabledProviders).toEqual([]);
    expect(document.querySelectorAll('script[data-telemetry-provider]')).toHaveLength(0);
    expect(loadPostHog).not.toHaveBeenCalled();
    expect(loadSentry).not.toHaveBeenCalled();
  });

  test('initialises each provider once with advertising denied and private defaults', async () => {
    expect(typeof runtime.initialiseTelemetry).toBe('function');
    const posthog = { init: jest.fn(), capture: jest.fn() };
    const sentry = { init: jest.fn() };

    const controller = await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: async () => posthog,
      loadSentry: async () => sentry,
    });
    const second = await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: async () => posthog,
      loadSentry: async () => sentry,
    });

    expect(second).toBe(controller);
    expect(controller.globalPrivacyControl).toBe(false);
    expect(controller.enabledProviders).toEqual(['sentry', 'ga4', 'posthog', 'gtm']);
    expect(document.querySelectorAll('script[data-telemetry-provider="ga4"]')).toHaveLength(1);
    expect(document.querySelectorAll('script[data-telemetry-provider="gtm"]')).toHaveLength(1);
    expect(window.dataLayer).toContainEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ]);
    expect(window.dataLayer).toContainEqual([
      'config',
      'G-ABC1234',
      {
        allow_ad_personalization_signals: false,
        allow_google_signals: false,
        send_page_view: false,
      },
    ]);
    expect(posthog.init).toHaveBeenCalledWith(
      'phc_abc123',
      expect.objectContaining({
        api_host: 'https://us.i.posthog.com',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        capture_exceptions: false,
        capture_performance: false,
        advanced_disable_flags: true,
        person_profiles: 'identified_only',
        property_denylist: ['$current_url', '$referrer', '$referring_domain'],
        before_send: expect.any(Function),
      })
    );
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.ingest.sentry.io/123',
        environment: 'production',
        sendDefaultPii: false,
        tracesSampleRate: 0,
        beforeSend: expect.any(Function),
      })
    );
    const posthogConfig = posthog.init.mock.calls[0][1];
    expect(
      posthogConfig.before_send({
        event: 'page_view',
        properties: {
          site_key: 'suffering_social',
          $current_url: 'https://www.suffering.social/calculator?email=person@example.com',
          $referrer: 'https://search.example.com/?q=sensitive',
        },
      })
    ).toEqual({ event: 'page_view', properties: { site_key: 'suffering_social' } });
  });

  test('emits one canonical page view and only annotated CTA clicks', async () => {
    expect(typeof runtime.initialiseTelemetry).toBe('function');
    document.body.innerHTML = `
      <a data-telemetry-cta="calculator_open" href="/calculator?utm_source=home">Calculator</a>
      <a href="https://tracker.example.com/person@example.com">Untracked</a>
    `;
    const posthog = { init: jest.fn(), capture: jest.fn() };

    await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: async () => posthog,
      loadSentry: async () => ({ init: jest.fn() }),
    });

    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledWith('page_view', {
      site_key: 'suffering_social',
      environment: 'production',
      canonical_host: 'www.suffering.social',
      pathname: '/calculator',
    });

    document.querySelector('[data-telemetry-cta]').click();
    document.querySelector('a:not([data-telemetry-cta])').click();

    expect(posthog.capture).toHaveBeenCalledTimes(2);
    expect(posthog.capture).toHaveBeenLastCalledWith(
      'cta_clicked',
      expect.objectContaining({
        cta_id: 'calculator_open',
        destination_host: 'www.suffering.social',
      })
    );
    expect(
      window.dataLayer.filter((entry) => Array.isArray(entry) && entry[0] === 'event')
    ).toHaveLength(2);
    expect(
      window.dataLayer.filter((entry) => Array.isArray(entry) && entry[0] === 'event')[0]
    ).toEqual([
      'event',
      'page_view',
      expect.objectContaining({
        page_location: 'https://www.suffering.social/calculator',
        page_referrer: '',
      }),
    ]);
  });
});
