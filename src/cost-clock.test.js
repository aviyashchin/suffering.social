import { jest } from '@jest/globals';
import {
  averageCostPerSecond,
  formatClockComponent,
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

  test('keeps component totals readable in a compact header', () => {
    expect(formatClockComponent(122_067_000_000)).toBe('$122.1B');
    expect(formatClockComponent(1_918_000_000_000)).toBe('$1.9T');
  });

  test('ticks the total and each model component without showing a rate', () => {
    document.body.innerHTML = `
      <strong id="cost-clock-total"></strong>
      <strong id="hero-total-cost"></strong>
      <strong id="cost-clock-mortality"></strong>
      <strong id="cost-clock-mental"></strong>
      <strong id="cost-clock-economic"></strong>
    `;
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2010, 0, 1));
    const setIntervalSpy = jest.spyOn(window, 'setInterval');
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    const cleanup = startCostClock({
      calculateTotalEconomicImpact: () => ({
        mortality: 3_153_600,
        mental: 12_614_400,
        productivity: 15_768_000,
        total: 31_536_000,
      }),
    });

    expect(document.getElementById('cost-clock-total')).toHaveTextContent(
      '$31,536,000'
    );
    expect(document.getElementById('cost-clock-mortality')).toHaveTextContent(
      '$3.2M'
    );
    expect(document.getElementById('cost-clock-mental')).toHaveTextContent(
      '$12.6M'
    );
    expect(document.getElementById('cost-clock-economic')).toHaveTextContent(
      '$15.8M'
    );
    expect(document.getElementById('hero-total-cost')).toHaveTextContent(
      '$31,536,000'
    );
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 250);

    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2010, 0, 1) + 10_000);
    setIntervalSpy.mock.calls[0][0]();
    expect(document.getElementById('cost-clock-total')).toHaveTextContent(
      '$31,536,010'
    );
    expect(document.getElementById('hero-total-cost')).toHaveTextContent(
      '$31,536,010'
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
