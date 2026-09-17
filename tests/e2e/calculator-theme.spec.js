import { chromium, expect, test } from '@playwright/test';

test('uses Floral tokens and a light, readable selected source', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'floral');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(42, 24, 84)');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(248, 242, 220)'
  );
  const curve = page.locator('.range-curve[data-parameter="vsl"]');
  const source = curve
    .locator('.study-choice')
    .filter({ hasText: 'EPA guidance' });
  await source.click();
  await expect(source).toHaveAttribute('aria-pressed', 'true');
  await expect(source).toHaveCSS('color', 'rgb(42, 24, 84)');
  const paint = await source.evaluate((element) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    context.fillStyle = getComputedStyle(element).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data];
  });
  expect(Math.min(...paint.slice(0, 3))).toBeGreaterThan(180);
  await expect(page.locator('#vsl-value')).toHaveText('$12.8M');
  await expect(page.locator('#cost-clock-mortality')).toHaveText('8,910 lives');
});

test('fits source text and selection labels inside narrower desktop rows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));
  await page.evaluate(() =>
    document.getElementById('vsl-nouislider').noUiSlider.set(14)
  );
  const rows = page.locator(
    '.range-curve[data-parameter="vsl"] .study-choice-item'
  );
  const overflow = await rows.evaluateAll((items) =>
    items.some((item) =>
      [...item.querySelectorAll('.study-choice > *, .study-choice-state')].some(
        (el) => {
          const box = el.getBoundingClientRect();
          const row = item.getBoundingClientRect();
          const source = item
            .querySelector('.research-source-trigger')
            ?.getBoundingClientRect();
          return (
            el.scrollWidth > el.clientWidth + 1 ||
            box.right > row.right + 1 ||
            (source &&
              box.right > source.left + 1 &&
              box.top < source.bottom &&
              box.bottom > source.top)
          );
        }
      )
    )
  );
  expect(overflow).toBe(false);
  expect(
    await rows
      .locator('.study-choice-finding')
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  ).toBeGreaterThanOrEqual(14);
});

test('retains a visible slider handle under browser-forced darkening', async ({
  baseURL,
}) => {
  const browser = await chromium.launch({
    args: ['--blink-settings=forceDarkModeEnabled=true'],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1024, height: 900 },
    });
    await page.goto(baseURL);
    await page.waitForFunction(() => Boolean(window.calculator));
    const handle = page.locator('#vsl-nouislider .noUi-handle');
    await handle.scrollIntoViewIfNeeded();
    const screenshot = await handle.screenshot();
    const visiblePixels = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) > 80) count++;
      }
      return count;
    }, screenshot.toString('base64'));
    expect(visiblePixels).toBeGreaterThan(30);
  } finally {
    await browser.close();
  }
});


test('persists palette and mode without hijacking calculator keyboard controls', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open theme picker' });
  await toggle.click();
  await page.getByRole('button', { name: 'Stripe', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 37, 64)');
  await page.keyboard.press('Escape');
  await expect(page.locator('#__sc-theme-panel')).not.toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'stripe');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  await toggle.click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.locator('body').click({ position: { x: 3, y: 200 } });
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'stripe');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
});

test('keeps source details close to the curve and source rows compact', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/');
  const curve = page.locator('.range-curve[data-parameter="vsl"]');
  const details = curve.locator('.evidence-details');
  await expect(details.locator('summary')).toHaveText('Sources & values');
  const gap = await details.evaluate(el => el.getBoundingClientRect().top - el.closest('.range-curve').querySelector('.range-curve-plot').getBoundingClientRect().bottom);
  expect(gap).toBeLessThanOrEqual(8);
  const row = curve.locator('.study-choice-item').first();
  expect((await row.boundingBox()).height).toBeLessThan(110);
});
