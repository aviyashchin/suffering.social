/**
 * Validation utilities for calculator parameters
 */

export class ValidationUtils {
    constructor() {
        this.parameterRanges = {
            vsl: { min: 7.2, max: 14.0 },
            suicides: { min: 89000, max: 300000 },
            attribution: { min: 5, max: 30 },
            depression: { min: 3000000, max: 15000000 },
            yld: { min: 4.8, max: 8.2 },
            qol: { min: 31, max: 47 },
            healthcare: { min: 6500, max: 20000 },
            productivity: { min: 4800, max: 10000 },
            duration: { min: 3.0, max: 8.5 }
        };
    }
    
    /**
     * Validate parameter ranges against research bounds
     * @param {Object} parameters - Parameters to validate
     * @returns {Array} Array of validation errors
     */
    validateParameterRanges(parameters) {
        const errors = [];
        
        for (const [param, value] of Object.entries(parameters)) {
            const range = this.parameterRanges[param];
            if (range) {
                if (value < range.min || value > range.max) {
                    errors.push(`${param} value ${value} outside research range [${range.min}, ${range.max}]`);
                }
            }
        }
        
        if (errors.length > 0) {
            console.warn('Parameter validation warnings:', errors);
        }
        
        return errors;
    }
    
    /**
     * Check if a value is a valid number
     * @param {any} value - Value to check
     * @returns {boolean} True if valid number
     */
    isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }
    
    /**
     * Validate calculation consistency
     * @param {Object} results - Calculation results
     * @returns {boolean} True if results are consistent
     */
    validateResults(results) {
        if (!results) return false;
        
        const { mortality, mental, productivity, total } = results;
        
        // Check all components are positive
        if (mortality < 0 || mental < 0 || productivity < 0) {
            console.error('Negative cost components detected');
            return false;
        }
        
        // Check total equals sum of components (within rounding tolerance)
        const calculatedTotal = mortality + mental + productivity;
        const difference = Math.abs(total - calculatedTotal);
        const tolerance = total * 0.001; // 0.1% tolerance
        
        if (difference > tolerance) {
            console.error('Total cost mismatch:', { total, calculatedTotal, difference });
            return false;
        }
        
        return true;
    }
} 