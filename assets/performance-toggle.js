/**
 * Performance Mode Script (Forced Performance Mode Only)
 * Forces performance mode permanently - no toggle available
 */

class PerformanceMode {
    constructor() {
        this.isPerformanceMode = true; // Always performance mode
        this.init();
    }

    init() {
        // No toggle button - performance mode is forced
        // this.createToggleButton(); 
        // this.setupKeyboardShortcut();
        this.detectPerformanceIssues();
        
        // Enable performance mode immediately on startup
        this.enablePerformanceMode();
        
        console.log('🚀 Performance Mode is permanently enabled for optimal experience');
    }

    detectPerformanceIssues() {
        // Performance monitoring disabled since performance mode is always enabled
        // No warnings needed - performance mode is forced for optimal experience
    }

    showPerformanceWarning() {
        const warning = document.createElement('div');
        warning.id = 'performance-warning';
        warning.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #fbbf24;
            color: #92400e;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #f59e0b;
        `;
        
        warning.innerHTML = `
            <strong>⚠️ Performance Issue Detected</strong><br>
            High animation count detected. Performance Mode is already enabled for optimal experience.
            <br><br>
            <button onclick="this.parentElement.remove()" 
                    style="background: #92400e; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                Dismiss
            </button>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }

    // showToggleButton() method removed - no toggle in performance-only mode

    enablePerformanceMode() {
        if (this.isPerformanceMode) {
            const body = document.body;
            body.classList.add('performance-mode');
            
            // Disable Chart.js animations
            this.disableChartAnimations();
            
            // Stop unnecessary timers
            this.optimizeTimers();
            
            console.log('🚀 Performance Mode enabled on startup');
        }
    }

    // No toggle functionality - performance mode is permanently enabled
    // togglePerformanceMode() method removed

    disableChartAnimations() {
        // Disable Chart.js animations if charts exist
        if (window.Chart && window.Chart.defaults) {
            window.Chart.defaults.animation = false;
            window.Chart.defaults.animations = {
                colors: false,
                x: false,
                y: false
            };
            window.Chart.defaults.responsive = false;
            window.Chart.defaults.maintainAspectRatio = false;
        }
        
        // Update existing charts
        if (window.chartPerformanceManager) {
            window.chartPerformanceManager.charts.forEach(chart => {
                chart.options.animation = false;
                chart.options.animations = false;
                chart.update('none');
            });
        }
    }

    optimizeTimers() {
        // Reduce update frequency for performance mode
        if (window.performanceOptimizer && this.isPerformanceMode) {
            window.performanceOptimizer.updateInterval = 2000; // Update every 2 seconds instead of 1
        } else if (window.performanceOptimizer) {
            window.performanceOptimizer.updateInterval = 1000; // Back to 1 second
        }
    }

    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10002;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        notification.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    getPerformanceReport() {
        const metrics = window.performanceMonitor?.getMetrics() || {};
        
        return {
            performanceMode: this.isPerformanceMode,
            metrics,
            recommendations: this.generateRecommendations(metrics),
            timestamp: new Date().toISOString()
        };
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.activeAnimations > 50) {
            recommendations.push('High animation count detected. Enable Performance Mode to disable non-essential animations.');
        }
        
        if (metrics.jsHeapUsed > 40 * 1024 * 1024) {
            recommendations.push('High memory usage. Consider refreshing the page or enabling Performance Mode.');
        }
        
        if (metrics.pageLoad > 2000) {
            recommendations.push('Slow page load detected. Check network connection and consider Performance Mode.');
        }
        
        if (metrics.activeTimers > 3) {
            recommendations.push('Multiple active timers detected. Performance Mode can help optimize timer usage.');
        }
        
        return recommendations;
    }
}

// Initialize performance mode (forced)
window.performanceMode = new PerformanceMode();

// Performance mode is always enabled - no toggle functions needed
console.log('🚀 Performance Mode permanently enabled. No toggle available for optimal stability.'); 