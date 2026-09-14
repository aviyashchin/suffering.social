import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));
});

test('aligns animated digits with their punctuation and units', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const offsets = await page
    .locator('#mortality-result')
    .evaluate((element) => {
      element.style.whiteSpace = 'nowrap';
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const tops = [];
      let node;
      while ((node = walker.nextNode())) {
        const range = document.createRange();
        range.selectNodeContents(node);
        tops.push(range.getBoundingClientRect().top);
      }
      return Math.max(...tops) - Math.min(...tops);
    });
  expect(offsets).toBeLessThan(1);
});

test('shows modeled lives first and valuation in parentheses', async ({
  page,
}) => {
  await expect(page.locator('#cost-clock-mortality')).toHaveText('8,910 lives');
  await expect(page.locator('#cost-clock-mortality-value')).toHaveText(
    '($122.1B)'
  );
  await expect(page.locator('#mortality-result')).toHaveText(
    '49,500 × 18% = 8,910 lives ($122.1B at $13.7M per life)'
  );
  await page.evaluate(() => {
    document.getElementById('attribution-nouislider').noUiSlider.set(30);
  });
  await expect(page.locator('#cost-clock-mortality')).toHaveText(
    '14,850 lives'
  );
  await expect(page.locator('#cost-clock-mortality-value')).toHaveText(
    '($203.4B)'
  );
  await page.evaluate(() => {
    document.getElementById('vsl-nouislider').noUiSlider.set(10);
  });
  await expect(page.locator('#cost-clock-mortality')).toHaveText(
    '14,850 lives'
  );
  await expect(page.locator('#cost-clock-mortality-value')).toHaveText(
    '($148.5B)'
  );
});

test('refreshes curve totals when another assumption changes', async ({
  page,
}) => {
  const impact = page.locator(
    '.range-curve[data-parameter="vsl"] .sensitivity-impact'
  );
  await expect(impact).toHaveText('Total $1.4T to $2.4T');
  await page.evaluate(() => {
    document.getElementById('depression-nouislider').noUiSlider.set(8000000);
  });
  await expect(impact).toHaveText('Total $2.1T to $3.8T');
});

test('keeps mobile source rows compact and their changing curve in view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const curve = page.locator('.range-curve[data-parameter="vsl"]');
  const rowHeights = await curve
    .locator('.study-choice-item')
    .evaluateAll((rows) =>
      rows.map((row) => row.getBoundingClientRect().height)
    );
  expect(Math.max(...rowHeights)).toBeLessThan(180);
  const plot = curve.locator('.range-curve-plot');
  const line = plot.locator('.range-curve-line');
  const previousPath = await line.getAttribute('d');
  const choice = curve
    .locator('.study-choice')
    .filter({ hasText: 'EPA guidance' });
  await choice.evaluate((element) => {
    const top = window.scrollY + element.getBoundingClientRect().top - 480;
    window.scrollTo({ top, behavior: 'instant' });
  });
  await expect(plot).toBeInViewport({ ratio: 1 });
  await choice.click();
  await expect(choice).toHaveAttribute('aria-pressed', 'true');
  await expect(line).not.toHaveAttribute('d', previousPath);
  await expect(plot).toBeInViewport({ ratio: 1 });
  const geometry = await plot.evaluate((element) => ({
    plotTop: element.getBoundingClientRect().top,
    headerBottom: element
      .closest('.assumption-group')
      .querySelector('header')
      .getBoundingClientRect().bottom,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  expect(geometry.plotTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
  expect(geometry.overflow).toBe(false);
});
