const SITE_KEY = 'suffering_social';
const CANONICAL_HOST = 'www.suffering.social';
const CTA_IDS = new Set([
  'calculator_open',
  'legacy_calculator_open',
  'privacy_open',
  'share_open',
  'subconscious_open',
]);
const DESTINATION_HOSTS = new Set([
  'www.suffering.social',
  'suffering.social',
  'www.subconscious.ai',
  'subconscious.ai',
  'x.com',
  'twitter.com',
  'www.linkedin.com',
  'www.facebook.com',
  'www.reddit.com',
]);

function isTrue(value) {
  return value === true || value === 'true';
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function buildTelemetryConfig(environment = {}) {
  const globallyEnabled = isTrue(environment.VITE_TELEMETRY_ENABLED);
  const measurementId = environment.VITE_GA_MEASUREMENT_ID || '';
  const containerId = environment.VITE_GTM_CONTAINER_ID || '';
  const posthogKey = environment.VITE_POSTHOG_KEY || '';
  const posthogHost = environment.VITE_POSTHOG_HOST || '';
  const sentryDsn = environment.VITE_SENTRY_DSN || '';

  return {
    environment: environment.MODE || 'development',
    ga4: {
      enabled:
        globallyEnabled &&
        isTrue(environment.VITE_GA4_ENABLED) &&
        /^G-[A-Z0-9]+$/.test(measurementId),
      measurementId,
    },
    gtm: {
      enabled:
        globallyEnabled &&
        isTrue(environment.VITE_GTM_ENABLED) &&
        /^GTM-[A-Z0-9]+$/.test(containerId),
      containerId,
    },
    posthog: {
      enabled:
        globallyEnabled &&
        isTrue(environment.VITE_POSTHOG_ENABLED) &&
        /^phc_[A-Za-z0-9_-]+$/.test(posthogKey) &&
        isHttpsUrl(posthogHost),
      key: posthogKey,
      host: posthogHost,
    },
    sentry: {
      enabled:
        globallyEnabled &&
        isTrue(environment.VITE_SENTRY_ENABLED) &&
        isHttpsUrl(sentryDsn),
      dsn: sentryDsn,
    },
  };
}

export function canonicalPathname(value = '/') {
  let pathname;
  try {
    pathname = new URL(value, 'https://www.suffering.social').pathname;
  } catch {
    return '/';
  }

  if (pathname === '/social_media_cost_calculatorv5.html') return '/v5';
  if (pathname === '/calculator.html') return '/calculator';
  if (pathname === '/index.html') return '/';
  return pathname || '/';
}

function destinationHost(value) {
  try {
    const host = new URL(value, 'https://www.suffering.social').hostname;
    return DESTINATION_HOSTS.has(host) ? host : '';
  } catch {
    return '';
  }
}

export function buildEvent(name, input = {}) {
  if (name !== 'page_view' && name !== 'cta_clicked') return null;

  const properties = {
    site_key: SITE_KEY,
    environment: input.environment || 'production',
    canonical_host: CANONICAL_HOST,
    pathname: canonicalPathname(input.pathname),
  };

  if (name === 'cta_clicked') {
    const host = destinationHost(input.destination);
    if (!CTA_IDS.has(input.ctaId) || !host) return null;
    properties.cta_id = input.ctaId;
    properties.destination_host = host;
  }

  return { name, properties };
}

export function sanitizePostHogProperties(properties) {
  const sanitized = { ...properties };
  for (const property of [
    '$current_url',
    '$initial_current_url',
    '$referrer',
    '$initial_referrer',
    '$referring_domain',
    '$initial_referring_domain',
  ]) {
    delete sanitized[property];
  }
  return sanitized;
}

function stripUrlQuery(value) {
  try {
    const url = new URL(value, 'https://www.suffering.social');
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

function redactText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/https?:\/\/[^\s?]+(?:\?[^\s]*)?/g, (url) => stripUrlQuery(url) || '[redacted-url]');
}

export function scrubSentryEvent(event) {
  const scrubbed = { ...event };
  delete scrubbed.user;
  delete scrubbed.extra;
  delete scrubbed.contexts;
  delete scrubbed.fingerprint;

  if (scrubbed.message) scrubbed.message = redactText(scrubbed.message);
  if (event.exception?.values) {
    scrubbed.exception = {
      ...event.exception,
      values: event.exception.values.map((exception) => ({
        ...exception,
        value: redactText(exception.value),
      })),
    };
  }

  if (event.request) {
    const url = stripUrlQuery(event.request.url);
    scrubbed.request = url ? { url } : {};
  }

  scrubbed.breadcrumbs = (event.breadcrumbs || [])
    .filter((breadcrumb) => breadcrumb.category === 'navigation')
    .map((breadcrumb) => ({
      category: 'navigation',
      data: {
        from: canonicalPathname(breadcrumb.data?.from),
        to: canonicalPathname(breadcrumb.data?.to),
      },
    }));

  return scrubbed;
}
