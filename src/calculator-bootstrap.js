import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { setAnimatedNumberText } from './animated-number-text.js';
import { startCostClock } from './cost-clock.js';
import { initializeRangeCurves } from './range-curves.js';

window.noUiSlider = noUiSlider;
window.setAnimatedNumberText = setAnimatedNumberText;
const calculator = window.initializeSocialMediaCalculator();
const masthead = document.querySelector('.research-masthead');
const updateStickyOffset = () => {
  if (!masthead) return;
  document.documentElement.style.setProperty(
    '--masthead-height',
    `${masthead.getBoundingClientRect().height}px`
  );
};
updateStickyOffset();
if (masthead && 'ResizeObserver' in window) {
  new ResizeObserver(updateStickyOffset).observe(masthead);
}
if ('ResizeObserver' in window) {
  const groupObserver = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      target.parentElement.style.setProperty(
        '--group-header-height',
        `${target.getBoundingClientRect().height}px`
      );
    }
  });
  document.querySelectorAll('.assumption-group > header').forEach((header) => {
    groupObserver.observe(header);
  });
}
initializeRangeCurves(calculator);
startCostClock(calculator);
