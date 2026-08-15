import {
  averageCostPerSecond,
  formatClockTotal,
} from './cost-clock.js';

describe('estimated cost clock', () => {
  test('turns a cumulative estimate into an explicit historical average rate', () => {
    const start = Date.UTC(2009, 0, 1);
    const end = Date.UTC(2010, 0, 1);

    expect(averageCostPerSecond(31_536_000, start, end)).toBe(1);
  });

  test('formats the changing total without implying cents of precision', () => {
    expect(formatClockTotal(2_355_067_000_123.8)).toBe(
      '$2,355,067,000,124'
    );
  });
});
