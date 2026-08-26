import {
  gaussianDensity,
  normalizeContributions,
  smoothValue,
} from './evidence-field.js';

describe('evidence field model', () => {
  test('normalizes the three calculator contributions', () => {
    expect(normalizeContributions({ mortality: 20, mental: 30, productivity: 50 })).toEqual([
      0.2,
      0.3,
      0.5,
    ]);
  });

  test('returns a stable empty state when there is no modeled cost', () => {
    expect(normalizeContributions({ mortality: 0, mental: 0, productivity: 0 })).toEqual([
      0,
      0,
      0,
    ]);
  });

  test('eases toward the next value without overshooting', () => {
    expect(smoothValue(0.2, 0.8, 0.25)).toBeCloseTo(0.35);
    expect(smoothValue(0.8, 0.2, 0.25)).toBeCloseTo(0.65);
  });

  test('places the top of a normal curve exactly at its mean', () => {
    expect(gaussianDensity(0.5, 0.5, 0.16)).toBe(1);
    expect(gaussianDensity(0.35, 0.5, 0.16)).toBeLessThan(1);
    expect(gaussianDensity(0.65, 0.5, 0.16)).toBeLessThan(1);
  });
});
