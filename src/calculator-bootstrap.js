import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { startCostClock } from './cost-clock.js';
import { initializeEvidenceField } from './evidence-field.js';
import { initializeRangeCurves } from './range-curves.js';

window.noUiSlider = noUiSlider;
const calculator = window.initializeSocialMediaCalculator();
initializeRangeCurves(calculator);
initializeEvidenceField(calculator);
startCostClock(calculator);
