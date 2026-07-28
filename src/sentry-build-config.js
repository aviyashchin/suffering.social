function isEnabled(value) {
  return value === true || value === 'true';
}

function hasSentryDsn(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveSentryBuildConfig(environment = {}, command = 'build') {
  const runtimeEnabled =
    isEnabled(environment.VITE_TELEMETRY_ENABLED) &&
    isEnabled(environment.VITE_SENTRY_ENABLED) &&
    hasSentryDsn(environment.VITE_SENTRY_DSN);

  if (!runtimeEnabled || command !== 'build') return { enabled: false };

  const required = [
    'SENTRY_AUTH_TOKEN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'VERCEL_GIT_COMMIT_SHA',
    'VERCEL_ENV',
  ];
  const missing = required.filter((name) => !environment[name]);
  if (missing.length) {
    throw new Error(`Sentry build configuration missing: ${missing.join(', ')}`);
  }

  return {
    enabled: true,
    release: environment.VERCEL_GIT_COMMIT_SHA,
    environment: environment.VERCEL_ENV,
  };
}
