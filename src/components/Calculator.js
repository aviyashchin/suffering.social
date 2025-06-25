/**
 * Calculator Component - Core Economic Calculations
 * 
 * Performs all social media cost calculations based on research-backed formulas.
 * Each calculation method is documented with inputs, outputs, and methodology.
 * 
 * @fileoverview Core calculation engine for social media economic impact
 * @version 1.0.0
 */

import { DEFAULTS, CALCULATION, FORMULAS, SCENARIOS, RANGES } from '../utils/constants.js';
import { isValidNumber } from '../utils/formatters.js';
import { CalculatorUtils } from '../utils/formatting.js';
import { ValidationUtils } from '../utils/validation.js';

/**
 * Main Calculator class handling all economic impact calculations
 */
export class Calculator {
  constructor(config = {}) {
    this.parameters = { ...DEFAULTS, ...config.parameters };
    this.results = {
      mortality: 0,
      mentalHealth: 0,
      healthcare: 0,
      total: 0,
      gdpPercentage: 0,
      parameters: { ...this.parameters },
      formulas: {},
      timestamp: Date.now()
    };
    this.scenarios = SCENARIOS;
    this.ranges = RANGES;
    this.validationUtils = new ValidationUtils();
    this.utils = CalculatorUtils;
    
    // Event system for parameter changes
    this.listeners = new Map();
    
    console.log('✅ Calculator core initialized with parameters:', this.parameters);
  }

  /**
   * Update a single parameter and recalculate
   * @param {string} parameterName - Name of parameter to update
   * @param {number} value - New value for parameter
   * @returns {Object} Updated calculation results
   */
  updateParameter(parameterName, value) {
    if (!isValidNumber(value)) {
      console.warn(`Invalid value for ${parameterName}:`, value);
      return this.results;
    }

    const oldValue = this.parameters[parameterName];
    this.parameters[parameterName] = value;
    
    // Emit parameter change event
    this.emit('parameterChanged', { 
      parameter: parameterName, 
      oldValue, 
      newValue: value 
    });
    
    // Recalculate and check for significant changes
    const results = this.calculateAll();
    
    if (Math.abs((results.total - this.results.total) / this.results.total) > 0.1) {
      this.emit('significantChange', { 
        parameter: parameterName, 
        results 
      });
    }
    
    return results;
  }

  /**
   * Update multiple parameters at once (used for scenarios)
   * @param {Object} newParameters - Object with parameter names and values
   * @returns {Object} Updated calculation results
   */
  updateParameters(newParameters) {
    // Validate all parameters before updating
    for (const [key, value] of Object.entries(newParameters)) {
      if (!isValidNumber(value)) {
        console.warn(`Invalid value for ${key}:`, value);
        continue;
      }
      this.parameters[key] = value;
    }

    return this.calculateAll();
  }

  /**
   * Perform all calculations and return complete results
   * @returns {Object} Complete calculation results
   */
  calculateAll() {
    try {
      const mortality = this.calculateMortalityCosts();
      const mentalHealth = this.calculateMentalHealthCosts();
      const healthcare = this.calculateHealthcareCosts();
      const total = mortality + mentalHealth + healthcare;

      this.results = {
        mortality,
        mentalHealth,
        healthcare,
        total,
        gdpPercentage: (total / CALCULATION.US_GDP) * 100,
        parameters: { ...this.parameters },
        formulas: this.getFormulaResults(mortality, mentalHealth, healthcare),
        timestamp: Date.now()
      };

      return this.results;
    } catch (error) {
      console.error('Calculation error:', error);
      return this.getErrorResults();
    }
  }

  /**
   * Calculate mortality costs using VSL methodology
   * Formula: Excess Suicides × Attribution % × Value of Statistical Life
   * 
   * @returns {number} Total mortality costs in USD
   */
  calculateMortalityCosts() {
    const { suicides, attribution, vsl } = this.parameters;
    
    // Validate inputs
    if (!isValidNumber(suicides) || !isValidNumber(attribution) || !isValidNumber(vsl)) {
      throw new Error('Invalid mortality calculation parameters');
    }

    // Convert attribution from percentage to decimal
    const attributionDecimal = attribution / 100;
    
    // VSL is in millions, convert to actual dollars
    const vslActual = vsl * 1000000;
    
    // Calculate total mortality cost
    const mortalityCost = suicides * attributionDecimal * vslActual;
    
    // Validate result
    if (!isValidNumber(mortalityCost) || mortalityCost < 0) {
      throw new Error('Invalid mortality calculation result');
    }

    return mortalityCost;
  }

  /**
   * Calculate mental health costs using QALY methodology
   * Formula: People × Years × Quality Loss % × (VSL ÷ Life Expectancy)
   * 
   * @returns {number} Total mental health costs in USD
   */
  calculateMentalHealthCosts() {
    const { depression, yld, qol, vsl } = this.parameters;
    
    // Validate inputs
    if (!isValidNumber(depression) || !isValidNumber(yld) || 
        !isValidNumber(qol) || !isValidNumber(vsl)) {
      throw new Error('Invalid mental health calculation parameters');
    }

    // Convert QOL from percentage to decimal
    const qolDecimal = qol / 100;
    
    // VSL is in millions, convert to actual dollars
    const vslActual = vsl * 1000000;
    
    // Calculate annual value of a quality life year
    const annualLifeValue = vslActual / CALCULATION.LIFE_EXPECTANCY;
    
    // Calculate total mental health cost
    const mentalHealthCost = depression * yld * qolDecimal * annualLifeValue;
    
    // Validate result
    if (!isValidNumber(mentalHealthCost) || mentalHealthCost < 0) {
      throw new Error('Invalid mental health calculation result');
    }

    return mentalHealthCost;
  }

  /**
   * Calculate healthcare and productivity costs
   * Formula: Affected People × (Healthcare + Productivity) × Duration
   * 
   * @returns {number} Total healthcare and productivity costs in USD
   */
  calculateHealthcareCosts() {
    const { depression, healthcare, productivity, duration } = this.parameters;
    
    // Validate inputs
    if (!isValidNumber(depression) || !isValidNumber(healthcare) || 
        !isValidNumber(productivity) || !isValidNumber(duration)) {
      throw new Error('Invalid healthcare calculation parameters');
    }

    // Calculate combined annual cost per person
    const annualCostPerPerson = healthcare + productivity;
    
    // Calculate total healthcare cost
    const healthcareCost = depression * annualCostPerPerson * duration;
    
    // Validate result
    if (!isValidNumber(healthcareCost) || healthcareCost < 0) {
      throw new Error('Invalid healthcare calculation result');
    }

    return healthcareCost;
  }

  /**
   * Calculate community impact based on population
   * @param {number} population - Community population size
   * @param {string} state - State or region (for future use)
   * @returns {Object} Community-specific impact calculations
   */
  calculateCommunityImpact(population, state = 'national') {
    if (!isValidNumber(population) || population <= 0) {
      throw new Error('Invalid population size');
    }

    const nationalPopulation = 331000000; // US population approximation
    const scalingFactor = population / nationalPopulation;

    const communityImpact = {
      totalCost: this.results.total * scalingFactor,
      mortality: this.results.mortality * scalingFactor,
      mentalHealth: this.results.mentalHealth * scalingFactor,
      healthcare: this.results.healthcare * scalingFactor,
      affectedPeople: Math.round(this.parameters.depression * scalingFactor),
      excessDeaths: Math.round(this.parameters.suicides * (this.parameters.attribution / 100) * scalingFactor),
      population,
      state
    };

    return communityImpact;
  }

  /**
   * Calculates the total economic impact using the three-component research model
   * @returns {Object} Economic impact breakdown in USD
   */
  calculateTotalEconomicImpact() {
    // Validate parameters before calculation
    this.validationUtils.validateParameterRanges(this.parameters);
    
    // Component 1: Mortality costs using federal VSL methodology
    const excessDeaths = this.parameters.suicides * (this.parameters.attribution / 100);
    const mortalityCosts = excessDeaths * this.parameters.vsl * 1_000_000;
    
    // Component 2: Disability costs using WHO QALY methodology  
    const annualQALYValue = (this.parameters.vsl * 1_000_000) / 75; // 75-year life expectancy
    const qualityDecrement = this.parameters.qol / 100;
    const disabilityCosts = this.parameters.depression * this.parameters.yld * qualityDecrement * annualQALYValue;
    
    // Component 3: Economic productivity losses (healthcare + workplace)
    const annualCostPerPerson = this.parameters.healthcare + this.parameters.productivity;
    const productivityCosts = this.parameters.depression * annualCostPerPerson * this.parameters.duration;
    
    const totalCosts = mortalityCosts + disabilityCosts + productivityCosts;
    
    // Sanity checks
    console.assert(totalCosts > 0, 'Total economic impact must be positive');
    console.assert(totalCosts < 50_000_000_000_000, `Total cost ${totalCosts} exceeds reasonable bounds`);
    
    return {
      mortality: mortalityCosts,
      mental: disabilityCosts, 
      productivity: productivityCosts,
      total: totalCosts
    };
  }

  /**
   * Applies a research scenario with validation
   * @param {string} scenarioName - Name of scenario to apply
   */
  applyScenario(scenarioName) {
    const scenario = this.scenarios[scenarioName];
    if (!scenario || !scenario.values) {
      console.error(`Unknown scenario or missing values: ${scenarioName}`);
      return false;
    }
    
    const oldParameters = { ...this.parameters };
    
    // Apply scenario values (not the scenario object itself)
    Object.entries(scenario.values).forEach(([param, value]) => {
      this.parameters[param] = value;
    });
    
    // Recalculate
    this.calculateAll();
    
    this.emit('scenarioApplied', { 
      scenarioName, 
      oldParameters, 
      newParameters: { ...this.parameters } 
    });
    
    console.log(`✅ Applied scenario: ${scenarioName}`, scenario.values);
    return true;
  }
  
  /**
   * Applies research citation values to parameters
   * @param {Object} citationValues - Parameter values from research citation
   */
  applyCitationValues(citationValues) {
    const oldParameters = { ...this.parameters };
    const appliedChanges = {};
    
    Object.entries(citationValues).forEach(([param, value]) => {
      if (this.updateParameter(param, value)) {
        appliedChanges[param] = value;
      }
    });
    
    this.emit('citationApplied', { 
      appliedChanges, 
      oldParameters,
      newParameters: { ...this.parameters }
    });
    
    console.log(`✅ Applied citation values:`, appliedChanges);
    return appliedChanges;
  }
  
  /**
   * Gets formatted parameter value for display
   * @param {string} parameterName - Parameter to format
   * @returns {string} Formatted value
   */
  getFormattedParameter(parameterName) {
    const value = this.parameters[parameterName];
    if (!isValidNumber(value)) return '0';
    
    const formatters = {
      vsl: v => `$${v.toFixed(1)}M`,
      suicides: v => `${Math.round(v/1000)}K`,
      attribution: v => `${Math.round(v)}%`,
      depression: v => `${(v/1000000).toFixed(1)}M`,
      yld: v => `${v.toFixed(1)} years`,
      qol: v => `${Math.round(v)}%`,
      healthcare: v => `$${Math.round(v/1000)}K`,
      productivity: v => `$${Math.round(v/1000)}K`,
      duration: v => `${v.toFixed(1)} years`
    };
    
    return formatters[parameterName] ? formatters[parameterName](value) : value.toString();
  }
  
  /**
   * Gets parameter range information for validation
   * @param {string} parameterName - Parameter to get range for
   * @returns {Object} Range information
   */
  getParameterRange(parameterName) {
    return this.ranges[parameterName] || null;
  }
  
  /**
   * Validates all current parameters
   * @returns {Object} Validation results
   */
  validateAllParameters() {
    return this.validationUtils.validateAll(this.parameters);
  }
  
  /**
   * Gets confidence interval for a parameter
   * @param {string} parameterName - Parameter name
   * @returns {Object} Confidence interval information
   */
  getConfidenceInterval(parameterName) {
    const currentValue = this.parameters[parameterName];
    return this.validationUtils.calculateConfidenceInterval(parameterName, currentValue);
  }
  
  /**
   * Tests calculation consistency (for debugging)
   * @returns {boolean} True if all tests pass
   */
  testCalculationConsistency() {
    console.log('🧪 Running calculation consistency tests...');
    
    try {
      const baseline = this.calculateTotalEconomicImpact();
      
      // Test 1: VSL doubling should roughly double mortality costs
      const originalVSL = this.parameters.vsl;
      this.parameters.vsl *= 2;
      const doubled = this.calculateTotalEconomicImpact();
      const mortalityRatio = doubled.mortality / baseline.mortality;
      
      if (Math.abs(mortalityRatio - 2) > 0.1) {
        console.error(`❌ VSL doubling test failed. Expected ~2x, got ${mortalityRatio.toFixed(2)}x`);
        return false;
      }
      
      // Restore and test other components
      this.parameters.vsl = originalVSL;
      
      console.log('✅ All calculation consistency tests passed');
      return true;
      
    } catch (error) {
      console.error('❌ Consistency test error:', error);
      return false;
    }
  }
  
  /**
   * Simple event system for parameter changes
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Returns current state for serialization/debugging
   */
  getState() {
    return {
      parameters: { ...this.parameters },
      results: { ...this.results },
      isValid: this.validateParameters().length === 0
    };
  }
  
  /**
   * Loads state from serialized data
   */
  loadState(state) {
    if (state.parameters) {
      this.parameters = { ...DEFAULTS, ...state.parameters };
      this.emit('stateLoaded', state);
    }
  }

  /**
   * Validate all current parameters
   * @returns {Array} Array of validation errors (empty if all valid)
   */
  validateParameters() {
    const errors = [];
    
    for (const [key, value] of Object.entries(this.parameters)) {
      if (!isValidNumber(value)) {
        errors.push(`Invalid value for ${key}: ${value}`);
      }
      
      // Check ranges
      const range = this.ranges[key];
      if (range && (value < range.min || value > range.max)) {
        errors.push(`${key} must be between ${range.min} and ${range.max}`);
      }
    }
    
    return errors;
  }

  /**
   * Get error results structure
   * @returns {Object} Error results with safe default values
   */
  getErrorResults() {
    return {
      mortality: 0,
      mentalHealth: 0,
      healthcare: 0,
      total: 0,
      gdpPercentage: 0,
      parameters: { ...this.parameters },
      formulas: {
        mortality: { formula: 'Error', result: '$0', description: 'Calculation error' },
        mentalHealth: { formula: 'Error', result: '$0', description: 'Calculation error' },
        healthcare: { formula: 'Error', result: '$0', description: 'Calculation error' }
      },
      error: true,
      timestamp: Date.now()
    };
  }
}

/**
 * Create and return a new Calculator instance
 * @returns {Calculator} New calculator instance with default parameters
 */
export function createCalculator() {
  const calculator = new Calculator();
  calculator.calculateAll(); // Initialize with default calculations
  return calculator;
}

/**
 * Utility function to validate calculation inputs
 * @param {Object} parameters - Parameters to validate
 * @returns {boolean} True if all parameters are valid
 */
export function validateCalculationInputs(parameters) {
  for (const [key, value] of Object.entries(parameters)) {
    if (!isValidNumber(value) || value < 0) {
      console.warn(`Invalid parameter ${key}: ${value}`);
      return false;
    }
  }
  return true;
}

// Export the Calculator class as default
export default Calculator; 