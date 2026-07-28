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

  const url = parseHttpUrl(value);
  if (!url) return '/';
  const pathname = sanitizePathname(url.pathname);

  if (pathname === '/social_media_cost_calculatorv5.html') return '/v5';
  if (pathname === '/calculator.html') return '/calculator';
  if (pathname === '/index.html') return '/';
  return pathname || '/';
}

export function buildEvent(name, input = {}) {
  if (name !== 'page_view' && name !== 'cta_clicked') return null;

  const pathname = canonicalPathname(input.pathname);
  const properties = {
    site_key: SITE_KEY,
    environment: input.environment || 'production',
    canonical_host: CANONICAL_HOST,
    pathname,
    page_location: `https://${CANONICAL_HOST}${pathname}`,
    page_referrer: stripReferrerOrigin(input.referrer) || '',
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
  const url = parseHttpUrl(value);
  if (!url) return undefined;
  return `https://${url.host}${sanitizePathname(url.pathname)}`;
}

function stripReferrerOrigin(value) {
  const url = parseHttpUrl(value);
  if (!url) return undefined;
  return `https://${url.host}`;
}

function parseHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    const url = new URL(value, 'https://www.suffering.social');
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url
      : undefined;
  } catch {
    return undefined;
  }
}

function sanitizePathname(pathname) {
  const segments = pathname.split('/').map((segment) => {
    let decoded = segment;
    for (let index = 0; index < 10; index += 1) {
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch {
        break;
      }
    }

    return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(decoded)
      ? 'redacted'
      : segment;
  });
  return segments.join('/') || '/';
}

function scrubStacktrace(stacktrace) {
  if (!stacktrace?.frames) return undefined;

  return {
    frames: stacktrace.frames.map((frame) => ({
      filename: stripUrlQuery(frame.filename),
      lineno: frame.lineno,
      colno: frame.colno,
      in_app: frame.in_app,
    })),
  };
}

function scrubDebugMeta(debugMeta) {
  const images = (debugMeta?.images || [])
    .filter(
      (image) =>
        image?.type === 'sourcemap' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          image.debug_id || ''
        )
    )
    .map((image) => ({
      type: 'sourcemap',
      code_file: stripUrlQuery(image.code_file),
      debug_id: image.debug_id,
    }))
    .filter((image) => image.code_file);

  return images.length ? { images } : undefined;
}

export function scrubSentryEvent(event) {
  // An explicit non-routable address prevents Sentry Relay from deriving
  // visitor geography from the envelope connection when no user is supplied.
  const scrubbed = { user: { ip_address: '0.0.0.0' } };
  for (const property of [
    'event_id',
    'timestamp',
    'platform',
    'level',
    'release',
    'environment',
    'dist',
    'sdk',
  ]) {
    if (event[property] !== undefined) scrubbed[property] = event[property];
  }

  if (event.exception?.values) {
    scrubbed.exception = {
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

  const debugMeta = scrubDebugMeta(event.debug_meta);
  if (debugMeta) scrubbed.debug_meta = debugMeta;

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
