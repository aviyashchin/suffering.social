import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const calculator = parseHtml('calculator.html');
const calculatorSource = readFileSync(resolve(root, 'calculator.html'), 'utf8');
const support = parseHtml('index.html');
const scenarioNames = ['reset', 'optimistic', 'facebookFiles', 'aggressive'];
const parameterNames = [
  'vsl',
  'suicides',
  'attribution',
  'depression',
  'yld',
  'qol',
  'healthcare',
  'productivity',
  'duration',
];

describe('/calculator product route contract', () => {
  test('owns calculator-first metadata and SoftwareApplication schema', () => {
    expectMetadata(calculator, 'https://www.suffering.social/calculator');
    expect(calculator.title).toMatch(/calculator/i);
    expect(meta(calculator, 'name', 'description')).toMatch(/calculator/i);

    const structuredData = [...calculator.querySelectorAll(
      'script[type="application/ld+json"]'
    )]
      .map((node) => JSON.parse(node.textContent))
      .flatMap((entry) => entry['@graph'] || [entry]);

    expect(
      structuredData.some((entry) => entry['@type'] === 'SoftwareApplication')
    ).toBe(true);
  });

  test('has one H1 and frames the estimate with uncertainty', () => {
    expect(calculator.querySelectorAll('h1')).toHaveLength(1);
    expect(visibleText(calculator)).toMatch(/estimat/i);
    expect(visibleText(calculator)).toMatch(/uncertain|caveat|illustrative/i);
  });

  test('keeps every assumption control and exposes sources, methodology, and limitations', () => {
    for (const parameter of parameterNames) {
      expect(calculator.querySelector(`#${parameter}-nouislider`)).not.toBeNull();
      expect(calculator.querySelector(`#${parameter}-value`)).not.toBeNull();
    }

    const text = visibleText(calculator);
    expect(text).toMatch(/source|citation/i);
    expect(text).toMatch(/methodolog/i);
    expect(text).toMatch(/limitation/i);
  });

  test('names the four research engagement actions', () => {
    const actionNames = [
      'scenario_copy',
      'scenario_share',
      'source_inspect',
      'research_exit',
    ];

    for (const actionName of actionNames) {
      expect(
        calculator.querySelector(`[data-telemetry-cta="${actionName}"]`)
      ).not.toBeNull();
    }
  });

  test('renders exactly one control for each internal scenario', () => {
    for (const scenarioName of scenarioNames) {
      expect(
        calculator.querySelectorAll(`[data-scenario="${scenarioName}"]`)
      ).toHaveLength(1);
    }
  });

  test('ships only the noUiSlider control runtime', () => {
    const scriptSources = [...calculator.querySelectorAll('script[src]')].map(
      (node) => node.src
    );
    const stylesheetSources = [
      ...calculator.querySelectorAll('link[rel="stylesheet"][href]'),
    ].map((node) => node.href);

    expect(scriptSources).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/chart(?:\.min)?\.js/i),
        expect.stringMatching(/d3(?:\.v\d+)?(?:\.min)?\.js/i),
        expect.stringMatching(/gsap|scrolltrigger/i),
        expect.stringMatching(/tailwind/i),
        expect.stringMatching(/design-system/i),
      ])
    );
    expect([...scriptSources, ...stylesheetSources]).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/cdn\.jsdelivr\.net/i)])
    );
    expect(
      calculator.querySelector('script[type="module"][src="/src/calculator-bootstrap.js"]')
    ).not.toBeNull();
    expect(calculatorSource).not.toMatch(/loadChartJsFallback|window\.tailwind/);
  });

  test('contains no production debug, simulated activity, or compatibility surfaces', () => {
    expect(calculatorSource).not.toMatch(/window\.test[A-Z]/);
    expect(calculatorSource).not.toMatch(/Debug utilities available|testAllNewFeatures/);
    expect(calculatorSource).not.toMatch(/console\.(?:log|warn)\s*\(/);
    expect(calculatorSource).not.toMatch(/console\.error\s*\(\s*['"`][^'"`]*[^\x00-\x7F]/);
    expect(calculatorSource).not.toMatch(/setInterval\s*\(/);
    expect(calculatorSource).not.toMatch(
      /live-total-|live-daily-|live-average-|live-recent-|running-counter|debt-clock-total|sticky-cumulative-|progression-chart|composition-chart|share-canvas/
    );
    expect(calculator.querySelector('.engine-compat')).toBeNull();
  });

  test('initializes the visible calculator once without legacy runtime calls', () => {
    const initialization = calculatorSource.match(
      /init\(\)\s*\{([\s\S]*?)\n\s{12}\}/
    )?.[1];

    expect(initialization).toBeDefined();
    expect(initialization).not.toMatch(
      /Distribution|DebtClock|RunningCounter|LiveActivity|Progression|Composition|SocialPreview|ScrollMorph/
    );
    expect(calculatorSource.match(/new SocialMediaCalculator\(\)/g)).toHaveLength(
      1
    );
  });

  test('keeps the calculator source under its runtime-debt budget', () => {
    expect(Buffer.byteLength(calculatorSource, 'utf8')).toBeLessThan(170_000);
  });
});

describe('test runner isolation contract', () => {
  test('keeps Jest away from Playwright and reserves an isolated local port', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(root, 'package.json'), 'utf8')
    );
    const playwrightConfig = readFileSync(
      resolve(root, 'playwright.config.js'),
      'utf8'
    );

    expect(packageJson.jest.testPathIgnorePatterns).toContain(
      '<rootDir>/tests/e2e/'
    );
    expect(playwrightConfig).toMatch(/127\.0\.0\.1:4174/);
    expect(playwrightConfig).toMatch(/reuseExistingServer:\s*false/);
    expect(playwrightConfig).not.toMatch(/127\.0\.0\.1:4173/);
  });
});

describe('/ support route contract', () => {
  test('owns self-referencing metadata and one H1', () => {
    expectMetadata(support, 'https://www.suffering.social/');
    expect(support.querySelectorAll('h1')).toHaveLength(1);
  });

  test('explains the 2011-2012 inflection without overstating causality', () => {
    const text = visibleText(support);
    expect(text).toMatch(/2011/);
    expect(text).toMatch(/2012/);
    expect(text).toMatch(/inflection/);
    expect(text).toMatch(/causal/);
    expect(text).toMatch(/correlation|counterfactual|cannot|does not prove/i);
  });

  test('has one dominant Explore the calculator link', () => {
    const dominantLinks = [
      ...support.querySelectorAll(
        'a[href="/calculator"][data-primary-cta="calculator"]'
      ),
    ];

    expect(dominantLinks).toHaveLength(1);
    expect(normalizedText(dominantLinks[0])).toBe('Explore the calculator');
  });

  test('does not embed calculator range controls or assumption groups', () => {
    expect(support.querySelectorAll('input[type="range"]')).toHaveLength(0);
    expect(support.querySelectorAll('[data-param]')).toHaveLength(0);
  });
});

describe('legacy /v5 route contract', () => {
  test('remains buildable but is absent from primary navigation', () => {
    expect(existsSync(resolve(root, 'social_media_cost_calculatorv5.html'))).toBe(
      true
    );

    for (const page of [support, calculator]) {
      expect(
        page.querySelectorAll(
          'header a[href="/v5"], nav a[href="/v5"], [aria-label*="navigation" i] a[href="/v5"]'
        )
      ).toHaveLength(0);
    }
  });
});

function parseHtml(file) {
  return new DOMParser().parseFromString(
    readFileSync(resolve(root, file), 'utf8'),
    'text/html'
  );
}

function expectMetadata(document, expectedUrl) {
  expect(document.querySelector('link[rel="canonical"]')?.href).toBe(expectedUrl);
  expect(meta(document, 'property', 'og:url')).toBe(expectedUrl);
  expect(meta(document, 'name', 'twitter:url')).toBe(expectedUrl);
}

function meta(document, attribute, value) {
  return (
    document.querySelector(`meta[${attribute}="${value}"]`)?.content || ''
  );
}

function visibleText(document) {
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('script, style, template, [hidden]').forEach((node) => {
    node.remove();
  });
  return normalizedText(clone);
}

function normalizedText(node) {
  return node.textContent.replace(/\s+/g, ' ').trim();
}
