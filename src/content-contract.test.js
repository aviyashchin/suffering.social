import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const calculator = parseHtml('index.html');
const calculatorSource = readFileSync(resolve(root, 'index.html'), 'utf8');
const support = calculator;
const calculatorRedirect = parseHtml('calculator.html');
const privacy = parseHtml('privacy.html');
const legacy = parseHtml('social_media_cost_calculatorv5.html');
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

describe('/ calculator product route contract', () => {
  test('owns calculator-first metadata and SoftwareApplication schema', () => {
    expectMetadata(calculator, 'https://www.suffering.social/');
    expect(calculator.title).toMatch(/cost|estimate/i);
    expect(meta(calculator, 'name', 'description')).toMatch(/estimate|model/i);

    const structuredData = [...calculator.querySelectorAll(
      'script[type="application/ld+json"]'
    )]
      .map((node) => JSON.parse(node.textContent))
      .flatMap((entry) => entry['@graph'] || [entry]);

    expect(
      structuredData.some((entry) => entry['@type'] === 'SoftwareApplication')
    ).toBe(true);
  });

  test('publishes a static evidence and provenance path for search systems', () => {
    const evidenceIndex = calculator.querySelector('#evidence-index');
    const publisher = calculator.querySelector('#about-subconscious');
    const structuredData = [...calculator.querySelectorAll(
      'script[type="application/ld+json"]'
    )]
      .map((node) => JSON.parse(node.textContent))
      .flatMap((entry) => entry['@graph'] || [entry]);
    const application = structuredData.find(
      (entry) => entry['@type'] === 'SoftwareApplication'
    );

    expect(evidenceIndex).not.toBeNull();
    expect(evidenceIndex.querySelectorAll('a[href^="https://"]')).toHaveLength(4);
    expect(normalizedText(evidenceIndex)).toMatch(/illustrative cumulative estimate/i);
    expect(normalizedText(evidenceIndex)).toMatch(/reported finding/i);
    expect(publisher).not.toBeNull();
    expect(normalizedText(publisher)).toMatch(/causal behavioral platform/i);
    expect(
      publisher.querySelector(
        'a[href="https://subconscious.ai/case-studies/methodology-validation"]'
      )
    ).not.toBeNull();
    expect(application.creator).toEqual({
      '@id': 'https://subconscious.ai/#organization',
    });
    expect(application.citation).toHaveLength(4);
    for (const citation of application.citation) {
      expect(evidenceIndex.querySelector(`a[href="${citation}"]`)).not.toBeNull();
    }
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

  test('restores the original calculator instrument without pretending the curves are probabilities', () => {
    const estimateLink = calculator.querySelector(
      'a.estimate-display[href="#assumptions"]'
    );
    const curves = [...calculator.querySelectorAll('.range-curve')];

    expect(estimateLink).not.toBeNull();
    expect(curves).toHaveLength(9);
    for (const parameter of parameterNames) {
      const curve = calculator.querySelector(
        `.range-curve[data-parameter="${parameter}"]`
      );
      expect(curve).not.toBeNull();
      expect(curve.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(curve.querySelector('.range-curve-marker')).not.toBeNull();
    }

    expect(visibleText(calculator)).toMatch(/illustrative range curve/i);
    expect(visibleText(calculator)).not.toMatch(/probability distribution/i);
  });

  test('keeps the educational clock and paper-selection surfaces in the active instrument', () => {
    expect(calculator.querySelector('#cost-clock-total')).not.toBeNull();
    expect(calculator.querySelector('#cost-clock-rate')).toBeNull();
    for (const component of ['mortality', 'mental', 'economic']) {
      expect(calculator.querySelector(`#cost-clock-${component}`)).not.toBeNull();
    }
    expect(
      calculator.querySelector('a.masthead-link[href="https://subconscious.ai"]')
    ).not.toBeNull();
    expect(visibleText(calculator)).not.toMatch(/historical average/i);
    expect(calculatorSource).toMatch(/modelValue:/);
    expect(calculatorSource).toMatch(/does not measure harm as it happens/i);
  });

  test('keeps the proven calculator interface visible instead of hiding its controls', () => {
    const assumptions = calculator.querySelector('#assumptions');

    expect(assumptions?.tagName).toBe('SECTION');
    expect(calculator.querySelector('details.advanced-model')).toBeNull();
    expect(assumptions?.querySelectorAll('.assumption')).toHaveLength(9);
    expect(calculator.querySelector('#hero-total-cost').textContent).toBe(
      '$2,355,067,000,000'
    );
    expect(calculatorSource).not.toContain('editorial-redesign.css');
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

  test('keeps visible control labels inside their accessible names', () => {
    const labeledControls = [
      calculator.querySelector('.wordmark'),
      ...calculator.querySelectorAll('.scenario-btn'),
    ];

    for (const control of labeledControls) {
      expect(control).not.toBeNull();
      const visibleLabel = normalizedText(control);
      expect(visibleLabel).not.toBe('');
      expect(control.getAttribute('aria-label')).toMatch(
        new RegExp(`^${escapeRegex(visibleLabel)}`, 'i')
      );
    }
  });

  test('renders source controls without inherited transparency', () => {
    const calculatorCss = readFileSync(
      resolve(root, 'src/styles/calculator.css'),
      'utf8'
    );

    expect(calculatorCss).toMatch(
      /\.source-link\.info-btn\s*\{[^}]*\bopacity:\s*1\s*;/s
    );
  });

  test('ships only the noUiSlider control runtime', () => {
    const scriptSources = [...calculator.querySelectorAll('script[src]')].map(
      (node) => node.src
    );
    const stylesheetSources = [
      ...calculator.querySelectorAll('link[rel="stylesheet"][href]'),
    ].map((node) => node.href);

    for (const forbidden of [
      /chart(?:\.min)?\.js/i,
      /d3(?:\.v\d+)?(?:\.min)?\.js/i,
      /gsap|scrolltrigger/i,
      /tailwind/i,
      /design-system/i,
    ]) {
      expect(scriptSources).not.toEqual(
        expect.arrayContaining([expect.stringMatching(forbidden)])
      );
    }
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
    expect(calculatorSource).not.toMatch(
      /console\.error\s*\(\s*['"`][^'"`]*\P{ASCII}/u
    );
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

  test('renders the default estimate before JavaScript enhancement', () => {
    expect(calculator.querySelector('#hero-total-cost').textContent).toBe(
      '$2,355,067,000,000'
    );
    expect(calculator.querySelector('#hero-exact-total')).toBeNull();
    expect(calculator.querySelector('#total-cost').textContent).toBe('$2.4T');
  });

  test('uses plain visible copy without long dashes or unexplained research jargon', () => {
    const text = visibleText(calculator);

    expect(text).not.toMatch(/[–—]/);
    expect(text).not.toMatch(/counterfactual|causal inference|attribution/i);
  });

  test('offers a consent-based research update form with a clear status message', () => {
    const form = calculator.querySelector('#research-update-form');

    expect(form).not.toBeNull();
    expect(form.querySelector('input[type="email"][name="email"]')).not.toBeNull();
    expect(form.querySelector('input[type="checkbox"][name="consent"]')).not.toBeNull();
    expect(form.querySelector('[role="status"]')).not.toBeNull();
    expect(form.querySelector('button[type="submit"]')).not.toBeNull();
  });

  test('separates the model from legal outcomes and points distressed readers to help', () => {
    const legalContext = calculator.querySelector('#legal-context');
    const safetyNote = calculator.querySelector('#crisis-support');

    expect(legalContext).not.toBeNull();
    expect(normalizedText(legalContext)).toMatch(/august 26, 2026/i);
    expect(normalizedText(legalContext)).toMatch(
      /not a verdict, settlement value, or estimate of legal damages/i
    );
    expect(
      legalContext.querySelector(
        'a[href="https://www.ag.idaho.gov/newsroom/ag-labrador-delivers-largest-big-tech-settlement-in-history-for-child-protection-against-facebook-instagram/"]'
      )
    ).not.toBeNull();

    expect(safetyNote).not.toBeNull();
    expect(normalizedText(safetyNote)).toMatch(/call or text 988/i);
    expect(safetyNote.querySelector('a[href="https://988lifeline.org/"]')).not.toBeNull();
  });

  test('keeps active styles free of legacy side stripes', () => {
    const activeCss = [
      'src/styles/base.css',
      'src/styles/components.css',
      'src/styles/calculator.css',
      'src/styles/mobile.css',
      'src/styles/history-chapter.css',
      'src/styles/original-instrument.css',
    ]
      .map((path) => readFileSync(resolve(root, path), 'utf8'))
      .join('\n');

    expect(activeCss).not.toMatch(/border-left:\s*(?:[2-9]|[1-9]\d+)px\b/i);
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

describe('/ closing evidence chapter contract', () => {
  test('owns self-referencing metadata and one H1', () => {
    expectMetadata(support, 'https://www.suffering.social/');
    expect(support.querySelectorAll('h1')).toHaveLength(1);
  });

  test('explains the 2011-2012 inflection without overstating causality', () => {
    const text = visibleText(support);
    expect(text).toMatch(/2011/);
    expect(text).toMatch(/2012/);
    expect(text).toMatch(/observed turn|break/i);
    expect(text).toMatch(/cause/);
    expect(text).toMatch(/cannot|does not prove|does not settle/i);
  });

  test('sits after the complete calculator instrument', () => {
    const instrument = support.querySelector('#calculator-experiment');
    const evidence = support.querySelector('#what-happened-2012');
    expect(instrument).not.toBeNull();
    expect(evidence).not.toBeNull();
    expect(
      instrument.compareDocumentPosition(evidence) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});

describe('/ calculator-first research narrative', () => {
  test('makes the calculator the root experience and closes with the 2012 evidence', () => {
    expect(support.querySelector('#hero-total-cost')).not.toBeNull();
    expect(support.querySelector('#attribution-nouislider')).not.toBeNull();
    expect(
      support.querySelector(
        'script[type="module"][src="/src/calculator-bootstrap.js"]'
      )
    ).not.toBeNull();

    const calculator = support.querySelector('#calculator-experiment');
    const evidence = support.querySelector('#what-happened-2012');

    expect(calculator).not.toBeNull();
    expect(evidence).not.toBeNull();
    expect(
      calculator.compareDocumentPosition(evidence) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(normalizedText(evidence)).toMatch(/what changed.*2012/i);
  });

  test('keeps the public narrative self-contained', () => {
    expect(visibleText(support)).not.toMatch(
      /aaru|simile|facebook|instagram|tiktok|snapchat/i
    );
    expect(support.querySelectorAll('h1')).toHaveLength(1);
    expectMetadata(support, 'https://www.suffering.social/');
  });
});

describe('/calculator compatibility route contract', () => {
  test('points readers and crawlers to the root calculator', () => {
    expect(calculatorRedirect.querySelector('meta[name="robots"]')?.content).toMatch(
      /noindex/
    );
    expect(calculatorRedirect.querySelector('link[rel="canonical"]')?.href).toBe(
      'https://www.suffering.social/'
    );
    expect(calculatorRedirect.querySelector('a[href="/"]')).not.toBeNull();
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

describe('public voice contract', () => {
  const publicPages = [calculator, calculatorRedirect, privacy, legacy];
  const publicTextAssets = [
    readFileSync(resolve(root, 'public/llms.txt'), 'utf8'),
  ];
  const bannedPhrases = [
    /and\s+here is (?:the|a) kicker/i,
    /here is what people miss/i,
    /here is the part that no one talks about/i,
    /that distinction matters/i,
  ];
  const litotes = [
    /\bnot (?:bad|uncommon|insignificant|impossible|unreasonable|unimportant)\b/i,
    /\bno small (?:feat|matter|task)\b/i,
  ];
  const negativeParallelism =
    /(?:,\s*not\b|\bnot just\b|\bit (?:is|was|does|did|can) not\b[^.!?]{0,100}[,;:]\s*it (?:is|was|does|did|can)\b)/i;

  test('keeps every public page free of long dashes and stock AI phrasing', () => {
    const publicText = [
      ...publicPages.map((page) => visibleText(page)),
      ...publicTextAssets,
    ];

    for (const text of publicText) {
      expect(text).not.toMatch(/[–—]/);
      expect(text).not.toMatch(/\b(?:quietly|alignment|balanced|quiet)\b/i);
      expect(text).not.toMatch(negativeParallelism);
      for (const phrase of [...bannedPhrases, ...litotes]) {
        expect(text).not.toMatch(phrase);
      }
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

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
