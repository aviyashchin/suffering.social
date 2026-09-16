import { setAnimatedNumberText } from './animated-number-text.js';

const MODEL_START = Date.UTC(2009, 0, 1);

export function averageCostPerSecond(
  total,
  start = MODEL_START,
  end = Date.now()
) {
  const elapsedSeconds = Math.max(1, (end - start) / 1000);
  return total / elapsedSeconds;
}

export function formatClockTotal(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

export function formatClockComponent(value) {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return formatClockTotal(value);
}

export function startCostClock(calculator) {
  const totalDisplay = document.getElementById('cost-clock-total');
  const heroTotalDisplay = document.getElementById('hero-total-cost');
  const componentDisplays = {
    mortality: document.getElementById('cost-clock-mortality'),
    mental: document.getElementById('cost-clock-mental'),
    productivity: document.getElementById('cost-clock-economic'),
  };
  if (!totalDisplay && !heroTotalDisplay) return () => {};

  const mortalityValue = document.getElementById('cost-clock-mortality-value');
  const mentalValue = document.getElementById('cost-clock-mental-value');
  const openedAt = Date.now();
  const render = (advanceClock = true) => {
    const results = calculator.calculateTotalEconomicImpact();
    const secondsSinceOpen = advanceClock ? (Date.now() - openedAt) / 1000 : 0;
    const tickingComponents = Object.fromEntries(
      Object.keys(componentDisplays).map((component) => {
        const value = Number(results[component]) || 0;
        const added =
          averageCostPerSecond(value, MODEL_START, openedAt) * secondsSinceOpen;
        return [component, value + added];
      })
    );
    const tickingTotal = Object.values(tickingComponents).reduce(
      (sum, value) => sum + value,
      0
    );
    if (totalDisplay) {
      setAnimatedNumberText(totalDisplay, formatClockTotal(tickingTotal));
    }
    if (heroTotalDisplay) {
      setAnimatedNumberText(heroTotalDisplay, formatClockTotal(tickingTotal));
    }
    if (mortalityValue) {
      setAnimatedNumberText(
        mortalityValue,
        `(${formatClockComponent(tickingComponents.mortality)})`
      );
    }
    if (mentalValue) {
      setAnimatedNumberText(
        mentalValue,
        `(${formatClockComponent(tickingComponents.mental)})`
      );
    }
    Object.entries(componentDisplays).forEach(([component, display]) => {
      if (display) {
        setAnimatedNumberText(
          display,
          component === 'mortality'
            ? `${Math.round(
                (calculator.parameters.suicides *
                  calculator.parameters.attribution) /
                  100
              ).toLocaleString('en-US')} lives`
            : component === 'mental' && mentalValue
            ? `${(
                (calculator.parameters.depression * calculator.parameters.yld) /
                1000000
              ).toLocaleString('en-US', { maximumFractionDigits: 1 })}M years`
            : formatClockComponent(tickingComponents[component])
        );
      }
    });
  };

  render();
  const renderExactModel = () => render(false);
  document.addEventListener('calculator:updated', renderExactModel);
  const interval = window.setInterval(render, 250);
  return () => {
    document.removeEventListener('calculator:updated', renderExactModel);
    window.clearInterval(interval);
  };
}
