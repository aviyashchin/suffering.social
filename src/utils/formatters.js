/**
 * Formatting Utilities
 * 
 * Consistent number and text formatting functions used throughout the calculator.
 * All formatting follows established patterns and handles edge cases.
 * 
 * @fileoverview Text and number formatting utilities
 * @version 1.0.0
 */

import { CALCULATION } from './constants.js';

// ============================================================================
// NUMBER FORMATTERS
// ============================================================================

/**
 * Format a large number as currency in trillions/billions
 * @param {number} value - Raw value to format
 * @param {number} decimalPlaces - Number of decimal places (default: 1)
 * @returns {string} Formatted currency string (e.g., "$2.5T")
 */
export function formatCurrency(value, decimalPlaces = CALCULATION.DECIMAL_PLACES.currency) {
  if (!isValidNumber(value)) return '$0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e12) {
    return `$${(value / 1e12).toFixed(decimalPlaces)}T`;
  } else if (absValue >= 1e9) {
    return `$${(value / 1e9).toFixed(decimalPlaces)}B`;
  } else if (absValue >= 1e6) {
    return `$${(value / 1e6).toFixed(decimalPlaces)}M`;
  } else if (absValue >= 1e3) {
    return `$${(value / 1e3).toFixed(decimalPlaces)}K`;
  } else {
    return `$${value.toFixed(decimalPlaces)}`;
  }
}

/**
 * Format a large number as full currency with commas (no abbreviations)
 * @param {number} value - Raw value to format
 * @returns {string} Formatted full currency string (e.g., "$3,200,000,000,000")
 */
export function formatFullCurrency(value) {
  if (!isValidNumber(value)) return '$0';
  
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

/**
 * Format a number as a percentage
 * @param {number} value - Raw percentage value (e.g., 18 for 18%)
 * @param {number} decimalPlaces - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string (e.g., "18.0%")
 */
export function formatPercentage(value, decimalPlaces = CALCULATION.DECIMAL_PLACES.percentage) {
  if (!isValidNumber(value)) return '0%';
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Format a number with appropriate scale and commas
 * @param {number} value - Raw number value
 * @param {number} decimalPlaces - Number of decimal places (default: 0)
 * @returns {string} Formatted number string (e.g., "110,000")
 */
export function formatNumber(value, decimalPlaces = CALCULATION.DECIMAL_PLACES.count) {
  if (!isValidNumber(value)) return '0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(decimalPlaces)}K`;
  } else {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  }
}

/**
 * Format a decimal number as years
 * @param {number} value - Raw years value (e.g., 4.5)
 * @param {number} decimalPlaces - Number of decimal places (default: 1)
 * @returns {string} Formatted years string (e.g., "4.5 years")
 */
export function formatYears(value, decimalPlaces = CALCULATION.DECIMAL_PLACES.years) {
  if (!isValidNumber(value)) return '0 years';
  
  const formatted = value.toFixed(decimalPlaces);
  const unit = value === 1 ? 'year' : 'years';
  
  return `${formatted} ${unit}`;
}

/**
 * Format a slider value for display (handles different parameter types)
 * @param {string} parameterType - Type of parameter (vsl, percentage, years, etc.)
 * @param {number} value - Raw value to format
 * @returns {string} Formatted value for display
 */
export function formatSliderValue(parameterType, value) {
  if (!isValidNumber(value)) return '0';
  
  switch (parameterType) {
    case 'vsl':
      return `$${value.toFixed(1)}M`;
    
    case 'suicides':
    case 'depression':
      return formatNumber(value);
    
    case 'attribution':
    case 'qol':
      return formatPercentage(value);
    
    case 'yld':
    case 'duration':
      return formatYears(value);
    
    case 'healthcare':
    case 'productivity':
      return `$${value.toLocaleString()}`;
    
    default:
      return value.toFixed(1);
  }
}

// ============================================================================
// TEXT FORMATTERS
// ============================================================================

/**
 * Format a formula display with substituted values
 * @param {string} formula - Formula template (e.g., "P × Q × VSL")
 * @param {Object} values - Object with parameter values
 * @param {Object} labels - Object with parameter labels
 * @returns {string} Formatted formula with values
 */
export function formatFormula(formula, values, labels = {}) {
  let formatted = formula;
  
  // Replace common variables with formatted values
  const substitutions = {
    'P': values.suicides ? formatNumber(values.suicides) : 'P',
    'Q': values.attribution ? formatPercentage(values.attribution) : 'Q',
    'VSL': values.vsl ? `$${values.vsl}M` : 'VSL',
    'R': values.qol ? formatPercentage(values.qol) : 'R'
  };
  
  // Apply substitutions
  Object.entries(substitutions).forEach(([variable, replacement]) => {
    formatted = formatted.replace(new RegExp(variable, 'g'), replacement);
  });
  
  return formatted;
}

/**
 * Format a research citation for display
 * @param {Object} citation - Citation object from constants
 * @returns {string} Formatted citation string
 */
export function formatCitation(citation) {
  if (!citation || !citation.source) return '';
  
  let formatted = citation.source;
  
  if (citation.value) {
    formatted += ` (${citation.value})`;
  }
  
  if (citation.finding) {
    formatted += ` - ${citation.finding}`;
  }
  
  return formatted;
}

/**
 * Format a scenario name with emoji for display
 * @param {Object} scenario - Scenario object from constants
 * @returns {string} Formatted scenario name
 */
export function formatScenarioName(scenario) {
  if (!scenario || !scenario.name) return '';
  
  return `${scenario.emoji || ''} ${scenario.name}`.trim();
}

// ============================================================================
// TIME FORMATTERS
// ============================================================================

/**
 * Format elapsed time for counters
 * @param {number} seconds - Elapsed seconds
 * @returns {string} Formatted time string
 */
export function formatElapsedTime(seconds) {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
}

/**
 * Format a rate for display (e.g., cost per second)
 * @param {number} totalValue - Total value
 * @param {number} timeInSeconds - Time period in seconds
 * @returns {string} Formatted rate string
 */
export function formatRate(totalValue, timeInSeconds) {
  if (!isValidNumber(totalValue) || !isValidNumber(timeInSeconds) || timeInSeconds === 0) {
    return '$0/sec';
  }
  
  const rate = totalValue / timeInSeconds;
  
  if (rate >= 1e6) {
    return `$${(rate / 1e6).toFixed(1)}M/sec`;
  } else if (rate >= 1e3) {
    return `$${(rate / 1e3).toFixed(1)}K/sec`;
  } else {
    return `$${rate.toFixed(0)}/sec`;
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if a value is a valid number for calculations
 * @param {*} value - Value to check
 * @returns {boolean} True if valid number
 */
export function isValidNumber(value) {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value) && 
         value >= 0;
}

/**
 * Safely parse a string to number with fallback
 * @param {string|number} value - Value to parse
 * @param {number} fallback - Fallback value if parsing fails
 * @returns {number} Parsed number or fallback
 */
export function safeParseNumber(value, fallback = 0) {
  if (typeof value === 'number') return isValidNumber(value) ? value : fallback;
  
  const parsed = parseFloat(value);
  return isValidNumber(parsed) ? parsed : fallback;
}

// ============================================================================
// COMPARISON FORMATTERS
// ============================================================================

/**
 * Format a viral comparison with dynamic values
 * @param {string} template - Comparison template with placeholders
 * @param {number} totalCost - Total cost value for calculations
 * @returns {string} Formatted comparison string
 */
export function formatComparison(template, totalCost) {
  if (!template || !isValidNumber(totalCost)) return '';
  
  let formatted = template;
  
  // Calculate various comparison values
  const nasaYears = Math.floor(totalCost / 25e9); // NASA annual budget ~$25B
  const students = Math.floor(totalCost / 50000); // Average college cost ~$50K
  const federalPercent = ((totalCost / 6e12) * 100).toFixed(1); // Federal budget ~$6T
  const homelessTimes = Math.floor(totalCost / 20e9); // End homelessness cost ~$20B
  const healthcarePeople = Math.floor(totalCost / 10000); // Healthcare per person ~$10K
  const teachers = Math.floor(totalCost / 60000); // Teacher salary ~$60K
  const hospitals = Math.floor(totalCost / 1e9); // Major hospital ~$1B
  
  // Replace placeholders
  const replacements = {
    '${years}': formatNumber(nasaYears),
    '${students}': formatNumber(students / 1e6, 1),
    '${percent}': federalPercent,
    '${times}': formatNumber(homelessTimes),
    '${people}': formatNumber(healthcarePeople / 1e6, 1),
    '${countries}': 'several major',
    '${teachers}': formatNumber(teachers / 1e6, 1),
    '${hospitals}': formatNumber(hospitals)
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    formatted = formatted.replace(placeholder, value);
  });
  
  return formatted;
}

// ============================================================================
// EXPORT ALL FORMATTERS
// ============================================================================

export default {
  formatCurrency,
  formatFullCurrency,
  formatPercentage,
  formatNumber,
  formatYears,
  formatSliderValue,
  formatFormula,
  formatCitation,
  formatScenarioName,
  formatElapsedTime,
  formatRate,
  formatComparison,
  isValidNumber,
  safeParseNumber
}; 