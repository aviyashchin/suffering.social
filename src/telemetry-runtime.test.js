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
    VITE_SENTRY_ENABLED: 'true',
    VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
    VITE_SENTRY_RELEASE: 'abc123',
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
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://search.example.com/research?q=private#result',
    });
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

  test('initialises GTM once with every Google consent category denied', async () => {
    expect(typeof runtime.initialiseTelemetry).toBe('function');
    const sentry = { init: jest.fn() };

    const controller = await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: jest.fn(),
      loadSentry: async () => sentry,
    });
    const second = await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: jest.fn(),
      loadSentry: async () => sentry,
    });

    expect(second).toBe(controller);
    expect(controller.globalPrivacyControl).toBe(false);
    expect(controller.enabledProviders).toEqual(['sentry', 'gtm']);
    expect(document.querySelectorAll('script[data-telemetry-provider="ga4"]')).toHaveLength(0);
    expect(document.querySelectorAll('script[data-telemetry-provider="gtm"]')).toHaveLength(1);
    expect(window.dataLayer.map((entry) => Array.from(entry))).toContainEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      },
    ]);
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.ingest.sentry.io/123',
        environment: 'production',
        release: 'abc123',
        sendDefaultPii: false,
        tracesSampleRate: 0,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        beforeSend: expect.any(Function),
      })
    );
  });

  test('pushes one private canonical page view and only approved CTA clicks to dataLayer', async () => {
    expect(typeof runtime.initialiseTelemetry).toBe('function');
    document.body.innerHTML = `
      <a data-telemetry-cta="calculator_open" href="/calculator?utm_source=home">Calculator</a>
      <button data-telemetry-cta="scenario_copy" data-scenario="private">Copy person@example.com</button>
      <a data-telemetry-cta="privacy_open" href="/privacy?email=person@example.com">Unknown</a>
      <a href="https://tracker.example.com/person@example.com">Unannotated</a>
    `;

    const first = await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: jest.fn(),
      loadSentry: async () => ({ init: jest.fn() }),
    });
    const second = await runtime.initialiseTelemetry({
      environment: enabledEnvironment(),
      windowObject: window,
      documentObject: document,
      loadPostHog: jest.fn(),
      loadSentry: async () => ({ init: jest.fn() }),
    });

    expect(second).toBe(first);

    document.querySelector('[data-telemetry-cta="calculator_open"]').click();
    document.querySelector('[data-telemetry-cta="scenario_copy"]').click();
    document.querySelector('[data-telemetry-cta="privacy_open"]').click();
    document.querySelector('a:not([data-telemetry-cta])').click();

    const events = window.dataLayer
      .filter((entry) => entry[0] === 'event')
      .map((entry) => Array.from(entry));
    expect(events).toEqual([
      [
        'event',
        'page_view',
        {
          site_key: 'suffering_social',
          environment: 'production',
          canonical_host: 'www.suffering.social',
          pathname: '/calculator',
          page_location: 'https://www.suffering.social/calculator',
          page_referrer: 'https://search.example.com/research',
        },
      ],
      [
        'event',
        'cta_clicked',
        {
          site_key: 'suffering_social',
          environment: 'production',
          canonical_host: 'www.suffering.social',
          pathname: '/calculator',
          page_location: 'https://www.suffering.social/calculator',
          page_referrer: 'https://search.example.com/research',
          cta_id: 'calculator_open',
        },
      ],
      [
        'event',
        'cta_clicked',
        {
          site_key: 'suffering_social',
          environment: 'production',
          canonical_host: 'www.suffering.social',
          pathname: '/calculator',
          page_location: 'https://www.suffering.social/calculator',
          page_referrer: 'https://search.example.com/research',
          cta_id: 'scenario_copy',
        },
      ],
    ]);
    expect(JSON.stringify(events)).not.toMatch(
      /person@example\.com|private|utm_source|scenario|cookie|text/i
    );
  });
});
