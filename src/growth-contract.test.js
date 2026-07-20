import { existsSync, readFileSync } from 'node:fs';

const pages = [
  ['index.html', 'https://www.suffering.social/'],
  ['calculator.html', 'https://www.suffering.social/calculator'],
  ['social_media_cost_calculatorv5.html', 'https://www.suffering.social/v5'],
  ['privacy.html', 'https://www.suffering.social/privacy'],
];

describe('SEO and telemetry build contract', () => {
  test.each(pages)('%s uses its canonical URL and shared telemetry entrypoint', (file, canonical) => {
    expect(existsSync(file)).toBe(true);
    const html = readFileSync(file, 'utf8');

    expect(html).toContain(`<link rel="canonical" href="${canonical}">`);
    expect(html).toContain(`<meta property="og:url" content="${canonical}">`);
    expect(html).toContain(`<meta name="twitter:url" content="${canonical}">`);
    expect(html).toContain('<script type="module" src="/src/telemetry.js"></script>');
    expect(html).toMatch(/href="\/privacy"/);
    expect(html).not.toMatch(/G-RQ28MDK57K|gtag\s*\(/);
    expect(html).not.toMatch(
      /<link[^>]+rel="(?:preconnect|dns-prefetch)"[^>]+googletagmanager\.com/i
    );
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

  test('both facethecost hosts permanently redirect every path to the canonical host', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

    for (const host of ['facethecost.com', 'www.facethecost.com']) {
      expect(vercel.redirects).toEqual(
        expect.arrayContaining([
          {
            source: '/:path*',
            has: [{ type: 'host', value: host }],
            destination: 'https://www.suffering.social/:path*',
            permanent: true,
          },
        ])
      );
    }
  });

  test('the telemetry entrypoint projects only its explicit public configuration', () => {
    const entrypoint = readFileSync('src/telemetry.js', 'utf8');

    expect(entrypoint).not.toContain('environment: import.meta.env');
    expect(entrypoint).not.toMatch(/\.\.\.import\.meta\.env/);
    for (const key of [
      'MODE',
      'VITE_TELEMETRY_ENABLED',
      'VITE_GA4_ENABLED',
      'VITE_GA_MEASUREMENT_ID',
      'VITE_GTM_ENABLED',
      'VITE_GTM_CONTAINER_ID',
      'VITE_POSTHOG_ENABLED',
      'VITE_POSTHOG_KEY',
      'VITE_POSTHOG_HOST',
      'VITE_SENTRY_ENABLED',
      'VITE_SENTRY_DSN',
    ]) {
      expect(entrypoint).toContain(`${key}: import.meta.env.${key}`);
    }
  });

  test('CI enforces the repository-owned validation gates', () => {
    const workflow = readFileSync('.github/workflows/verify.yml', 'utf8');

    for (const command of [
      'npm ci',
      'npm run verify:fast',
      'npm run lint',
      'npm audit --omit=dev',
    ]) {
      expect(workflow).toContain(`run: ${command}`);
    }
  });

  test('privacy copy describes providers as conditional', () => {
    const privacy = readFileSync('privacy.html', 'utf8');

    expect(privacy).toContain('If enabled, these providers may be used');
    expect(privacy).not.toContain('provides aggregate traffic measurement');
    expect(privacy).not.toContain('provides aggregate product analytics');
  });

  test('active pages contain no person-level identification vendors', () => {
    const activeSource = pages
      .filter(([file]) => existsSync(file))
      .map(([file]) => readFileSync(file, 'utf8'))
      .join('\n');

    expect(activeSource).not.toMatch(
      /<script[^>]+src=["'][^"']*(?:rb2b|retention\.com|vector\.co|leadsy)/i
    );
  });

  test('uses the slim PostHog browser entrypoint', () => {
    const entrypoint = readFileSync('src/telemetry.js', 'utf8');
    expect(entrypoint).toContain(
      "import('posthog-js/dist/module.slim.js')"
    );
    expect(entrypoint).toContain("import('./sentry-loader.js')");
  });
});
