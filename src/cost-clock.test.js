import { jest } from '@jest/globals';
import {
  averageCostPerSecond,
  formatClockTotal,
  startCostClock,
} from './cost-clock.js';

describe('estimated cost clock', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

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

  test('renders the historical rate and returns an interval cleanup', () => {
    document.body.innerHTML = `
      <strong id="cost-clock-total"></strong>
      <strong id="hero-total-cost"></strong>
      <small id="cost-clock-rate"></small>
    `;
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2010, 0, 1));
    const setIntervalSpy = jest.spyOn(window, 'setInterval');
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    const cleanup = startCostClock({
      calculateTotalEconomicImpact: () => ({ total: 31_536_000 }),
    });

    expect(document.getElementById('cost-clock-total')).toHaveTextContent(
      '$31,536,000'
    );
    expect(document.getElementById('cost-clock-rate')).toHaveTextContent(
      'Historical average: about $1 every second'
    );
    expect(document.getElementById('hero-total-cost')).toHaveTextContent(
      '$31,536,000'
    );
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 250);

    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2010, 0, 1) + 1000);
    setIntervalSpy.mock.calls[0][0]();
    expect(document.getElementById('cost-clock-total')).toHaveTextContent(
      '$31,536,001'
    );
    expect(document.getElementById('hero-total-cost')).toHaveTextContent(
      '$31,536,001'
    );

    cleanup();
    expect(clearIntervalSpy).toHaveBeenCalledWith(
      setIntervalSpy.mock.results[0].value
    );
  });

  test('does not schedule work when the clock surface is absent', () => {
    const setIntervalSpy = jest.spyOn(window, 'setInterval');
    const cleanup = startCostClock({
      calculateTotalEconomicImpact: () => ({ total: 31_536_000 }),
    });

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(cleanup()).toBeUndefined();
  });
});
