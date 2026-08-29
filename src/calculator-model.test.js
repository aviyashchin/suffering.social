import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_PARAMETERS,
  SCENARIOS,
  calculateTotalEconomicImpact,
} from './calculator-model.js';

const fixturePath = fileURLToPath(
  new URL('../tests/fixtures/calculator-engine-baseline.json', import.meta.url)
);
const baseline = JSON.parse(readFileSync(fixturePath, 'utf8'));

test('keeps model inputs and calculations independent from page rendering', () => {
  expect(DEFAULT_PARAMETERS).toEqual(baseline.parameters);
  expect(SCENARIOS).toEqual(baseline.scenarios);

  for (const [scenario, parameters] of Object.entries(SCENARIOS)) {
    const result = calculateTotalEconomicImpact(parameters);
    for (const [component, expected] of Object.entries(
      baseline.outputs[scenario]
    )) {
      expect(Math.abs(result[component] - expected)).toBeLessThan(0.01);
    }
  }
});
