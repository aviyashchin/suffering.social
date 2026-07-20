import * as telemetry from './telemetry-core.js';

const validEnvironment = {
  DEV: false,
  PROD: true,
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

describe('telemetry configuration', () => {
  test('fails closed when deployment flags and identifiers are absent', () => {
    expect(typeof telemetry.buildTelemetryConfig).toBe('function');

    expect(telemetry.buildTelemetryConfig({})).toEqual({
      environment: 'development',
      ga4: { enabled: false, measurementId: '' },
      gtm: { enabled: false, containerId: '' },
      posthog: { enabled: false, key: '', host: '' },
      sentry: { enabled: false, dsn: '' },
    });
  });

  test('enables only providers with an explicit global flag and valid identifiers', () => {
    expect(typeof telemetry.buildTelemetryConfig).toBe('function');

    const config = telemetry.buildTelemetryConfig(validEnvironment);

    expect(config.ga4.enabled).toBe(true);
    expect(config.gtm.enabled).toBe(true);
    expect(config.posthog.enabled).toBe(true);
    expect(config.sentry.enabled).toBe(true);
    expect(config.environment).toBe('production');
  });

  test('rejects malformed identifiers and non-https collector URLs', () => {
    expect(typeof telemetry.buildTelemetryConfig).toBe('function');

    const config = telemetry.buildTelemetryConfig({
      ...validEnvironment,
      VITE_GA_MEASUREMENT_ID: 'UA-legacy',
      VITE_GTM_CONTAINER_ID: 'not-gtm',
      VITE_POSTHOG_HOST: 'http://collector.example.com',
      VITE_SENTRY_DSN: 'javascript:alert(1)',
    });

    expect(config.ga4.enabled).toBe(false);
    expect(config.gtm.enabled).toBe(false);
    expect(config.posthog.enabled).toBe(false);
    expect(config.sentry.enabled).toBe(false);
  });
});

describe('canonical analytics events', () => {
  test.each([
    ['/social_media_cost_calculatorv5.html?share=1', '/v5'],
    ['/calculator.html', '/calculator'],
    ['/?utm_source=test', '/'],
  ])('maps %s to the canonical pathname %s', (input, expected) => {
    expect(typeof telemetry.canonicalPathname).toBe('function');
    expect(telemetry.canonicalPathname(input)).toBe(expected);
  });

  test('builds a page view without query strings or arbitrary properties', () => {
    expect(typeof telemetry.buildEvent).toBe('function');

    expect(
      telemetry.buildEvent('page_view', {
        pathname: '/calculator?email=person@example.com',
        ignored: 'sensitive input',
      })
    ).toEqual({
      name: 'page_view',
      properties: {
        site_key: 'suffering_social',
        environment: 'production',
        canonical_host: 'www.suffering.social',
        pathname: '/calculator',
      },
    });
  });

  test('accepts only allowlisted CTA identifiers and destination hosts', () => {
    expect(typeof telemetry.buildEvent).toBe('function');

    expect(
      telemetry.buildEvent('cta_clicked', {
        pathname: '/',
        ctaId: 'calculator_open',
        destination: 'https://www.suffering.social/calculator?utm_source=home',
      })
    ).toEqual({
      name: 'cta_clicked',
      properties: {
        site_key: 'suffering_social',
        environment: 'production',
        canonical_host: 'www.suffering.social',
        pathname: '/',
        cta_id: 'calculator_open',
        destination_host: 'www.suffering.social',
      },
    });

    expect(
      telemetry.buildEvent('cta_clicked', {
        pathname: '/',
        ctaId: 'free-form-value',
        destination: 'https://tracker.example.com/person@example.com',
      })
    ).toBeNull();
  });

  test('rejects events outside the public event contract', () => {
    expect(typeof telemetry.buildEvent).toBe('function');
    expect(telemetry.buildEvent('slider_changed', { value: 42 })).toBeNull();
  });

  test('removes PostHog URL and referrer defaults at the SDK boundary', () => {
    expect(typeof telemetry.sanitizePostHogProperties).toBe('function');

    expect(
      telemetry.sanitizePostHogProperties({
        site_key: 'suffering_social',
        $current_url: 'https://www.suffering.social/calculator?email=person@example.com',
        $referrer: 'https://search.example.com/?q=sensitive',
        $referring_domain: 'search.example.com',
      })
    ).toEqual({ site_key: 'suffering_social' });
  });
});

describe('Sentry privacy scrubbing', () => {
  test('removes user, request data, query strings, and sensitive breadcrumbs', () => {
    expect(typeof telemetry.scrubSentryEvent).toBe('function');

    const scrubbed = telemetry.scrubSentryEvent({
      user: { email: 'person@example.com' },
      message: 'Invalid value for person@example.com at https://www.suffering.social/?token=secret',
      exception: { values: [{ type: 'Error', value: 'Rejected person@example.com' }] },
      extra: { calculatorInput: 'person@example.com' },
      contexts: { custom: { raw: 'sensitive input' } },
      request: {
        url: 'https://www.suffering.social/calculator?email=person@example.com',
        query_string: 'email=person@example.com',
        cookies: { session: 'secret' },
        headers: { authorization: 'secret' },
        data: { note: 'sensitive input' },
      },
      breadcrumbs: [
        { category: 'console', message: 'person@example.com' },
        { category: 'navigation', data: { from: '/?secret=1', to: '/calculator?secret=2' } },
      ],
    });

    expect(scrubbed.user).toBeUndefined();
    expect(scrubbed.extra).toBeUndefined();
    expect(scrubbed.contexts).toBeUndefined();
    expect(scrubbed.message).toBe(
      'Invalid value for [redacted-email] at https://www.suffering.social/'
    );
    expect(scrubbed.exception.values[0].value).toBe('Rejected [redacted-email]');
    expect(scrubbed.request).toEqual({ url: 'https://www.suffering.social/calculator' });
    expect(scrubbed.breadcrumbs).toEqual([
      { category: 'navigation', data: { from: '/', to: '/calculator' } },
    ]);
  });
});
