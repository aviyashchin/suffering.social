import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { startCostClock } from './cost-clock.js';
import { initializeRangeCurves } from './range-curves.js';

window.noUiSlider = noUiSlider;
const calculator = window.initializeSocialMediaCalculator();
initializeRangeCurves(calculator);
startCostClock(calculator);
