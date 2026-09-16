import { expect, test } from '@playwright/test';

test('uses Floral tokens and a light, readable selected source', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'floral');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(42, 24, 84)');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 242, 220)');
  const curve = page.locator('.range-curve[data-parameter="vsl"]');
  const source = curve.locator('.study-choice').filter({ hasText: 'EPA guidance' });
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
