import { expect, test } from '@playwright/test';

const prohibitedProviderPattern =
  /(?:lemlist|clarity\.ms|rb2b|vector(?:\.co|\.dev|\.com)|leadsy|posthog|doubleclick|googleadservices|googlesyndication|replay)/i;
const providerPattern =
  /(?:googletagmanager|google-analytics|sentry|ingest\.[^/]*sentry)/i;
const privateTokens = [
  'private-query-canary',
  'private-fragment-canary',
  'private-scenario-canary',
  'privacy@example.com',
  'privacy%40example.com',
];
const defaultBaseURL = 'http://127.0.0.1:4174';

function telemetryEnvironmentForBaseURL(baseURL) {
  const target = new URL(baseURL);
  return ['127.0.0.1', 'localhost'].includes(target.hostname)
    ? 'development'
    : 'production';
}

function expectedTelemetryEnvironment() {
  return telemetryEnvironmentForBaseURL(
    process.env.PLAYWRIGHT_BASE_URL || defaultBaseURL
  );
}

function observePage(page) {
  const pageErrors = [];
  const failedFirstPartyRequests = [];
  const requests = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    const headers = request.headers();
    requests.push({
      url: request.url(),
      method: request.method(),
      postData: request.postData() || '',
      headers: Object.fromEntries(
        ['content-type', 'origin', 'referer'].flatMap((name) =>
          headers[name] ? [[name, headers[name]]] : []
        )
      ),
    });
  });
  page.on('requestfailed', (request) => {
    const url = new URL(request.url());
    if (url.origin === new URL(page.url()).origin) {
      failedFirstPartyRequests.push(
        `${request.method()} ${url.pathname}: ${request.failure()?.errorText}`
      );
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (
      page.url() &&
      url.origin === new URL(page.url()).origin &&
      response.status() >= 400
    ) {
      failedFirstPartyRequests.push(
        `${response.request().method()} ${url.pathname}: ${response.status()}`
      );
    }
  });

  return { pageErrors, failedFirstPartyRequests, requests };
}

async function expectHealthyPage(page, observations) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
  expect(observations.pageErrors).toEqual([]);
  expect(observations.failedFirstPartyRequests).toEqual([]);
  const prohibitedHosts = observations.requests
    .filter((request) => prohibitedProviderPattern.test(request.url))
    .map((request) => new URL(request.url).hostname);
  expect(prohibitedHosts).toEqual([]);
  const gtmRequestCount = observations.requests.filter((request) =>
    /googletagmanager\.com\/gtm\.js/i.test(request.url)
  ).length;
  expect(gtmRequestCount).toBe(1);
}

async function expectSequentialHeadings(page) {
  const levels = await page
    .locator(
      'main h1, main h2, main h3, [role="dialog"]:not(.hidden) h2, [role="dialog"]:not(.hidden) h3, [role="dialog"]:not(.hidden) h4'
    )
    .evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1)))
    );

  expect(levels[0]).toBe(1);
  for (let index = 1; index < levels.length; index += 1) {
    expect(
      levels[index] - levels[index - 1],
      `heading level ${levels[index - 1]} must not skip to ${levels[index]}`
    ).toBeLessThanOrEqual(1);
  }
}

async function tabTo(locator, page) {
  const focusableCount = await page
    .locator(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    .count();
  for (let index = 0; index <= focusableCount; index += 1) {
    await page.keyboard.press('Tab');
    if (
      await locator.evaluate((element) => element === document.activeElement)
    ) {
      return;
    }
  }
  throw new Error(
    `Target did not receive focus within one traversal of ${focusableCount} controls`
  );
}

async function expectVisibleFocus(locator) {
  await expect(locator).toBeFocused();
  const focusStyle = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(focusStyle.outlineWidth).not.toBe('0px');
}

test.describe('public research journey', () => {
  test('maps local and production targets to their exact telemetry environment', () => {
    expect(telemetryEnvironmentForBaseURL(defaultBaseURL)).toBe('development');
    expect(telemetryEnvironmentForBaseURL('https://www.suffering.social')).toBe(
      'production'
    );
  });

  test('moves from the support page through scenario, copy, source, and methodology', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const observations = observePage(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expectSequentialHeadings(page);
    await expectHealthyPage(page, observations);
    observations.requests.length = 0;

    await page.getByRole('link', { name: 'Explore the calculator' }).click();
    await expect(page).toHaveURL(/\/calculator$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await page.waitForFunction(() => Boolean(window.calculator));

    const baselineEstimate = await page
      .locator('#hero-total-cost')
      .textContent();
    await page
      .getByRole('button', {
        name: 'Lower-bound assumption — load assumptions',
      })
      .click();
    await expect(page.locator('#hero-total-cost')).not.toHaveText(
      baselineEstimate || ''
    );

    await page.getByRole('button', { name: 'Copy this scenario' }).click();
    await expect(page.locator('.research-toast[role="status"]')).toHaveText(
      'Scenario link copied to the clipboard.'
    );
    await expect
      .poll(() =>
        context.pages()[0].evaluate(() => navigator.clipboard.readText())
      )
      .toContain('/calculator?');

    await page.getByRole('button', { name: 'U.S. DOT guidance' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Value of Statistical Life' })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close research details' }).click();

    await page.getByRole('button', { name: 'Read methodology' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Calculation methodology' })
    ).toBeVisible();
    await expectSequentialHeadings(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await expectHealthyPage(page, observations);
  });

  test('keeps query, hash, email, and scenario state out of provider payloads', async ({
    page,
  }) => {
    const observations = observePage(page);
    const syntheticProviderURL = 'https://www.google-analytics.com/g/collect';
    await page.route(syntheticProviderURL, (route) =>
      route.fulfill({
        status: 204,
        headers: { 'access-control-allow-origin': '*' },
        body: '',
      })
    );
    await page.route(/googletagmanager\.com\/gtm\.js/i, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          const sendWhenReady = (attempt = 0) => {
            const pageView = Array.isArray(window.dataLayer)
              ? window.dataLayer.find(
              (entry) => entry && entry.event === 'page_view' && entry.site_key === 'suffering_social'
                )
              : undefined;
            if (!pageView) {
              if (attempt < 50) {
                setTimeout(() => sendWhenReady(attempt + 1), 10);
              }
              return;
            }
            void fetch('${syntheticProviderURL}', {
              method: 'POST',
              headers: { 'content-type': 'text/plain' },
              body: JSON.stringify(pageView)
            }).catch(() => {});
          };
          setTimeout(sendWhenReady, 0);
        `,
      })
    );

    await page.goto(
      '/calculator?utm_source=private-query-canary&scenario=private-scenario-canary&email=privacy%40example.com#private-fragment-canary'
    );
    await page.waitForFunction(() => Boolean(window.__sufferingTelemetry));
    await expect
      .poll(
        () =>
          observations.requests.filter(
            (request) => request.url === syntheticProviderURL
          ).length
      )
      .toBe(1);

    await page.getByRole('button', { name: 'U.S. DOT guidance' }).click();

    const providerRequests = observations.requests.filter((request) =>
      providerPattern.test(request.url)
    );
    expect(providerRequests.length).toBeGreaterThan(0);

    const dataLayer = await page.evaluate(() => window.dataLayer);
    const providerEvidence = JSON.stringify(providerRequests).toLowerCase();
    const leakLocations = [];
    for (const token of privateTokens) {
      if (providerEvidence.includes(token.toLowerCase())) {
        leakLocations.push('provider request URL, body, or allowlisted header');
      }
      if (
        JSON.stringify(dataLayer).toLowerCase().includes(token.toLowerCase())
      ) {
        leakLocations.push('dataLayer');
      }
    }
    expect([...new Set(leakLocations)]).toEqual([]);

    const normalizedEvents = dataLayer.filter(
      (entry) => entry?.site_key === 'suffering_social'
    );
    const pageViews = normalizedEvents.filter(
      (entry) => entry.event === 'page_view'
    );
    const expectedPageView = {
      event: 'page_view',
      site_key: 'suffering_social',
      environment: expectedTelemetryEnvironment(),
      canonical_host: 'www.suffering.social',
      pathname: '/calculator',
      page_location: 'https://www.suffering.social/calculator',
      page_referrer: '',
    };
    expect(pageViews).toHaveLength(1);
    expect(pageViews[0]).toEqual(expectedPageView);
    expect(normalizedEvents.map((entry) => entry.event).sort()).toEqual([
      'cta_clicked',
      'page_view',
    ]);
    expect(
      normalizedEvents.find((entry) => entry.event === 'cta_clicked')
    ).toMatchObject({ cta_id: 'source_inspect', pathname: '/calculator' });

    // This is a separate, deterministic test-only stand-in for a GTM-managed
    // downstream tag. It proves the provider request receives only the
    // repository's normalized page-view object.
    const syntheticProviderRequests = providerRequests.filter(
      (request) => request.url === syntheticProviderURL
    );
    expect(syntheticProviderRequests.length).toBe(1);
    expect(syntheticProviderRequests[0].method).toBe('POST');
    expect(JSON.parse(syntheticProviderRequests[0].postData)).toEqual(
      expectedPageView
    );
    expect(syntheticProviderRequests[0].headers['content-type']).toContain(
      'text/plain'
    );

    await expectHealthyPage(page, observations);
  });

  test('supports a keyboard-only mobile journey without overflow or a focus trap', async ({
    context,
    page,
  }, testInfo) => {
    test.skip(!testInfo.project.use.isMobile);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const observations = observePage(page);

    await page.goto('/');
    await expectSequentialHeadings(page);
    await expectHealthyPage(page, observations);
    observations.requests.length = 0;
    const calculatorLink = page.getByRole('link', {
      name: 'Explore the calculator',
    });
    await tabTo(calculatorLink, page);
    await expect(calculatorLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/calculator$/);
    await page.waitForFunction(() => Boolean(window.calculator));

    const scenarioNames = [
      'Research baseline — load assumptions',
      'Lower-bound assumption — load assumptions',
      'Platform-disclosures case — load assumptions',
      'Upper-bound assumption — load assumptions',
    ];
    const scenarios = scenarioNames.map((name) =>
      page.getByRole('button', { name })
    );
    await tabTo(scenarios[0], page);
    for (let index = 0; index < scenarios.length; index += 1) {
      await expectVisibleFocus(scenarios[index]);
      await expect(scenarios[index]).toHaveAccessibleName(scenarioNames[index]);
      await expect(scenarios[index]).toHaveAttribute(
        'aria-pressed',
        index === 0 ? 'true' : 'false'
      );
      if (index < scenarios.length - 1) {
        await page.keyboard.press('Tab');
      }
    }

    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    const scenario = scenarios[1];
    await expectVisibleFocus(scenario);

    const baselineEstimate = await page
      .locator('#hero-total-cost')
      .textContent();
    await page.keyboard.press('Enter');
    await expect(scenario).toHaveAttribute('aria-pressed', 'true');
    for (const inactiveScenario of [scenarios[0], scenarios[2], scenarios[3]]) {
      await expect(inactiveScenario).toHaveAttribute('aria-pressed', 'false');
    }
    await expect(page.locator('#hero-total-cost')).not.toHaveText(
      baselineEstimate || ''
    );

    const sliders = page.getByRole('slider');
    await expect(sliders).toHaveCount(9);
    for (let index = 0; index < 9; index += 1) {
      const slider = sliders.nth(index);
      await expect(slider).toHaveAccessibleName(/.+/);
      await expect(slider).toHaveAttribute('aria-valuenow', /.+/);
      await expect(slider).toHaveAttribute('aria-valuetext', /.+/);
    }

    const firstSlider = sliders.first();
    await tabTo(firstSlider, page);
    await expectVisibleFocus(firstSlider);
    const sliderValueBefore = Number(
      await firstSlider.getAttribute('aria-valuenow')
    );
    await page.keyboard.press('ArrowRight');
    await expect(firstSlider).not.toHaveAttribute(
      'aria-valuenow',
      String(sliderValueBefore)
    );
    const sliderValueAfter = Number(
      await firstSlider.getAttribute('aria-valuenow')
    );
    await expect
      .poll(() => page.evaluate(() => window.calculator.parameters.vsl))
      .toBe(sliderValueAfter);

    const source = page.getByRole('button', { name: 'U.S. DOT guidance' });
    await tabTo(source, page);
    await expectVisibleFocus(source);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Close research details' })
    ).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(
      page.getByRole('link', { name: 'Open study' }).last()
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Close research details' })
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(source).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(firstSlider).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(source).toBeFocused();

    const copyScenario = page.getByRole('button', {
      name: 'Copy this scenario',
    });
    await tabTo(copyScenario, page);
    await expectVisibleFocus(copyScenario);
    await page.keyboard.press('Enter');
    await expect(page.locator('.research-toast[role="status"]')).toHaveText(
      'Scenario link copied to the clipboard.'
    );
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('/calculator?');

    const methodology = page.getByRole('button', {
      name: 'Read methodology',
    });
    await tabTo(methodology, page);
    await expectVisibleFocus(methodology);
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Calculation methodology' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(methodology).toBeFocused();

    await expectSequentialHeadings(page);
    await expectHealthyPage(page, observations);
  });
});
