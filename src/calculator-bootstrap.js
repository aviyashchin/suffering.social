import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { setAnimatedNumberText } from './animated-number-text.js';
import { startCostClock } from './cost-clock.js';
import { initializeEvidenceField } from './evidence-field.js';
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
initializeRangeCurves(calculator);
initializeEvidenceField(calculator);
startCostClock(calculator);
