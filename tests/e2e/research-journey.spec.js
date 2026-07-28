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

function observePage(page) {
  const pageErrors = [];
  const failedFirstPartyRequests = [];
  const requests = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
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
  expect(
    observations.requests.filter((url) => prohibitedProviderPattern.test(url))
  ).toEqual([]);
  expect(
    observations.requests.filter((url) =>
      /googletagmanager\.com\/gtm\.js/i.test(url)
    )
  ).toHaveLength(1);
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

async function tabTo(locator, page, maximumTabs = 12) {
  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press('Tab');
    if (
      await locator.evaluate((element) => element === document.activeElement)
    ) {
      return;
    }
  }
  throw new Error(
    `Target did not receive focus within ${maximumTabs} Tab presses`
  );
}

test.describe('public research journey', () => {
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
      .getByRole('button', { name: 'Load lower-bound assumptions' })
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
    await page.route(/googletagmanager\.com\/gtm\.js/i, (route) =>
      route.abort('blockedbyclient')
    );

    await page.goto(
      '/calculator?utm_source=private-query-canary&scenario=private-scenario-canary&email=privacy%40example.com#private-fragment-canary'
    );
    await page.waitForFunction(() => Boolean(window.__sufferingTelemetry));

    const providerRequests = observations.requests.filter((url) =>
      providerPattern.test(url)
    );
    expect(providerRequests.length).toBeGreaterThan(0);

    const providerAndDataLayer = JSON.stringify({
      providerRequests,
      dataLayer: await page.evaluate(() => window.dataLayer),
    }).toLowerCase();
    for (const token of privateTokens) {
      expect(providerAndDataLayer).not.toContain(token.toLowerCase());
    }

    await expectHealthyPage(page, observations);
  });

  test('supports a keyboard-only mobile journey without overflow or a focus trap', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium');
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

    const scenario = page.getByRole('button', {
      name: 'Load lower-bound assumptions',
    });
    await scenario.focus();
    await expect(scenario).toBeFocused();
    const focusStyle = await scenario.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(focusStyle.outlineStyle).not.toBe('none');
    expect(focusStyle.outlineWidth).not.toBe('0px');

    const baselineEstimate = await page
      .locator('#hero-total-cost')
      .textContent();
    await page.keyboard.press('Enter');
    await expect(scenario).toHaveAttribute('aria-pressed', 'true');
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

    const source = page.getByRole('button', { name: 'U.S. DOT guidance' });
    await source.focus();
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

    await expectSequentialHeadings(page);
    await expectHealthyPage(page, observations);
  });
});
