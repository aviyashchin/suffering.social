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

  const snapshot = await page.evaluate(async (scenarioNames) => {
    const calculator = window.calculator;
    const originalParameters = { ...calculator.parameters };
    const CalculatorConstructor = window.eval('SocialMediaCalculator');
    const originalInit = CalculatorConstructor.prototype.init;
    const authoredParameters = (() => {
      try {
        CalculatorConstructor.prototype.init = function noInit() {};
        return { ...new CalculatorConstructor().parameters };
      } finally {
        CalculatorConstructor.prototype.init = originalInit;
      }
    })();

    const outputs = {};
    const rendered = {};
    const sliderValues = {};
    const sliderMethods = {};
    const methodNames = [
      'resetDebtClock',
      'updateCharts',
      'updateSocialPreviews',
      'updateDistributionChart',
      'updateExternalities',
      'resetCumulativeExternalities',
      'smoothUpdateElement',
    ];
    const originalMethods = Object.fromEntries(
      methodNames.map((name) => [name, calculator[name]])
    );
    const affectedIds = [
      ...Object.keys(originalParameters).map((name) => `${name}-value`),
      'hero-total-cost',
      'total-cost',
      'mortality-result',
      'mental-result',
      'healthcare-result',
      'gdp-percentage',
    ];
    const originalUi = Object.fromEntries(
      affectedIds.map((id) => {
        const element = document.getElementById(id);
        return [
          id,
          element
            ? { textContent: element.textContent, className: element.className }
            : null,
        ];
      })
    );
    const originalLastResults = calculator.lastResults;

    try {
      for (const parameterName of Object.keys(originalParameters)) {
        const slider = document.getElementById(
          `${parameterName}-nouislider`
        )?.noUiSlider;
        sliderValues[parameterName] = [];
        sliderMethods[parameterName] = slider.set;
        slider.set = (value) => sliderValues[parameterName].push(value);
      }

      calculator.resetDebtClock = () => {};
      calculator.updateCharts = () => {};
      calculator.updateSocialPreviews = () => {};
      calculator.updateDistributionChart = () => {};
      calculator.updateExternalities = () => {};
      calculator.resetCumulativeExternalities = () => {};
      calculator.smoothUpdateElement = (element, value) => {
        element.textContent = value;
      };

      for (const scenarioName of scenarioNames) {
        const scenarioSliderValues = Object.fromEntries(
          Object.keys(originalParameters).map((name) => [
            name,
            sliderValues[name].length,
          ])
        );

        calculator.loadScenario(scenarioName);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );

        outputs[scenarioName] = calculator.calculateTotalEconomicImpact();
        rendered[scenarioName] = {
          heroTotal: document.getElementById('hero-total-cost').textContent,
          total: document.getElementById('total-cost').textContent,
          mortality: document.getElementById('mortality-result').textContent,
          mental: document.getElementById('mental-result').textContent,
          healthcare: document.getElementById('healthcare-result').textContent,
          sliderValues: Object.fromEntries(
            Object.keys(originalParameters).map((name) => [
              name,
              sliderValues[name].slice(scenarioSliderValues[name]),
            ])
          ),
        };
      }

      // Let loadScenario's documented 100 ms distribution refresh finish while
      // its isolated no-op remains installed.
      await new Promise((resolve) => setTimeout(resolve, 120));
    } finally {
      for (const [parameterName, set] of Object.entries(sliderMethods)) {
        document.getElementById(
          `${parameterName}-nouislider`
        ).noUiSlider.set = set;
      }
      for (const [name, method] of Object.entries(originalMethods)) {
        calculator[name] = method;
      }
      Object.assign(calculator.parameters, originalParameters);
      calculator.lastResults = originalLastResults;
      for (const [id, state] of Object.entries(originalUi)) {
        const element = document.getElementById(id);
        if (element && state) {
          element.textContent = state.textContent;
          element.className = state.className;
        }
      }
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
      Object.fromEntries(
        Object.entries(baseline.scenarios[scenarioName]).map(([name, value]) => [
          name,
          [value],
        ])
      )
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

function formatLargeNumber(value) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function formatFullNumber(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}
