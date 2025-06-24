/**
 * Performance Monitor for Social Media Cost Calculator
 * Tracks metrics and identifies bottlenecks
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            domContentLoaded: 0,
            loadComplete: 0,
            jsHeapUsed: 0,
            jsHeapTotal: 0,
            activeTimers: 0,
            activeAnimations: 0,
            chartRenders: 0,
            sliderUpdates: 0
        };
        
        this.observers = [];
        this.isMonitoring = false;
        this.startTime = performance.now();
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.collectInitialMetrics();
        this.setupObservers();
        this.startPeriodicCollection();
        
        // Reduced logging: console.log('📊 Performance monitoring started');
    }

    collectInitialMetrics() {
        // Collect navigation timing with proper fallbacks
        if (performance.navigation && performance.timing) {
            const timing = performance.timing;
            
            // Only calculate if timing values are valid (> 0)
            if (timing.loadEventEnd > 0 && timing.navigationStart > 0) {
                this.metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
            } else {
                this.metrics.pageLoad = performance.now(); // Fallback to current time
            }
            
            if (timing.domContentLoadedEventEnd > 0 && timing.navigationStart > 0) {
                this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
            } else {
                this.metrics.domContentLoaded = performance.now(); // Fallback to current time
            }
        } else {
            // Fallback for browsers without navigation timing
            this.metrics.pageLoad = performance.now();
            this.metrics.domContentLoaded = performance.now();
        }

        // Collect paint timing
        if (performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                if (entry.name === 'first-paint') {
                    this.metrics.firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
            });
        }

        // Collect memory usage
        this.collectMemoryMetrics();
    }

    collectMemoryMetrics() {
        if (performance.memory) {
            this.metrics.jsHeapUsed = performance.memory.usedJSHeapSize;
            this.metrics.jsHeapTotal = performance.memory.totalJSHeapSize;
        }
    }

    setupObservers() {
        // Performance Observer for navigation
        if (window.PerformanceObserver) {
            try {
                const navObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            this.metrics.loadComplete = entry.loadEventEnd;
                        }
                    });
                });
                navObserver.observe({ entryTypes: ['navigation'] });
                this.observers.push(navObserver);
            } catch (error) {
                console.warn('Navigation observer not supported:', error);
            }

            // Performance Observer for paint
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.name === 'first-paint') {
                            this.metrics.firstPaint = entry.startTime;
                        } else if (entry.name === 'first-contentful-paint') {
                            this.metrics.firstContentfulPaint = entry.startTime;
                        }
                    });
                });
                paintObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(paintObserver);
            } catch (error) {
                console.warn('Paint observer not supported:', error);
            }
        }
    }

    startPeriodicCollection() {
        // Collect metrics every 5 seconds
        this.metricsInterval = setInterval(() => {
            this.collectMemoryMetrics();
            this.countActiveTimers();
            this.countActiveAnimations();
        }, 5000);
    }

    countActiveTimers() {
        // This is an approximation - actual timer counting is not directly accessible
        this.metrics.activeTimers = this.estimateActiveTimers();
    }

    estimateActiveTimers() {
        // Count known timer sources
        let count = 0;
        
        // Check if lifetime counter is running
        if (window.LifetimeCounter && window.LifetimeCounter.interval) {
            count++;
        }
        
        // Check for viral features timers
        if (window.ViralFeatures) {
            count += 2; // Estimated viral features timers
        }
        
        // Check performance optimizer
        if (window.performanceOptimizer && window.performanceOptimizer.isActive) {
            count++; // RAF-based, not a timer
        }
        
        return count;
    }

    countActiveAnimations() {
        // Count active CSS animations and transitions (optimized)
        let count = 0;
        
        // Only check elements that are likely to have animations
        const animatedSelectors = [
            '[class*="animate"]',
            '[class*="transition"]',
            '[style*="animation"]',
            '[style*="transition"]',
            '.loading',
            '.fade',
            '.slide',
            '.bounce'
        ];
        
        try {
            animatedSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const computedStyle = window.getComputedStyle(element);
                    
                    if (computedStyle.animationName !== 'none' && computedStyle.animationName !== '') {
                        count++;
                    }
                    
                    if (computedStyle.transitionProperty !== 'none' && computedStyle.transitionProperty !== 'all') {
                        count++;
                    }
                });
            });
            
            // If count is still extremely high, there's likely a CSS issue
            if (count > 100) {
                console.warn(`⚠️ Excessive animations detected (${count}). Check CSS for performance issues.`);
                this.identifyAnimationCulprits();
            }
        } catch (error) {
            console.error('Error counting animations:', error);
            count = 0;
        }
        
        this.metrics.activeAnimations = count;
    }

    identifyAnimationCulprits() {
        // Identify what's causing excessive animations
        const problematicClasses = [];
        
        // Check for common animation-heavy patterns
        const heavySelectors = [
            '*[class*="transition"]',
            '*[style*="transition"]',
            '.has-distribution-sliders *',
            '.distribution-slider-container *'
        ];
        
        heavySelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 50) {
                    problematicClasses.push(`${selector}: ${elements.length} elements`);
                }
            } catch (error) {
                // Ignore invalid selectors
            }
        });
        
        if (problematicClasses.length > 0) {
            console.warn('🎭 Animation performance culprits:', problematicClasses);
        }
    }

    recordChartRender() {
        this.metrics.chartRenders++;
    }

    recordSliderUpdate() {
        this.metrics.sliderUpdates++;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getFormattedMetrics() {
        const metrics = this.getMetrics();
        
        return {
            'Page Load Time': `${metrics.pageLoad.toFixed(0)}ms`,
            'First Paint': `${metrics.firstPaint.toFixed(0)}ms`,
            'First Contentful Paint': `${metrics.firstContentfulPaint.toFixed(0)}ms`,
            'DOM Content Loaded': `${metrics.domContentLoaded.toFixed(0)}ms`,
            'JS Heap Used': `${(metrics.jsHeapUsed / 1024 / 1024).toFixed(1)}MB`,
            'JS Heap Total': `${(metrics.jsHeapTotal / 1024 / 1024).toFixed(1)}MB`,
            'Active Timers': metrics.activeTimers,
            'Active Animations': metrics.activeAnimations,
            'Chart Renders': metrics.chartRenders,
            'Slider Updates': metrics.sliderUpdates,
            'Uptime': `${((performance.now() - this.startTime) / 1000).toFixed(1)}s`
        };
    }

    displayMetrics() {
        const metrics = this.getFormattedMetrics();
        
        console.group('📊 Performance Metrics');
        Object.entries(metrics).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });
        console.groupEnd();
        
        return metrics;
    }

    createMetricsDisplay() {
        // Create a small performance display in the corner
        const display = document.createElement('div');
        display.id = 'performance-metrics';
        display.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 11px;
            z-index: 10000;
            max-width: 200px;
            display: none;
        `;
        
        document.body.appendChild(display);
        
        // Toggle display with Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                display.style.display = display.style.display === 'none' ? 'block' : 'none';
                if (display.style.display === 'block') {
                    this.updateMetricsDisplay();
                }
            }
        });
        
        return display;
    }

    updateMetricsDisplay() {
        const display = document.getElementById('performance-metrics');
        if (!display || display.style.display === 'none') return;
        
        const metrics = this.getFormattedMetrics();
        const html = Object.entries(metrics)
            .map(([key, value]) => `<div>${key}: ${value}</div>`)
            .join('');
        
        display.innerHTML = html;
    }

    generatePerformanceReport() {
        const metrics = this.getMetrics();
        const report = {
            timestamp: new Date().toISOString(),
            metrics,
            recommendations: this.generateRecommendations(metrics),
            score: this.calculatePerformanceScore(metrics)
        };
        
        return report;
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.pageLoad > 3000) {
            recommendations.push('Page load time is slow. Consider optimizing asset loading.');
        }
        
        if (metrics.firstContentfulPaint > 1500) {
            recommendations.push('First Contentful Paint is slow. Optimize critical rendering path.');
        }
        
        if (metrics.jsHeapUsed > 50 * 1024 * 1024) { // 50MB
            recommendations.push('High memory usage detected. Check for memory leaks.');
        }
        
        if (metrics.activeTimers > 3) {
            recommendations.push('Many active timers detected. Consider consolidating or optimizing.');
        }
        
        if (metrics.activeAnimations > 10) {
            recommendations.push('Many active animations. Consider reducing for better performance.');
        }
        
        if (metrics.chartRenders > 100) {
            recommendations.push('High chart render count. Consider debouncing chart updates.');
        }
        
        return recommendations;
    }

    calculatePerformanceScore(metrics) {
        let score = 100;
        
        // Deduct points for slow metrics
        if (metrics.pageLoad > 2000) score -= 20;
        if (metrics.firstContentfulPaint > 1000) score -= 15;
        if (metrics.jsHeapUsed > 30 * 1024 * 1024) score -= 15;
        if (metrics.activeTimers > 2) score -= 10;
        if (metrics.activeAnimations > 5) score -= 10;
        
        return Math.max(0, score);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Clear interval
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        
        // Disconnect observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
        
        console.log('📊 Performance monitoring stopped');
    }

    exportReport() {
        const report = this.generatePerformanceReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Global instance
window.performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceMonitor.startMonitoring();
        window.performanceMonitor.createMetricsDisplay();
    });
} else {
    window.performanceMonitor.startMonitoring();
    window.performanceMonitor.createMetricsDisplay();
} 