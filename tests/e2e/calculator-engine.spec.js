import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const fixturePath = fileURLToPath(
  new URL('../fixtures/calculator-engine-baseline.json', import.meta.url)
);
const baseline = JSON.parse(readFileSync(fixturePath, 'utf8'));
const parameterIds = Object.keys(baseline.parameters);

test('preserves the calculator engine parameters, scenarios, and totals', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator), null, {
    timeout: 30_000,
  });

  const snapshot = await page.evaluate((scenarioNames) => {
    const calculator = window.calculator;
    const outputs = {};
    const rendered = {};
    const authoredParameters = { ...calculator.parameters };

    for (const scenarioName of scenarioNames) {
      calculator.loadScenario(scenarioName);
      outputs[scenarioName] = calculator.calculateTotalEconomicImpact();
      rendered[scenarioName] = {
        heroTotal: document.getElementById('hero-total-cost').textContent,
        total: document.getElementById('total-cost').textContent,
        mortality: document.getElementById('mortality-result').textContent,
        mental: document.getElementById('mental-result').textContent,
        healthcare: document.getElementById('healthcare-result').textContent,
        sliderValues: Object.fromEntries(
          Object.keys(authoredParameters).map((name) => [
            name,
            Number(
              document.getElementById(`${name}-nouislider`).noUiSlider.get()
            ),
          ])
        ),
      };
    }

    return {
      parameters: authoredParameters,
      scenarios: calculator.scenarios,
      outputs,
      rendered,
      hasCalculationEntrypoint:
        typeof calculator.calculateTotalEconomicImpact === 'function',
    };
  }, Object.keys(baseline.scenarios));

  expect(snapshot.parameters).toEqual(baseline.parameters);
  expect(snapshot.scenarios).toEqual(baseline.scenarios);
  expect(snapshot.hasCalculationEntrypoint).toBe(true);

  // JavaScript's binary floating-point representation can leave a fractional
  // cent at this scale. The engine must remain within one cent of the frozen
  // independently calculated baseline.
  for (const [scenarioName, expectedOutput] of Object.entries(
    baseline.outputs
  )) {
    expect(snapshot.rendered[scenarioName].sliderValues).toEqual(
      baseline.scenarios[scenarioName]
    );

    for (const [component, expectedValue] of Object.entries(expectedOutput)) {
      expect(
        Math.abs(snapshot.outputs[scenarioName][component] - expectedValue),
        `${scenarioName}.${component}`
      ).toBeLessThan(0.01);
    }

    expect(snapshot.rendered[scenarioName].heroTotal).toBe(
      formatFullNumber(expectedOutput.total)
    );
    expect(snapshot.rendered[scenarioName].total).toBe(
      formatLargeNumber(expectedOutput.total)
    );
    expect(snapshot.rendered[scenarioName].mortality).toContain(
      formatLargeNumber(expectedOutput.mortality)
    );
    expect(snapshot.rendered[scenarioName].mental).toContain(
      formatLargeNumber(expectedOutput.mental)
    );
    expect(snapshot.rendered[scenarioName].healthcare).toContain(
      formatLargeNumber(expectedOutput.productivity)
    );
  }

  for (const parameterId of parameterIds) {
    await expect(page.locator(`#${parameterId}-nouislider`)).toHaveCount(1);
    await expect(page.locator(`#${parameterId}-value`)).toHaveCount(1);
  }

  for (const outputId of ['hero-total-cost', 'total-cost']) {
    await expect(page.locator(`#${outputId}`)).toHaveCount(1);
  }

  for (const triggerId of [
    'show-methodology',
    'show-all-citations',
    'research-modal',
  ]) {
    await expect(page.locator(`#${triggerId}`)).toHaveCount(1);
  }
});

test('keeps duration keyboard steps aligned with its observable value', async ({
  page,
}) => {
  await page.goto('/');
  const duration = page.getByRole('slider', {
    name: 'Average duration of economic costs',
  });

  await expect(duration).toHaveAttribute('aria-valuenow', '4.5');
  await expect(duration).toHaveAttribute('aria-valuetext', '4.5 years');
  await expect(page.locator('#duration-value')).toHaveText('4.5 years');

  await duration.press('ArrowRight');

  await expect
    .poll(() => page.evaluate(() => window.calculator.parameters.duration))
    .toBeCloseTo(4.6, 5);
  await expect(duration).toHaveAttribute('aria-valuenow', '4.6');
  await expect(duration).toHaveAttribute('aria-valuetext', '4.6 years');
  await expect(page.locator('#duration-value')).toHaveText('4.6 years');

  await page.getByRole('button', {
    name: 'Lower-bound assumption, load assumptions',
  }).click();

  await expect
    .poll(() => page.evaluate(() => window.calculator.parameters.duration))
    .toBe(0.25);
  await expect(duration).toHaveAttribute('aria-valuemin', '0.25');
  await expect(duration).toHaveAttribute('aria-valuenow', '0.25');
  await expect(duration).toHaveAttribute('aria-valuetext', '0.25 years');
  await expect(page.locator('#duration-value')).toHaveText('0.25 years');
});

function formatLargeNumber(value) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function formatFullNumber(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}
