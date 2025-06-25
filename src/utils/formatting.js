/**
 * Formatting utilities for the calculator
 * Handles number formatting, currency display, and value presentation
 */

/**
 * Calculator utility functions
 */
export class CalculatorUtils {
    /**
     * Format large numbers with appropriate suffixes
     * @param {number} value - Number to format
     * @returns {string} Formatted string with suffix
     */
    static formatLargeNumber(value) {
        if (!value || isNaN(value)) return '$0';
        
        const absValue = Math.abs(value);
        
        if (absValue >= 1e12) {
            return `$${(value / 1e12).toFixed(1)}T`;
        } else if (absValue >= 1e9) {
            return `$${(value / 1e9).toFixed(1)}B`;
        } else if (absValue >= 1e6) {
            return `$${(value / 1e6).toFixed(1)}M`;
        } else if (absValue >= 1e3) {
            return `$${(value / 1e3).toFixed(1)}K`;
        } else {
            return `$${Math.round(value).toLocaleString()}`;
        }
    }
    
    /**
     * Calculate GDP percentage
     * @param {number} amount - Dollar amount
     * @returns {string} Percentage of US GDP
     */
    static calculateGDPPercentage(amount) {
        const US_GDP = 24e12; // $24 trillion
        const percentage = (amount / US_GDP) * 100;
        return percentage.toFixed(1);
    }
    
    /**
     * Format currency without suffixes
     * @param {number} value - Currency value
     * @returns {string} Formatted currency
     */
    static formatCurrency(value) {
        if (!value || isNaN(value)) return '$0';
        return `$${Math.round(value).toLocaleString()}`;
    }
    
    /**
     * Format percentage values
     * @param {number} value - Percentage value
     * @returns {string} Formatted percentage
     */
    static formatPercentage(value) {
        if (!value || isNaN(value)) return '0%';
        return `${value.toFixed(1)}%`;
    }
} 