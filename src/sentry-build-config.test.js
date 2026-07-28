import * as sentryBuild from './sentry-build-config.js';

describe('Sentry build configuration', () => {
  test('does not generate or upload source maps when runtime Sentry is disabled', () => {
    expect(typeof sentryBuild.resolveSentryBuildConfig).toBe('function');
    expect(sentryBuild.resolveSentryBuildConfig({}, 'build')).toEqual({ enabled: false });
  });

  test('fails a build when runtime Sentry lacks private upload credentials', () => {
    expect(typeof sentryBuild.resolveSentryBuildConfig).toBe('function');
    expect(() =>
      sentryBuild.resolveSentryBuildConfig(
        {
          VITE_TELEMETRY_ENABLED: 'true',
          VITE_SENTRY_ENABLED: 'true',
          VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
        },
        'build'
      )
    ).toThrow(/SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT, VERCEL_GIT_COMMIT_SHA/);
  });

  test('enables private upload only with the complete runtime and build contract', () => {
    expect(typeof sentryBuild.resolveSentryBuildConfig).toBe('function');
    const completeEnvironment = {
      VITE_TELEMETRY_ENABLED: 'true',
      VITE_SENTRY_ENABLED: 'true',
      VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
      SENTRY_AUTH_TOKEN: 'secret',
      SENTRY_ORG: 'subconscious',
      SENTRY_PROJECT: 'suffering-social',
      VERCEL_GIT_COMMIT_SHA: 'abc123',
      VERCEL_ENV: 'production',
    };

    expect(() =>
      sentryBuild.resolveSentryBuildConfig(
        { ...completeEnvironment, VERCEL_ENV: '' },
        'build'
      )
    ).toThrow(/VERCEL_ENV/);

    expect(
      sentryBuild.resolveSentryBuildConfig(completeEnvironment, 'build')
    ).toEqual({ enabled: true, release: 'abc123', environment: 'production' });
  });
});
