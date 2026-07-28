import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const calculator = parseHtml('calculator.html');
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
