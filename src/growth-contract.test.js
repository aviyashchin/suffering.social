import { existsSync, readFileSync } from 'node:fs';

const pages = [
  ['index.html', 'https://www.suffering.social/'],
  ['calculator.html', 'https://www.suffering.social/calculator'],
  ['social_media_cost_calculatorv5.html', 'https://www.suffering.social/v5'],
  ['privacy.html', 'https://www.suffering.social/privacy'],
];

describe('SEO and telemetry build contract', () => {
  test.each(pages)('%s uses its canonical URL and one shared telemetry entrypoint', (file, canonical) => {
    expect(existsSync(file)).toBe(true);
    const html = readFileSync(file, 'utf8');

    expect(html).toContain(`<link rel="canonical" href="${canonical}">`);
    expect(html).toContain(`<meta property="og:url" content="${canonical}">`);
    expect(html).toContain(`<meta name="twitter:url" content="${canonical}">`);
    expect(
      html.match(
        /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']\/src\/telemetry\.js["'])[^>]*><\/script>/gi
      )
    ).toHaveLength(1);
    expect(html).toMatch(/href="\/privacy"/);
  });

  test('sitemap and robots expose only the canonical www routes', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    const robots = readFileSync('public/robots.txt', 'utf8');

    for (const [, canonical] of pages) expect(sitemap).toContain(`<loc>${canonical}</loc>`);
    expect(sitemap).not.toContain('https://suffering.social/');
    expect(robots).toContain('Sitemap: https://www.suffering.social/sitemap.xml');
  });

  test('the clean v5 URL is rewritten rather than redirected to an implementation filename', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

    expect(vercel.redirects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ source: '/v5' })])
    );
    expect(vercel.rewrites).toEqual(
      expect.arrayContaining([
        { source: '/v5', destination: '/social_media_cost_calculatorv5' },
      ])
    );
  });

  test('legacy facethecost hosts permanently redirect every path before route redirects', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const hostRedirects = ['facethecost.com', 'www.facethecost.com'].map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: 'https://www.suffering.social/:path*',
      permanent: true,
    }));

    expect(vercel.redirects.slice(0, 2)).toEqual(hostRedirects);
  });

  test('active pages contain no direct analytics or identification vendor loader', () => {
    const active = pages.filter(([file]) => existsSync(file));
    expect(active.length).toBeGreaterThan(0);

    for (const [file] of active) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(
        /googletagmanager\.com\/(?:gtm\.js|gtag\/js)|google-analytics\.com\/(?:analytics|ga|urchin)\.js|googletagservices\.com|googleadservices\.com|googlesyndication\.com\/pagead/i
      );
      expect(source).not.toMatch(/\bgtag\s*\(/i);
      expect(source).not.toMatch(
        /<script[^>]+(?:src|data-domain|data-key)=["'][^"']*(?:lemlist|clarity|posthog|sentry-cdn|ravenjs|r[e]?b2b|retention\.com|vector\.co|leadsy|fullstory|hotjar|session[-_.]?replay)/i
      );
      expect(source).not.toMatch(
        /app\.lemlist\.com|clarity\.ms|(?:app|[a-z]{2}\.i)\.posthog\.com|posthog-js|(?:browser|js)\.sentry-cdn\.com|cdn\.ravenjs\.com|r[e]?b2b\.com|s3-us-west-2\.amazonaws\.com\/b2bjsstore|ddwl4m2hdecbv\.cloudfront\.net|retention\.com|vector\.co|leadsy|fullstory|hotjar/i
      );
      expect(source).not.toMatch(/clarity\s*\(\s*["']set["']/i);
      expect(source).not.toMatch(/\b(?:R?EB2B|RB2B|PostHog|Leadsy)\b\s*[.=]/i);
    }
  });

  test('active pages use repository-owned styles rather than runtime design CDNs', () => {
    const active = pages.filter(([file]) => existsSync(file));

    for (const [file] of active) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/cdn\.tailwindcss\.com|cdn\.jsdelivr\.net\/npm\/tailwindcss/i);
      expect(source).not.toMatch(
        /<link[^>]+href=["']https:\/\/subconscious-ai\.github\.io\/design-system\//i
      );
    }
  });

  test('the shared entrypoint delegates all browser telemetry to the local runtime', () => {
    const entrypoint = readFileSync('src/telemetry.js', 'utf8');
    const projectedVariables = [
      'VITE_TELEMETRY_ENABLED',
      'VITE_GTM_ENABLED',
      'VITE_GTM_CONTAINER_ID',
      'VITE_SENTRY_ENABLED',
      'VITE_SENTRY_DSN',
    ];

    expect(entrypoint).toContain("import { initialiseTelemetry } from './telemetry-runtime.js'");
    for (const variable of projectedVariables) {
      expect(entrypoint).toContain(`${variable}: import.meta.env.${variable}`);
    }
    expect(entrypoint.match(/import\.meta\.env\.VITE_[A-Z0-9_]+/g)?.sort()).toEqual(
      projectedVariables.map((variable) => `import.meta.env.${variable}`).sort()
    );
    expect(entrypoint).not.toMatch(/\.\.\.\s*import\.meta\.env|environment\s*:\s*import\.meta\.env/);
    expect(entrypoint).not.toMatch(
      /VERCEL_|SENTRY_AUTH_TOKEN|SENTRY_ORG|SENTRY_PROJECT|VITE_GA4_ENABLED|VITE_GA_MEASUREMENT_ID|VITE_POSTHOG/
    );
    expect(entrypoint).not.toMatch(
      /googletagmanager|google-analytics|googletagservices|gtag\s*\(|lemlist|clarity|posthog|r[e]?b2b|leadsy/i
    );
  });

  test('coverage targets active telemetry modules and Playwright has a real e2e entrypoint', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

    expect(packageJson.jest.collectCoverageFrom).toEqual([
      'src/**/*.js',
      '!src/**/*.test.js',
      '!src/d3-distribution-sliders.js',
    ]);
    expect(packageJson.scripts['test:e2e']).toBe('playwright test');
    expect(packageJson.devDependencies['@playwright/test']).toBeTruthy();
    expect(existsSync('playwright.config.js')).toBe(true);

    if (existsSync('playwright.config.js')) {
      const config = readFileSync('playwright.config.js', 'utf8');
      expect(config).toContain('PLAYWRIGHT_BASE_URL');
      expect(config).toContain('http://127.0.0.1:4174');
      expect(config).toContain('chromium');
      expect(config).toContain('vite preview --host 127.0.0.1 --port 4174');
      expect(config).toContain('reuseExistingServer: false');
    }
  });
});
