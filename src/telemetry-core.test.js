import * as telemetry from './telemetry-core.js';

const validEnvironment = {
  DEV: false,
  PROD: true,
  VITE_TELEMETRY_ENABLED: 'true',
  VITE_GA4_ENABLED: 'true',
  VITE_GA_MEASUREMENT_ID: 'G-ABC1234',
  VITE_GTM_ENABLED: 'true',
  VITE_GTM_CONTAINER_ID: 'GTM-ABC123',
  VITE_SENTRY_ENABLED: 'true',
  VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
};
const validBuildInfo = { release: 'abc123', environment: 'production' };

describe('telemetry configuration', () => {
  test('fails closed when deployment flags and identifiers are absent', () => {
    expect(typeof telemetry.buildTelemetryConfig).toBe('function');

    expect(telemetry.buildTelemetryConfig({}, {})).toEqual({
      environment: 'development',
      ga4: { enabled: false, measurementId: '' },
      gtm: { enabled: false, containerId: '' },
      posthog: { enabled: false, key: '', host: '' },
      sentry: { enabled: false, dsn: '', release: '' },
    });
  });

  test('enables only aggregate GTM and release-bound Sentry', () => {
    expect(typeof telemetry.buildTelemetryConfig).toBe('function');

    const config = telemetry.buildTelemetryConfig(validEnvironment, validBuildInfo);

    expect(config.ga4.enabled).toBe(false);
    expect(config.gtm.enabled).toBe(true);
    expect(config.posthog.enabled).toBe(false);
    expect(config.sentry.enabled).toBe(true);
    expect(config.sentry.release).toBe('abc123');
    expect(config.environment).toBe('production');
  });

  test('keeps Sentry disabled without both a release and an explicit environment', () => {
    const withoutRelease = telemetry.buildTelemetryConfig(validEnvironment, {
      ...validBuildInfo,
      release: '',
    });
    const withoutEnvironment = telemetry.buildTelemetryConfig(validEnvironment, {
      ...validBuildInfo,
      environment: '',
    });

    expect(withoutRelease.sentry.enabled).toBe(false);
    expect(withoutEnvironment.sentry.enabled).toBe(false);
    expect(validEnvironment).not.toHaveProperty('VITE_SENTRY_RELEASE');
    expect(validEnvironment).not.toHaveProperty('MODE');
  });

  test('rejects malformed identifiers, direct PostHog, and Sentry without a release', () => {
    expect(typeof telemetry.buildTelemetryConfig).toBe('function');

    const config = telemetry.buildTelemetryConfig(
      {
        ...validEnvironment,
        VITE_GA_MEASUREMENT_ID: 'UA-legacy',
        VITE_GTM_CONTAINER_ID: 'not-gtm',
        VITE_POSTHOG_ENABLED: 'true',
        VITE_POSTHOG_KEY: 'phc_abc123',
        VITE_POSTHOG_HOST: 'http://collector.example.com',
        VITE_SENTRY_DSN: 'javascript:alert(1)',
      },
      validBuildInfo
    );

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
    [null, '/'],
    ['', '/'],
  ])('maps %s to the canonical pathname %s', (input, expected) => {
    expect(typeof telemetry.canonicalPathname).toBe('function');
    expect(telemetry.canonicalPathname(input)).toBe(expected);
  });

  test('builds a page view with HTTPS pathname-only location and referrer', () => {
    expect(typeof telemetry.buildEvent).toBe('function');

    expect(
      telemetry.buildEvent('page_view', {
        pathname: '/calculator?scenario=maximum#results',
        location: 'http://www.suffering.social/calculator?email=person@example.com#results',
        referrer: 'http://search.example.com/research?q=private#answer',
        scenario: { mortality: 0.42 },
        email: 'person@example.com',
        cookie: 'session=secret',
        domText: 'private calculator result',
        ignored: 'sensitive input',
      })
    ).toEqual({
      name: 'page_view',
      properties: {
        site_key: 'suffering_social',
        environment: 'production',
        canonical_host: 'www.suffering.social',
        pathname: '/calculator',
        page_location: 'https://www.suffering.social/calculator',
        page_referrer: 'https://search.example.com/research',
      },
    });
  });

  test.each([
    'calculator_open',
    'scenario_copy',
    'scenario_share',
    'source_inspect',
    'research_exit',
  ])('accepts the approved aggregate CTA identifier %s', (ctaId) => {
    expect(typeof telemetry.buildEvent).toBe('function');

    expect(
      telemetry.buildEvent('cta_clicked', {
        pathname: '/calculator?scenario=high',
        location: 'https://www.suffering.social/calculator?email=person@example.com',
        referrer: 'https://search.example.com/?q=private',
        ctaId,
        destination: 'https://tracker.example.com/person@example.com?result=private',
        scenarioValue: 42,
        email: 'person@example.com',
        cookie: 'secret',
        domText: 'private result',
      })
    ).toEqual({
      name: 'cta_clicked',
      properties: {
        site_key: 'suffering_social',
        environment: 'production',
        canonical_host: 'www.suffering.social',
        pathname: '/calculator',
        page_location: 'https://www.suffering.social/calculator',
        page_referrer: 'https://search.example.com/',
        cta_id: ctaId,
      },
    });
  });

  test.each([
    'legacy_calculator_open',
    'privacy_open',
    'share_open',
    'subconscious_open',
    'free-form-value',
  ])('drops the unapproved CTA identifier %s', (ctaId) => {
    expect(
      telemetry.buildEvent('cta_clicked', {
        pathname: '/',
        ctaId,
        destination: 'https://www.suffering.social/calculator',
      })
    ).toBeNull();
  });

  test('rejects events outside the public event contract', () => {
    expect(typeof telemetry.buildEvent).toBe('function');
    expect(telemetry.buildEvent('slider_changed', { value: 42 })).toBeNull();
  });

  test('removes PostHog identity, URL, referrer, and arbitrary defaults at the SDK boundary', () => {
    expect(typeof telemetry.sanitizePostHogProperties).toBe('function');

    expect(
      telemetry.sanitizePostHogProperties({
        site_key: 'suffering_social',
        $current_url: 'https://www.suffering.social/calculator?email=person@example.com',
        $referrer: 'https://search.example.com/?q=sensitive',
        $referring_domain: 'search.example.com',
        $user_id: 'person@example.com',
        distinct_id: 'person@example.com',
        email: 'person@example.com',
        calculator_value: 42,
        arbitrary_dom_text: 'private result',
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
      tags: { scenario: 'maximum', calculator_value: 42 },
      contexts: { custom: { raw: 'sensitive input' } },
      request: {
        url: 'https://www.suffering.social/calculator?email=person@example.com',
        query_string: 'email=person@example.com',
        cookies: { session: 'secret' },
        headers: { authorization: 'secret' },
        data: { note: 'sensitive input' },
      },
      replay_id: 'replay-secret',
      breadcrumbs: [
        { category: 'console', message: 'person@example.com' },
        { category: 'navigation', data: { from: '/?secret=1', to: '/calculator?secret=2' } },
      ],
    });

    expect(scrubbed.user).toBeUndefined();
    expect(scrubbed.extra).toBeUndefined();
    expect(scrubbed.tags).toBeUndefined();
    expect(scrubbed.contexts).toBeUndefined();
    expect(scrubbed.replay_id).toBeUndefined();
    expect(scrubbed.message).toBe(
      'Invalid value for [redacted-email] at https://www.suffering.social/'
    );
    expect(scrubbed.exception.values[0].value).toBe('Rejected [redacted-email]');
    expect(scrubbed.request).toEqual({ url: 'https://www.suffering.social/calculator' });
    expect(scrubbed.breadcrumbs).toEqual([
      { category: 'navigation', data: { from: '/', to: '/calculator' } },
    ]);
  });

  test('does not synthesize a request URL from a missing value', () => {
    const scrubbed = telemetry.scrubSentryEvent({ request: { url: null } });

    expect(scrubbed.request).toEqual({});
  });
});
