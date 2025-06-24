/**
 * Performance Optimizer for Social Media Cost Calculator
 * Replaces heavy timer-based updates with efficient batched operations
 */

class PerformanceOptimizer {
    constructor() {
        this.rafId = null;
        this.lastUpdate = 0;
        this.updateInterval = 1000; // Update once per second instead of 10 times
        this.isActive = false;
        this.callbacks = new Set();
        this.cachedValues = new Map();
    }

    /**
     * Add a callback to be executed on updates
     */
    addCallback(name, callback) {
        this.callbacks.add({ name, callback });
    }

    /**
     * Remove a callback
     */
    removeCallback(name) {
        for (const cb of this.callbacks) {
            if (cb.name === name) {
                this.callbacks.delete(cb);
                break;
            }
        }
    }

    /**
     * Start the optimized update loop
     */
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.lastUpdate = performance.now();
        this.tick();
    }

    /**
     * Stop the update loop
     */
    stop() {
        this.isActive = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Efficient update loop using requestAnimationFrame
     */
    tick() {
        if (!this.isActive) return;

        const now = performance.now();
        
        // Only update once per second instead of 10 times
        if (now - this.lastUpdate >= this.updateInterval) {
            this.batchUpdate();
            this.lastUpdate = now;
        }

        this.rafId = requestAnimationFrame(() => this.tick());
    }

    /**
     * Batch all DOM updates together
     */
    batchUpdate() {
        // Use DocumentFragment for batched DOM updates
        const fragment = document.createDocumentFragment();
        
        for (const { name, callback } of this.callbacks) {
            try {
                callback();
            } catch (error) {
                console.error(`Error in callback ${name}:`, error);
            }
        }
    }

    /**
     * Cache frequently accessed values
     */
    cacheValue(key, value) {
        this.cachedValues.set(key, value);
    }

    /**
     * Get cached value
     */
    getCachedValue(key) {
        return this.cachedValues.get(key);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedValues.clear();
    }
}

/**
 * Optimized Lifetime Counter - replaces the heavy interval-based system
 */
class OptimizedLifetimeCounter {
    constructor() {
        this.startDate = new Date('2009-01-01');
        this.sessionStartDate = new Date();
        this.rates = {
            depressionPerSecond: 0,
            suicidePerSecond: 0,
            totalCostPerSecond: 0
        };
        this.elements = this.cacheElements();
    }

    cacheElements() {
        return {
            depression: document.getElementById('lifetime-depression'),
            suicide: document.getElementById('lifetime-suicide'),
            nationalDebt: document.getElementById('national-debt-clock-total-amount'),
            sessionCost: document.getElementById('running-total-amount')
        };
    }

    updateRates(state) {
        const totalSeconds = (new Date() - this.startDate) / 1000;
        
        this.rates.depressionPerSecond = state.depression / totalSeconds;
        this.rates.suicidePerSecond = state.suicides / totalSeconds;
        this.rates.totalCostPerSecond = state.results.totalCost / totalSeconds;
    }

    update() {
        const now = new Date();
        const elapsedSeconds = (now - this.startDate) / 1000;
        const sessionElapsedSeconds = (now - this.sessionStartDate) / 1000;
        
        // Calculate current values
        const currentDepression = this.rates.depressionPerSecond * elapsedSeconds;
        const currentSuicide = this.rates.suicidePerSecond * elapsedSeconds;
        const currentTotalCost = this.rates.totalCostPerSecond * elapsedSeconds;
        const sessionCost = this.rates.totalCostPerSecond * sessionElapsedSeconds;
        
        // Batch DOM updates
        if (this.elements.depression) {
            this.elements.depression.textContent = this.formatNumber(currentDepression);
        }
        if (this.elements.suicide) {
            this.elements.suicide.textContent = this.formatNumber(currentSuicide);
        }
        if (this.elements.nationalDebt) {
            this.elements.nationalDebt.textContent = Math.floor(currentTotalCost).toLocaleString();
        }
        if (this.elements.sessionCost) {
            this.elements.sessionCost.textContent = Math.floor(sessionCost).toLocaleString();
        }
    }

    formatNumber(value) {
        return value >= 1000000 ? 
            Math.floor(value).toLocaleString() : 
            value.toFixed(2);
    }
}

/**
 * Chart Performance Manager - optimizes Chart.js operations
 */
class ChartPerformanceManager {
    constructor() {
        this.charts = new Map();
        this.updateQueue = new Set();
        this.isUpdating = false;
    }

    registerChart(name, chart) {
        this.charts.set(name, chart);
    }

    queueUpdate(chartName, data) {
        this.updateQueue.add({ chartName, data });
        this.scheduleUpdate();
    }

    scheduleUpdate() {
        if (this.isUpdating) return;
        
        this.isUpdating = true;
        requestAnimationFrame(() => {
            this.processUpdateQueue();
            this.isUpdating = false;
        });
    }

    processUpdateQueue() {
        for (const { chartName, data } of this.updateQueue) {
            const chart = this.charts.get(chartName);
            if (chart) {
                this.updateChartEfficiently(chart, data);
            }
        }
        this.updateQueue.clear();
    }

    updateChartEfficiently(chart, data) {
        // Disable animations for better performance
        chart.options.animation = false;
        chart.options.responsive = false;
        
        // Update data without triggering full re-render
        Object.assign(chart.data, data);
        chart.update('none'); // No animation
    }

    destroyChart(name) {
        const chart = this.charts.get(name);
        if (chart) {
            chart.destroy();
            this.charts.delete(name);
        }
    }

    destroyAll() {
        for (const [name, chart] of this.charts) {
            chart.destroy();
        }
        this.charts.clear();
    }
}

/**
 * DOM Performance Utilities
 */
class DOMPerformanceUtils {
    static batchDOMUpdates(updates) {
        const fragment = document.createDocumentFragment();
        
        // Batch all DOM operations
        for (const update of updates) {
            try {
                update();
            } catch (error) {
                console.error('DOM update error:', error);
            }
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static cleanupEventListeners(element) {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
        return clone;
    }
}

// Global instances
window.performanceOptimizer = new PerformanceOptimizer();
window.optimizedLifetimeCounter = new OptimizedLifetimeCounter();
window.chartPerformanceManager = new ChartPerformanceManager();
window.DOMPerformanceUtils = DOMPerformanceUtils; 