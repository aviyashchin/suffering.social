const MODEL_START = Date.UTC(2009, 0, 1);

export function averageCostPerSecond(total, start = MODEL_START, end = Date.now()) {
  const elapsedSeconds = Math.max(1, (end - start) / 1000);
  return total / elapsedSeconds;
}

export function formatClockTotal(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

export function startCostClock(calculator) {
  const totalDisplay = document.getElementById('cost-clock-total');
  const rateDisplay = document.getElementById('cost-clock-rate');
  if (!totalDisplay || !rateDisplay) return () => {};

  const openedAt = Date.now();
  const render = () => {
    const total = calculator.calculateTotalEconomicImpact().total;
    const rate = averageCostPerSecond(total, MODEL_START, openedAt);
    const addedSinceOpen = rate * ((Date.now() - openedAt) / 1000);
    totalDisplay.textContent = formatClockTotal(total + addedSinceOpen);
    rateDisplay.textContent = `Historical average: about ${formatClockTotal(rate)} every second`;
  };

  render();
  const interval = window.setInterval(render, 250);
  return () => window.clearInterval(interval);
}
