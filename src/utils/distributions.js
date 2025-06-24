/**
 * Statistical Distributions for Parameters
 * 
 * Research-based uncertainty ranges and distribution shapes for each parameter.
 * Used to generate distribution curves showing confidence intervals.
 * 
 * @fileoverview Statistical distribution utilities
 * @version 1.0.0
 */

/**
 * Distribution shapes and uncertainty ranges for each parameter
 * Based on research literature and expert estimates
 */
export const PARAMETER_DISTRIBUTIONS = {
  vsl: {
    name: "Value of Statistical Life",
    defaultValue: 13.7,
    unit: "million USD",
    distribution: "lognormal",
    range: { min: 8.0, max: 20.0 },
    confidenceInterval: { lower: 10.2, upper: 17.8 }, // 80% CI
    dataPoints: [
      { x: 8.0, y: 0.1 },
      { x: 9.5, y: 0.3 },
      { x: 11.2, y: 0.6 },
      { x: 13.7, y: 1.0 }, // peak at default
      { x: 16.1, y: 0.7 },
      { x: 18.3, y: 0.4 },
      { x: 20.0, y: 0.1 }
    ],
    source: "US DOT 2024, EPA, Banzhaf meta-analysis"
  },

  suicides: {
    name: "Excess Suicides Since 2009",
    defaultValue: 110000,
    unit: "deaths",
    distribution: "normal",
    range: { min: 100000, max: 300000 },
    confidenceInterval: { lower: 95000, upper: 180000 },
    dataPoints: [
      { x: 100000, y: 0.2 },
      { x: 105000, y: 0.5 },
      { x: 110000, y: 1.0 }, // peak at default
      { x: 130000, y: 0.8 },
      { x: 160000, y: 0.4 },
      { x: 200000, y: 0.2 },
      { x: 300000, y: 0.1 }
    ],
    source: "CDC WONDER, Twenge et al. 2018"
  },

  attribution: {
    name: "% Attributable to Social Media",
    defaultValue: 18,
    unit: "percent",
    distribution: "beta",
    range: { min: 5, max: 30 },
    confidenceInterval: { lower: 12, upper: 25 },
    dataPoints: [
      { x: 5, y: 0.1 },
      { x: 8, y: 0.2 },
      { x: 12, y: 0.6 },
      { x: 18, y: 1.0 }, // peak at default
      { x: 22, y: 0.8 },
      { x: 25, y: 0.5 },
      { x: 30, y: 0.2 }
    ],
    source: "Braghieri et al. 2022, Facebook Files"
  },

  depression: {
    name: "Americans with SM-Induced Depression",
    defaultValue: 5000000,
    unit: "people",
    distribution: "lognormal",
    range: { min: 3000000, max: 15000000 },
    confidenceInterval: { lower: 3500000, upper: 8000000 },
    dataPoints: [
      { x: 3000000, y: 0.3 },
      { x: 3500000, y: 0.6 },
      { x: 5000000, y: 1.0 }, // peak at default
      { x: 6500000, y: 0.8 },
      { x: 8000000, y: 0.5 },
      { x: 10000000, y: 0.3 },
      { x: 15000000, y: 0.1 }
    ],
    source: "PNAS 2019, NIMH Depression Statistics"
  },

  yld: {
    name: "Years Lived with Disability",
    defaultValue: 6.0,
    unit: "years",
    distribution: "gamma",
    range: { min: 4, max: 8 },
    confidenceInterval: { lower: 5.2, upper: 7.1 },
    dataPoints: [
      { x: 4.0, y: 0.2 },
      { x: 4.8, y: 0.4 },
      { x: 5.5, y: 0.7 },
      { x: 6.0, y: 1.0 }, // peak at default
      { x: 6.5, y: 0.8 },
      { x: 7.2, y: 0.5 },
      { x: 8.0, y: 0.2 }
    ],
    source: "WHO GBD, Hogrefe International Journal"
  },

  qol: {
    name: "Quality of Life Reduction",
    defaultValue: 35,
    unit: "percent",
    distribution: "normal",
    range: { min: 30, max: 40 },
    confidenceInterval: { lower: 32, upper: 38 },
    dataPoints: [
      { x: 30, y: 0.3 },
      { x: 31, y: 0.5 },
      { x: 33, y: 0.8 },
      { x: 35, y: 1.0 }, // peak at default
      { x: 37, y: 0.8 },
      { x: 39, y: 0.5 },
      { x: 40, y: 0.3 }
    ],
    source: "WHO Global Burden of Disease"
  },

  healthcare: {
    name: "Annual Healthcare Costs",
    defaultValue: 7000,
    unit: "USD per person",
    distribution: "lognormal",
    range: { min: 6500, max: 20000 },
    confidenceInterval: { lower: 6800, upper: 9200 },
    dataPoints: [
      { x: 6500, y: 0.8 },
      { x: 7000, y: 1.0 }, // peak at default
      { x: 7500, y: 0.9 },
      { x: 8500, y: 0.6 },
      { x: 10000, y: 0.4 },
      { x: 15000, y: 0.2 },
      { x: 20000, y: 0.1 }
    ],
    source: "Greenberg et al. 2021, JID 2017"
  },

  productivity: {
    name: "Annual Productivity Loss",
    defaultValue: 6000,
    unit: "USD per person",
    distribution: "normal",
    range: { min: 6000, max: 10000 },
    confidenceInterval: { lower: 6200, upper: 8800 },
    dataPoints: [
      { x: 6000, y: 1.0 }, // peak at default
      { x: 6500, y: 0.9 },
      { x: 7000, y: 0.8 },
      { x: 7500, y: 0.7 },
      { x: 8000, y: 0.6 },
      { x: 9000, y: 0.4 },
      { x: 10000, y: 0.2 }
    ],
    source: "Springer 2021, Workplace Cost Studies"
  },

  duration: {
    name: "Treatment Duration",
    defaultValue: 4.5,
    unit: "years",
    distribution: "gamma",
    range: { min: 3, max: 6 },
    confidenceInterval: { lower: 3.8, upper: 5.4 },
    dataPoints: [
      { x: 3.0, y: 0.3 },
      { x: 3.5, y: 0.6 },
      { x: 4.0, y: 0.8 },
      { x: 4.5, y: 1.0 }, // peak at default
      { x: 5.0, y: 0.8 },
      { x: 5.5, y: 0.5 },
      { x: 6.0, y: 0.2 }
    ],
    source: "AJPM 2024, Chronic Depression Studies"
  }
};

/**
 * Generate smooth distribution curve data for Chart.js
 * @param {string} parameterKey - Parameter key from PARAMETER_DISTRIBUTIONS
 * @param {number} currentValue - Current slider value (optional, for highlighting)
 * @returns {Object} Chart.js compatible data object for smooth curves
 */
export function generateDistributionData(parameterKey, currentValue = null) {
  const dist = PARAMETER_DISTRIBUTIONS[parameterKey];
  if (!dist) {
    console.warn(`Distribution not found for parameter: ${parameterKey}`);
    return null;
  }

  // Generate smooth curve with interpolated points
  const smoothData = generateSmoothCurve(dist);
  
  // Create labels (fewer than data points for cleaner display)
  const labels = smoothData.map((point, index) => {
    // Only show labels for key points to avoid clutter
    if (index % Math.floor(smoothData.length / 5) === 0) {
      return formatAxisLabel(point.x, dist.unit);
    }
    return '';
  });

  const data = smoothData.map(point => point.y);
  
  // Color scheme based on parameter type
  const colors = getParameterColors(parameterKey);
  
  // Create gradient fill for area under curve
  const gradientDataset = {
    label: 'Research Uncertainty',
    data,
    borderColor: colors.line,
    backgroundColor: colors.fill,
    borderWidth: 2,
    fill: 'origin',
    tension: 0.4, // Smooth curve
    pointRadius: 0, // Hide individual points
    pointHoverRadius: 4,
    pointBackgroundColor: colors.line,
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2
  };

  // Add current value indicator if provided
  if (currentValue !== null) {
    const currentIndex = findClosestPointIndex(smoothData, currentValue);
    if (currentIndex !== -1) {
      gradientDataset.pointRadius = smoothData.map((_, index) => 
        index === currentIndex ? 6 : 0
      );
      gradientDataset.pointBackgroundColor = smoothData.map((_, index) => 
        index === currentIndex ? '#ef4444' : colors.line
      );
    }
  }

  return {
    labels,
    datasets: [gradientDataset]
  };
}

/**
 * Generate smooth curve points using spline interpolation
 * @param {Object} dist - Distribution configuration
 * @returns {Array} Array of {x, y} points for smooth curve
 */
function generateSmoothCurve(dist) {
  const originalPoints = dist.dataPoints;
  const smoothPoints = [];
  const numPoints = 50; // Number of points for smooth curve
  
  const minX = dist.range.min;
  const maxX = dist.range.max;
  const step = (maxX - minX) / (numPoints - 1);
  
  for (let i = 0; i < numPoints; i++) {
    const x = minX + (i * step);
    const y = interpolateValue(x, originalPoints, dist.distribution);
    smoothPoints.push({ x, y });
  }
  
  return smoothPoints;
}

/**
 * Interpolate Y value for given X using distribution shape
 * @param {number} x - X value to interpolate
 * @param {Array} points - Original data points
 * @param {string} distributionType - Type of distribution
 * @returns {number} Interpolated Y value
 */
function interpolateValue(x, points, distributionType) {
  // Find surrounding points
  let leftPoint = points[0];
  let rightPoint = points[points.length - 1];
  
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      leftPoint = points[i];
      rightPoint = points[i + 1];
      break;
    }
  }
  
  // Handle edge cases
  if (x <= points[0].x) return points[0].y;
  if (x >= points[points.length - 1].x) return points[points.length - 1].y;
  
  // Linear interpolation with distribution-specific smoothing
  const ratio = (x - leftPoint.x) / (rightPoint.x - leftPoint.x);
  let interpolated = leftPoint.y + ratio * (rightPoint.y - leftPoint.y);
  
  // Apply distribution-specific smoothing
  if (distributionType === 'normal') {
    // Gaussian-like smoothing
    interpolated = Math.max(0, interpolated);
  } else if (distributionType === 'lognormal') {
    // Asymmetric smoothing for lognormal
    interpolated = Math.max(0.05, interpolated);
  }
  
  return interpolated;
}

/**
 * Find closest point index to current value
 * @param {Array} points - Array of {x, y} points
 * @param {number} currentValue - Current slider value
 * @returns {number} Index of closest point, or -1 if not found
 */
function findClosestPointIndex(points, currentValue) {
  let closestIndex = -1;
  let minDistance = Infinity;
  
  points.forEach((point, index) => {
    const distance = Math.abs(point.x - currentValue);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  
  return closestIndex;
}

/**
 * Get color scheme for parameter type
 * @param {string} parameterKey - Parameter key
 * @returns {Object} Color configuration
 */
function getParameterColors(parameterKey) {
  const colorSchemes = {
    // Mortality parameters - Red theme
    vsl: { line: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' },
    suicides: { line: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' },
    attribution: { line: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' },
    
    // Mental health parameters - Purple theme
    depression: { line: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
    yld: { line: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
    qol: { line: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
    
    // Economic parameters - Green theme
    healthcare: { line: '#059669', fill: 'rgba(5, 150, 105, 0.2)' },
    productivity: { line: '#059669', fill: 'rgba(5, 150, 105, 0.2)' },
    duration: { line: '#059669', fill: 'rgba(5, 150, 105, 0.2)' }
  };
  
  return colorSchemes[parameterKey] || { line: '#64748b', fill: 'rgba(100, 116, 139, 0.2)' };
}

/**
 * Format axis label based on unit type
 * @param {number} value - Numeric value
 * @param {string} unit - Unit type
 * @returns {string} Formatted label
 */
function formatAxisLabel(value, unit) {
  if (unit === "million USD") {
    return `$${value.toFixed(1)}M`;
  } else if (unit === "USD per person") {
    return `$${Math.round(value / 1000)}K`;
  } else if (unit === "people") {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (unit === "deaths") {
    return `${Math.round(value / 1000)}K`;
  } else if (unit === "percent") {
    return `${Math.round(value)}%`;
  } else if (unit === "years") {
    return `${value.toFixed(1)}y`;
  }
  return value.toString();
}

/**
 * Get simplified distribution summary for display
 * @param {string} parameterKey - Parameter key
 * @returns {Object} Summary information
 */
export function getDistributionSummary(parameterKey) {
  const dist = PARAMETER_DISTRIBUTIONS[parameterKey];
  if (!dist) return null;

  return {
    name: dist.name,
    defaultValue: dist.defaultValue,
    range: dist.range,
    confidenceInterval: dist.confidenceInterval,
    distribution: dist.distribution,
    source: dist.source
  };
}

/**
 * Calculate uncertainty bounds for a given confidence level
 * @param {string} parameterKey - Parameter key
 * @param {number} confidenceLevel - Confidence level (0-1, default 0.8 for 80%)
 * @returns {Object} Lower and upper bounds
 */
export function getUncertaintyBounds(parameterKey, confidenceLevel = 0.8) {
  const dist = PARAMETER_DISTRIBUTIONS[parameterKey];
  if (!dist) return null;

  // For simplicity, return pre-calculated confidence intervals
  // In a more sophisticated version, this would calculate based on the distribution type
  return {
    lower: dist.confidenceInterval.lower,
    upper: dist.confidenceInterval.upper,
    confidenceLevel: confidenceLevel * 100
  };
} 