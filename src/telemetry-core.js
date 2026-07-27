const SITE_KEY = 'suffering_social';
const CANONICAL_HOST = 'www.suffering.social';
const CTA_IDS = new Set([
  'calculator_open',
  'scenario_copy',
  'scenario_share',
  'source_inspect',
  'research_exit',
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

export function buildTelemetryConfig(environment = {}, buildInfo = {}) {
  const globallyEnabled = isTrue(environment.VITE_TELEMETRY_ENABLED);
  const measurementId = environment.VITE_GA_MEASUREMENT_ID || '';
  const containerId = environment.VITE_GTM_CONTAINER_ID || '';
  const posthogKey = environment.VITE_POSTHOG_KEY || '';
  const posthogHost = environment.VITE_POSTHOG_HOST || '';
  const sentryDsn = environment.VITE_SENTRY_DSN || '';
  const release = buildInfo.release || '';
  const deploymentEnvironment = buildInfo.environment || '';

  return {
    environment: deploymentEnvironment || 'development',
    ga4: {
      enabled: false,
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
      enabled: false,
      key: posthogKey,
      host: posthogHost,
    },
    sentry: {
      enabled:
        globallyEnabled &&
        isTrue(environment.VITE_SENTRY_ENABLED) &&
        isHttpsUrl(sentryDsn) &&
        Boolean(release) &&
        Boolean(deploymentEnvironment),
      dsn: sentryDsn,
      release,
    },
  };
}

export function canonicalPathname(value = '/') {
  if (!value) return '/';

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

export function buildEvent(name, input = {}) {
  if (name !== 'page_view' && name !== 'cta_clicked') return null;

  const properties = {
    site_key: SITE_KEY,
    environment: input.environment || 'production',
    canonical_host: CANONICAL_HOST,
    pathname: canonicalPathname(input.pathname),
    page_location: `https://${CANONICAL_HOST}${canonicalPathname(input.pathname)}`,
    page_referrer: stripUrlQuery(input.referrer) || '',
  };

  if (name === 'cta_clicked') {
    if (!CTA_IDS.has(input.ctaId)) return null;
    properties.cta_id = input.ctaId;
  }

  return { name, properties };
}

export function sanitizePostHogProperties(properties) {
  return properties?.site_key ? { site_key: properties.site_key } : {};
}

function stripUrlQuery(value) {
  if (!value) return undefined;

  try {
    const url = new URL(value, 'https://www.suffering.social');
    return `https://${url.host}${url.pathname}`;
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

function scrubStacktrace(stacktrace) {
  if (!stacktrace?.frames) return undefined;

  return {
    frames: stacktrace.frames.map((frame) => ({
      filename: stripUrlQuery(frame.filename) || redactText(frame.filename),
      lineno: frame.lineno,
      colno: frame.colno,
      in_app: frame.in_app,
    })),
  };
}

export function scrubSentryEvent(event) {
  const scrubbed = {};
  for (const property of [
    'event_id',
    'timestamp',
    'platform',
    'level',
    'logger',
    'release',
    'environment',
    'dist',
    'sdk',
  ]) {
    if (event[property] !== undefined) scrubbed[property] = event[property];
  }

  if (event.exception?.values) {
    scrubbed.exception = {
      ...event.exception,
      values: event.exception.values.map((exception) => ({
        type: exception.type,
        value: '[redacted-error]',
        mechanism: exception.mechanism
          ? {
              type: exception.mechanism.type,
              handled: exception.mechanism.handled,
            }
          : undefined,
        stacktrace: scrubStacktrace(exception.stacktrace),
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
