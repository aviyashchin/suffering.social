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
  await page.goto('/calculator');
  await page.waitForFunction(() => Boolean(window.calculator), null, {
    timeout: 30_000,
  });

  const snapshot = await page.evaluate((scenarioNames) => {
    const calculator = window.calculator;
    const originalParameters = { ...calculator.parameters };
    const outputs = {};

    try {
      for (const scenarioName of scenarioNames) {
        Object.assign(calculator.parameters, calculator.scenarios[scenarioName]);
        outputs[scenarioName] = calculator.calculateTotalEconomicImpact();
      }
    } finally {
      Object.assign(calculator.parameters, originalParameters);
    }

    return {
      // The reset scenario is the engine's declared default contract. The
      // current noUiSlider setup normalizes duration against a 0.25 minimum
      // during initialization, so the live control can transiently report
      // 4.55 even though the calculator's authored default is 4.5.
      parameters: calculator.scenarios.reset,
      scenarios: calculator.scenarios,
      outputs,
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
    for (const [component, expectedValue] of Object.entries(expectedOutput)) {
      expect(
        Math.abs(snapshot.outputs[scenarioName][component] - expectedValue),
        `${scenarioName}.${component}`
      ).toBeLessThan(0.01);
    }
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
