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

  await page
    .getByRole('button', {
      name: 'Lower-bound assumption, load assumptions',
    })
    .click();

  await expect
    .poll(() => page.evaluate(() => window.calculator.parameters.duration))
    .toBe(0.25);
  await expect(duration).toHaveAttribute('aria-valuemin', '0.25');
  await expect(duration).toHaveAttribute('aria-valuenow', '0.25');
  await expect(duration).toHaveAttribute('aria-valuetext', '0.25 years');
  await expect(page.locator('#duration-value')).toHaveText('0.25 years');
});

test('keeps the live estimate clickable and every sensitivity range usable', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const curves = page.locator('.range-curve');
  await expect(curves).toHaveCount(9);
  for (const curve of await curves.all()) {
    await expect(curve).toBeVisible();
    await expect(curve.locator('.evidence-receipt')).toHaveCount(1);
  }

  const marker = page.locator(
    '.range-curve[data-parameter="attribution"] .range-curve-marker'
  );
  const initialPosition = await marker.evaluate(
    (element) => element.style.left
  );
  await page.evaluate(() => {
    document.getElementById('attribution-nouislider').noUiSlider.set(19);
  });
  await expect
    .poll(() => page.evaluate(() => window.calculator.parameters.attribution))
    .toBe(19);
  await expect
    .poll(() => marker.evaluate((element) => element.style.left), {
      timeout: 10_000,
    })
    .not.toBe(initialPosition);
  const vslRange = page.locator('.range-curve[data-parameter="vsl"]');
  await expect(vslRange.getByText('Compare source values')).toBeVisible();
  const paperChoices = vslRange.locator(
    '.study-choice:not([data-study-index="-1"])'
  );
  await expect(paperChoices).toHaveCount(3);
  const totalBeforePaper = await page.locator('#hero-total-cost').textContent();
  await paperChoices.first().click();
  await expect(page.locator('#hero-total-cost')).not.toHaveText(
    totalBeforePaper || ''
  );

  const clock = page.locator('#cost-clock-total');
  const clockStart = await clock.textContent();
  await expect(clock).not.toHaveText(clockStart || '', { timeout: 2_000 });

  await page.locator('#hero-cost-display').click();
  await expect(page).toHaveURL(/#assumptions$/);
  await expect(page.locator('#assumptions')).toBeInViewport();
});

test('keeps the hero estimate typographically unified with quieter directional motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1045, height: 1396 });
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const hero = page.locator('#hero-total-cost');
  const inspectMotion = (nextValue) =>
    hero.evaluate((element, controlledValue) => {
      if (controlledValue) {
        window.setAnimatedNumberText(element, controlledValue);
      }
      const value = element.querySelector(
        '.animated-number-clip:not([data-direction="none"]) .animated-number-value'
      );
      const animation = value?.getAnimations()[0];
      const keyframe = animation?.effect.getKeyframes()[0];
      const heroStyle = getComputedStyle(element);
      const valueStyle = value ? getComputedStyle(value) : null;
      return {
        direction: value?.parentElement?.dataset.direction,
        duration: animation?.effect.getTiming().duration,
        initialOpacity: keyframe?.opacity,
        initialTransform: keyframe?.transform,
        heroFontSize: heroStyle.fontSize,
        heroColor: heroStyle.color,
        valueFontSize: valueStyle?.fontSize,
        valueColor: valueStyle?.color,
      };
    }, nextValue);

  await page
    .getByRole('button', {
      name: 'Upper-bound assumption, load assumptions',
    })
    .click();
  const upward = await inspectMotion();
  expect(upward).toMatchObject({
    direction: 'up',
    duration: 220,
    initialOpacity: '1',
    initialTransform: 'translateY(100%)',
  });
  expect(upward.valueFontSize).toBe(upward.heroFontSize);
  expect(upward.valueColor).toBe(upward.heroColor);

  const downward = await inspectMotion('$1,000');
  expect(downward).toMatchObject({
    direction: 'down',
    duration: 220,
    initialOpacity: '1',
    initialTransform: 'translateY(-100%)',
  });

  const changedDigitCount = await hero.evaluate((element) => {
    window.setAnimatedNumberText(element, '$2,355,067,085,577');
    window.setAnimatedNumberText(element, '$2,355,067,085,578');
    return element.querySelectorAll(
      '.animated-number-clip:not([data-direction="none"])'
    ).length;
  });
  expect(changedDigitCount).toBe(1);
});

test('keeps the active section formula below the calculator summary', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const group = page.locator('.assumption-group[data-category="health"]');
  const groupHeader = group.locator(':scope > header');
  await group.locator('.assumption').nth(1).scrollIntoViewIfNeeded();

  const mastheadBottom = await page
    .locator('.research-masthead')
    .evaluate((element) => element.getBoundingClientRect().bottom);
  const groupHeaderTop = await groupHeader.evaluate(
    (element) => element.getBoundingClientRect().top
  );

  expect(Math.abs(groupHeaderTop - mastheadBottom)).toBeLessThan(3);
  await expect(groupHeader.locator('output')).toContainText('=');
});

test('updates formulas during slider movement and keeps the selected research anchor', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const curve = page.locator('.range-curve[data-parameter="vsl"]');
  await expect(curve.getByText('Compare source values')).toBeVisible();
  const choices = curve.locator('.study-choice');
  const orderedValues = await choices.evaluateAll((items) =>
    items.map((item) => Number(item.dataset.modelValue))
  );
  expect(orderedValues).toEqual([...orderedValues].sort((a, b) => a - b));

  const selected = choices.filter({ hasText: 'DOT guidance' });
  await selected.click();
  const formula = page.locator('#mortality-result');
  const formulaBeforeDrag = await formula.getAttribute('aria-label');
  await page.evaluate(() => {
    document.getElementById('vsl-nouislider').noUiSlider.set(10);
  });

  await expect(formula).not.toHaveAttribute(
    'aria-label',
    formulaBeforeDrag || ''
  );
  await expect(selected).toHaveAttribute('aria-pressed', 'true');
  await expect(selected).toHaveAttribute('data-selection-state', 'adjusted');
  await expect(formula.locator('[data-animated-number-token]')).not.toHaveCount(
    0
  );
});

test('keeps every selectable paper mapping inside its stated model range', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const mappings = await page.evaluate(() => {
    const calculator = window.calculator;
    return Object.fromEntries(
      Object.entries(calculator.researchCitations).map(
        ([parameter, research]) => [
          parameter,
          {
            range: calculator.sliderConfigs[parameter].range,
            studies: research.studies
              .filter((study) => Number.isFinite(study.modelValue))
              .map((study) => ({
                value: study.modelValue,
                basis: study.valueBasis,
              })),
          },
        ]
      )
    );
  });

  for (const [parameter, mapping] of Object.entries(mappings)) {
    expect(mapping.studies.length, parameter).toBeGreaterThanOrEqual(2);
    for (const study of mapping.studies) {
      expect(study.basis, parameter).toBeTruthy();
      expect(study.value, parameter).toBeGreaterThanOrEqual(mapping.range.min);
      expect(study.value, parameter).toBeLessThanOrEqual(mapping.range.max);
    }
  }
});

test('explains how the selected study becomes the live estimate', async ({
  page,
}) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const receipt = page.locator('.evidence-receipt[data-parameter="vsl"]');
  await expect(receipt).toBeVisible();
  await expect(receipt).toContainText('Evidence role');
  await expect(receipt).toContainText('Anchor says');
  await expect(receipt).toContainText('Model uses');
  await expect(receipt).toContainText('DOT guidance');
  await expect(receipt).toContainText('$13.7M');

  await page.evaluate(() => {
    document.getElementById('vsl-nouislider').noUiSlider.set(10);
  });
  await expect(page.locator('#vsl-value')).toHaveText('$10.0M');

  await expect(
    page.locator(
      '.evidence-receipt[data-parameter="attribution"] [data-receipt-role]'
    )
  ).toHaveText('Opening model assumption');
});

test('uses the compact design-system range and readable sticky summary', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.calculator));

  const presentation = await page.evaluate(() => {
    const handle = document.querySelector('#vsl-nouislider .noUi-handle');
    const label = document.querySelector('.cost-clock-components small');
    const masthead = document.querySelector('.research-masthead');
    const handleStyle = getComputedStyle(handle);
    return {
      handleWidth: handleStyle.width,
      handleRadius: handleStyle.borderRadius,
      handleShadow: handleStyle.boxShadow,
      labelSize: Number.parseFloat(getComputedStyle(label).fontSize),
      mastheadHeight: masthead.getBoundingClientRect().height,
    };
  });

  expect(presentation).toMatchObject({
    handleWidth: '16px',
    handleRadius: '0px',
    handleShadow: 'none',
  });
  expect(presentation.labelSize).toBeGreaterThanOrEqual(12);
  expect(presentation.mastheadHeight).toBeLessThanOrEqual(135);
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
