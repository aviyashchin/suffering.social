/**
 * Utilities Module for Social Media Calculator
 * 
 * This module contains utility classes for:
 * - Number formatting and calculations
 * - UI helpers and DOM manipulation
 * - Mobile optimization
 * - Variable mapping and validation
 */

/**
 * Universal Calculator Utilities
 * Static methods for common calculation and formatting tasks
 */
export class CalculatorUtils {
  /**
   * Format large numbers with appropriate units (K, M, B, T)
   * @param {number} value - The number to format
   * @returns {string} Formatted number string
   */
  static formatLargeNumber(value) {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value.toFixed(0);
  }

  /**
   * Calculate percentage of GDP
   * @param {number} totalCost - Total economic cost
   * @param {number} gdpValue - GDP value (default: $24T US GDP)
   * @returns {string} Percentage as string with 1 decimal place
   */
  static calculateGDPPercentage(totalCost, gdpValue = 24e12) {
    return ((totalCost / gdpValue) * 100).toFixed(1);
  }

  /**
   * Clamp a value between min and max bounds
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clampValue(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Validate that a value is a valid number
   * @param {any} value - Value to validate
   * @returns {boolean} True if valid number
   */
  static isValidNumber(value) {
    return typeof value === 'number' && isFinite(value) && !isNaN(value);
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, delay) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  }

  /**
   * Format currency values with appropriate suffixes
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount) {
    if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  }
}

/**
 * UI Helper Utilities
 * Methods for safe DOM manipulation and UI updates
 */
export class UIHelpers {
  /**
   * Safely update element content with error handling
   * @param {string} elementId - Element ID to update
   * @param {string} newContent - New content to set
   * @param {boolean} isHTML - Whether content is HTML (default: false)
   * @returns {boolean} Success status
   */
  static updateElementSafely(elementId, newContent, isHTML = false) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element ${elementId} not found`);
      return false;
    }

    try {
      if (isHTML) {
        element.innerHTML = newContent;
      } else {
        element.textContent = newContent;
      }
      return true;
    } catch (error) {
      console.error(`Failed to update element ${elementId}:`, error);
      return false;
    }
  }

  /**
   * Add loading state to an element
   * @param {HTMLElement} element - Element to add loading state to
   */
  static addLoadingState(element) {
    if (element) {
      element.classList.add('updating');
      element.style.opacity = '0.7';
      element.style.pointerEvents = 'none';
    }
  }

  /**
   * Remove loading state from an element
   * @param {HTMLElement} element - Element to remove loading state from
   */
  static removeLoadingState(element) {
    if (element) {
      element.classList.remove('updating');
      element.style.opacity = '1';
      element.style.pointerEvents = 'auto';
    }
  }

  /**
   * Animate value changes with smooth transitions
   * @param {HTMLElement} element - Element to animate
   * @param {number} fromValue - Starting value
   * @param {number} toValue - Ending value
   * @param {number} duration - Animation duration in ms
   */
  static animateValue(element, fromValue, toValue, duration = 300) {
    if (!element || !window.requestAnimationFrame) {
      element.textContent = CalculatorUtils.formatCurrency(toValue);
      return;
    }

    const startTime = performance.now();
    const startValue = parseFloat(fromValue) || 0;
    const endValue = parseFloat(toValue) || 0;
    const valueRange = endValue - startValue;

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out animation curve
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (valueRange * easeOutProgress);
      
      element.textContent = CalculatorUtils.formatCurrency(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  /**
   * Get element dimensions safely
   * @param {HTMLElement} element - Element to measure
   * @returns {Object} Width and height dimensions
   */
  static getElementDimensions(element) {
    if (!element) return { width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    return { 
      width: rect.width, 
      height: rect.height,
      top: rect.top,
      left: rect.left
    };
  }

  /**
   * Create and show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Duration in ms (default: 3000)
   */
  static showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });

    // Set background color based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after duration
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  }
}

/**
 * Mobile Optimization Utilities
 * Methods for device detection and mobile-specific optimizations
 */
export class MobileOptimizations {
  /**
   * Check if current device is mobile
   * @returns {boolean} True if mobile device
   */
  static isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if current device is tablet
   * @returns {boolean} True if tablet device
   */
  static isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  /**
   * Check if current device is desktop
   * @returns {boolean} True if desktop device
   */
  static isDesktop() {
    return window.innerWidth > 1024;
  }

  /**
   * Get optimal container width for current device
   * @returns {string} CSS width value
   */
  static getOptimalContainerWidth() {
    if (this.isMobile()) return '100%';
    if (this.isTablet()) return '95%';
    return '90%';
  }

  /**
   * Get optimal padding for current device
   * @returns {string} CSS padding value
   */
  static getOptimalPadding() {
    if (this.isMobile()) return '1rem';
    if (this.isTablet()) return '1.5rem';
    return '2rem';
  }

  /**
   * Check if animations should be reduced
   * @returns {boolean} True if animations should be reduced
   */
  static shouldReduceAnimations() {
    return this.isMobile() || 
           window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Optimize touch targets for mobile devices
   */
  static optimizeForTouch() {
    if (!this.isMobile()) return;

    const interactiveElements = document.querySelectorAll('button, .btn, input, select, textarea, a');
    
    interactiveElements.forEach(element => {
      const style = element.style;
      const currentHeight = parseFloat(getComputedStyle(element).height);
      
      // Ensure minimum 44px touch target
      if (currentHeight < 44) {
        style.minHeight = '44px';
        style.minWidth = '44px';
      }
      
      // Add touch-specific styles
      style.WebkitTapHighlightColor = 'rgba(0,0,0,0.1)';
      style.userSelect = 'none';
    });
  }

  /**
   * Get device type for analytics/optimization
   * @returns {string} Device type ('mobile', 'tablet', 'desktop')
   */
  static getDeviceType() {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }

  /**
   * Optimize component rendering for current device
   * @param {HTMLElement} component - Component to optimize
   */
  static optimizeComponent(component) {
    if (!component) return;

    const deviceType = this.getDeviceType();
    component.classList.add(`device-${deviceType}`);
    
    if (this.shouldReduceAnimations()) {
      component.classList.add('reduce-motion');
    }
  }
}

/**
 * Variable Mapping Utilities
 * Maps between short parameter names and semantic names
 */
export class VariableMapper {
  static semanticNames = {
    'vsl': 'valueOfStatisticalLife',
    'suicides': 'excessDeaths', 
    'attribution': 'attributionRate',
    'depression': 'affectedPopulation',
    'yld': 'disabilityDuration', 
    'qol': 'qualityImpact',
    'healthcare': 'healthcareCost',
    'productivity': 'productivityLoss',
    'duration': 'treatmentDuration'
  };

  static displayNames = {
    'vsl': 'Value of Statistical Life',
    'suicides': 'Excess Suicides Since 2009',
    'attribution': '% Attributable to Social Media',
    'depression': 'SM-Induced Depression Cases',
    'yld': 'Years Lived with Disability',
    'qol': 'Quality of Life Reduction',
    'healthcare': 'Annual Healthcare Costs',
    'productivity': 'Annual Productivity Loss',
    'duration': 'Treatment Duration'
  };

  static variableSymbols = {
    'vsl': 'VSL',
    'suicides': 'ED',
    'attribution': 'AR',
    'depression': 'AP',
    'yld': 'DD',
    'qol': 'QI',
    'healthcare': 'HC',
    'productivity': 'PL',
    'duration': 'TD'
  };

  /**
   * Get semantic name for parameter
   * @param {string} shortName - Short parameter name
   * @returns {string} Semantic name
   */
  static getSemanticName(shortName) {
    return this.semanticNames[shortName] || shortName;
  }

  /**
   * Get display name for parameter
   * @param {string} shortName - Short parameter name
   * @returns {string} Display name
   */
  static getDisplayName(shortName) {
    return this.displayNames[shortName] || shortName;
  }

  /**
   * Get variable symbol for parameter
   * @param {string} shortName - Short parameter name
   * @returns {string} Variable symbol
   */
  static getVariableSymbol(shortName) {
    return this.variableSymbols[shortName] || shortName.toUpperCase();
  }

  /**
   * Get all semantic names mapping
   * @returns {Object} Complete semantic names mapping
   */
  static getAllSemanticNames() {
    return { ...this.semanticNames };
  }

  /**
   * Validate parameter name
   * @param {string} paramName - Parameter name to validate
   * @returns {boolean} True if valid parameter
   */
  static isValidParameter(paramName) {
    return paramName in this.semanticNames;
  }
}

/**
 * Performance Utilities
 * Methods for monitoring and optimizing performance
 */
export class PerformanceUtils {
  static measurements = new Map();

  /**
   * Start performance measurement
   * @param {string} name - Measurement name
   */
  static startMeasurement(name) {
    this.measurements.set(name, performance.now());
  }

  /**
   * End performance measurement and log result
   * @param {string} name - Measurement name
   * @returns {number} Duration in milliseconds
   */
  static endMeasurement(name) {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    this.measurements.delete(name);
    return duration;
  }

  /**
   * Monitor function execution time
   * @param {Function} func - Function to monitor
   * @param {string} name - Function name for logging
   * @returns {Function} Wrapped function with timing
   */
  static monitor(func, name) {
    return function(...args) {
      PerformanceUtils.startMeasurement(name);
      const result = func.apply(this, args);
      PerformanceUtils.endMeasurement(name);
      return result;
    };
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics object
   */
  static getMetrics() {
    if (!window.performance) return {};

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    };
  }
}

// Export all utilities as default for convenience
export default {
  CalculatorUtils,
  UIHelpers,
  MobileOptimizations,
  VariableMapper,
  PerformanceUtils
}; 