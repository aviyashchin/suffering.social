export const DEFAULT_PARAMETERS = Object.freeze({
  vsl: 13.7,
  suicides: 49_500,
  attribution: 18,
  depression: 5_000_000,
  yld: 6,
  qol: 35,
  healthcare: 8_000,
  productivity: 6_000,
  duration: 4.5,
});

export const SCENARIOS = Object.freeze({
  reset: Object.freeze({ ...DEFAULT_PARAMETERS }),
  optimistic: Object.freeze({
    vsl: 7,
    suicides: 35_000,
    attribution: 7,
    depression: 2_000_000,
    yld: 3,
    qol: 30,
    healthcare: 6_500,
    productivity: 4_000,
    duration: 0.25,
  }),
  facebookFiles: Object.freeze({
    vsl: 13.7,
    suicides: 49_500,
    attribution: 22,
    depression: 8_000_000,
    yld: 6.5,
    qol: 38,
    healthcare: 10_000,
    productivity: 7_500,
    duration: 5.2,
  }),
  aggressive: Object.freeze({
    vsl: 14,
    suicides: 65_000,
    attribution: 30,
    depression: 8_000_000,
    yld: 8,
    qol: 50,
    healthcare: 12_000,
    productivity: 10_000,
    duration: 6.8,
  }),
});

export const SLIDER_CONFIGS = Object.freeze({
  vsl: { range: { min: 7, max: 14 }, step: 0.1 },
  suicides: { range: { min: 30_000, max: 70_000 }, step: 500 },
  attribution: { range: { min: 7, max: 30 }, step: 1 },
  depression: { range: { min: 2_000_000, max: 8_000_000 }, step: 100_000 },
  yld: { range: { min: 3, max: 8 }, step: 0.1 },
  qol: { range: { min: 30, max: 50 }, step: 1 },
  healthcare: { range: { min: 6_500, max: 12_000 }, step: 100 },
  productivity: { range: { min: 4_000, max: 10_000 }, step: 100 },
  duration: {
    range: { min: 0.25, max: 6.8 },
    controlRange: {
      min: [0.25, 0.05],
      '0.7633587786%': [0.3, 0.1],
      max: 6.8,
    },
  },
});

export function calculateTotalEconomicImpact(parameters) {
  const {
    vsl,
    suicides,
    attribution,
    depression,
    yld,
    qol,
    healthcare,
    productivity,
    duration,
  } = parameters;
  const mortality = suicides * (attribution / 100) * vsl * 1_000_000;
  const annualLifeValue = (vsl * 1_000_000) / 75;
  const mental = depression * yld * (qol / 100) * annualLifeValue;
  const economic = depression * (healthcare + productivity) * duration;
  return {
    mortality,
    mental,
    productivity: economic,
    total: mortality + mental + economic,
  };
}
