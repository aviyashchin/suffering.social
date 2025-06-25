// src/main.js - Main Application Entry Point

import { UIController } from './components/UI.js';
import { Calculator } from './components/Calculator.js';
import { CalculatorUtils } from './utils/formatters.js';
import { FEATURES, DEFAULTS } from './utils/constants.js';

/**
 * Main Application Class - Orchestrates the entire calculator system
 * Entry point for the Social Media Cost Calculator
 */
class SocialMediaCalculatorApp {
    constructor() {
        this.ui = null;
        this.calculator = null;
        this.isInitialized = false;
        this.startTime = Date.now();
        
        console.log('🚀 Social Media Calculator App starting...');
    }
    
    /**
     * Initialize the entire application
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('App already initialized');
            return;
        }
        
        try {
            console.log('⚙️ Initializing app components...');
            
            // Initialize UI Controller
            this.ui = new UIController();
            await this.ui.initialize();
            
            // Get calculator reference from UI
            this.calculator = this.ui.calculator;
            
            // Set up global app event listeners
            this.setupGlobalEventListeners();
            
            // Start real-time counter if enabled
            if (FEATURES.enableRealTimeData) {
                this.startRealTimeCounter();
            }
            
            // Initialize accessibility features
            this.initializeAccessibility();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Social Media Calculator App fully initialized');
            
            // Log performance metrics
            this.logPerformanceMetrics();
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * Set up global application event listeners
     */
    setupGlobalEventListeners() {
        // Handle window resize for responsive updates
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle visibility changes (tab switching)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Handle unload for cleanup
        window.addEventListener('beforeunload', this.handleUnload.bind(this));
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        
        // Performance monitoring
        if (FEATURES.enablePerformanceMode) {
            this.setupPerformanceMonitoring();
        }
        
        console.log('✅ Global event listeners set up');
    }
    
    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        // Add skip link for keyboard navigation
        this.addSkipNavigation();
        
        // Set up focus management
        this.setupFocusManagement();
        
        // Initialize screen reader announcements
        this.setupScreenReaderAnnouncements();
        
        console.log('✅ Accessibility features initialized');
    }
    
    /**
     * Add skip navigation for keyboard users
     */
    addSkipNavigation() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-calculator';
        skipLink.textContent = 'Skip to main calculator';
        skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    /**
     * Set up focus management for better keyboard navigation
     */
    setupFocusManagement() {
        // Add visible focus indicators
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            button:focus-visible,
            input:focus-visible,
            [tabindex]:focus-visible {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
        
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }
    
    /**
     * Set up screen reader announcements
     */
    setupScreenReaderAnnouncements() {
        // Create announcement region
        const announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        
        // Listen for calculation updates
        if (this.calculator) {
            this.calculator.on('significantChange', (event) => {
                const results = this.calculator.calculateTotalEconomicImpact();
                const announcement = `Total cost updated to ${CalculatorUtils.formatLargeNumber(results.total)} trillion dollars`;
                this.announceToScreenReader(announcement);
            });
        }
    }
    
    /**
     * Announce text to screen readers
     */
    announceToScreenReader(text) {
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            announcer.textContent = text;
            
            // Clear after a delay to avoid repetition
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Update charts if they exist
            if (this.ui && this.ui.chartManager) {
                this.ui.chartManager.handleResize();
            }
            
            // Update responsive classes
            this.updateResponsiveClasses();
            
        }, 100);
    }
    
    /**
     * Handle visibility change events (tab switching)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations and updates when tab is hidden
            this.pauseRealTimeUpdates();
        } else {
            // Resume when tab becomes visible
            this.resumeRealTimeUpdates();
        }
    }
    
    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(event) {
        // Help modal
        if (event.key === '?' && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            this.ui?.toggleHelpModal();
        }
        
        // Reset calculator
        if (event.key === 'r' && event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            this.calculator?.reset();
            this.ui?.updateAllDisplays();
        }
        
        // Escape key to close modals
        if (event.key === 'Escape') {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                modal.classList.remove('show');
            }
        }
    }
    
    /**
     * Start real-time cost counter
     */
    startRealTimeCounter() {
        if (this.counterInterval) return;
        
        this.counterInterval = setInterval(() => {
            const elapsedSeconds = (Date.now() - this.startTime) / 1000;
            const runningCost = this.calculator.calculateRunningCost(elapsedSeconds);
            
            // Update running counter display
            const counterElement = document.getElementById('running-counter');
            if (counterElement && runningCost > 0) {
                counterElement.textContent = CalculatorUtils.formatCurrency(runningCost);
            }
        }, 1000);
        
        console.log('✅ Real-time counter started');
    }
    
    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor calculation performance
        let calculationCount = 0;
        let totalCalculationTime = 0;
        
        const originalCalculate = this.calculator.calculateTotalEconomicImpact.bind(this.calculator);
        this.calculator.calculateTotalEconomicImpact = function(...args) {
            const start = performance.now();
            const result = originalCalculate(...args);
            const end = performance.now();
            
            calculationCount++;
            totalCalculationTime += (end - start);
            
            // Log performance warning if calculations are slow
            if (end - start > 10) {
                console.warn(`Slow calculation detected: ${(end - start).toFixed(2)}ms`);
            }
            
            return result;
        };
        
        // Log performance summary every 50 calculations
        setInterval(() => {
            if (calculationCount > 0 && calculationCount % 50 === 0) {
                const avgTime = totalCalculationTime / calculationCount;
                console.log(`Performance: ${calculationCount} calculations, avg ${avgTime.toFixed(2)}ms`);
            }
        }, 5000);
    }
    
    /**
     * Update responsive classes based on screen size
     */
    updateResponsiveClasses() {
        const width = window.innerWidth;
        const body = document.body;
        
        // Remove existing responsive classes
        body.classList.remove('mobile', 'tablet', 'desktop');
        
        // Add appropriate class
        if (width < 768) {
            body.classList.add('mobile');
        } else if (width < 1024) {
            body.classList.add('tablet');
        } else {
            body.classList.add('desktop');
        }
    }
    
    /**
     * Pause real-time updates
     */
    pauseRealTimeUpdates() {
        if (this.counterInterval) {
            clearInterval(this.counterInterval);
            this.counterInterval = null;
        }
    }
    
    /**
     * Resume real-time updates
     */
    resumeRealTimeUpdates() {
        if (FEATURES.enableRealTimeData && !this.counterInterval) {
            this.startRealTimeCounter();
        }
    }
    
    /**
     * Trap focus within a modal
     */
    trapFocus(event, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
    }
    
    /**
     * Handle cleanup on unload
     */
    handleUnload() {
        if (this.counterInterval) {
            clearInterval(this.counterInterval);
        }
        
        console.log('🧹 App cleanup completed');
    }
    
    /**
     * Handle initialization errors gracefully
     */
    handleInitializationError(error) {
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
        errorMessage.innerHTML = `
            <strong>Calculator Loading Error:</strong> 
            Please refresh the page. If the problem persists, check your browser compatibility.
            <button onclick="this.parentElement.remove()" class="float-right font-bold">×</button>
        `;
        
        document.body.appendChild(errorMessage);
        
        // Try to initialize fallback mode
        this.initializeFallbackMode();
    }
    
    /**
     * Initialize basic fallback mode if main initialization fails
     */
    initializeFallbackMode() {
        console.log('🔄 Attempting fallback initialization...');
        
        try {
            // Create basic calculator without advanced features
            this.calculator = new Calculator();
            
            // Set up basic event listeners
            const form = document.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.calculator.calculateAll();
                });
            }
            
            console.log('✅ Fallback mode initialized');
            
        } catch (fallbackError) {
            console.error('❌ Fallback initialization also failed:', fallbackError);
        }
    }
    
    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        const initTime = Date.now() - this.startTime;
        
        console.log(`📊 Performance Metrics:
        - Initialization time: ${initTime}ms
        - Components loaded: ${this.ui ? 'UI' : 'None'}, ${this.calculator ? 'Calculator' : 'None'}
        - Features enabled: ${Object.entries(FEATURES).filter(([k,v]) => v).map(([k]) => k).join(', ')}
        - Memory usage: ${Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024) || 'N/A'}MB`);
    }
    
    /**
     * Get app state for debugging
     */
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            startTime: this.startTime,
            uptime: Date.now() - this.startTime,
            ui: this.ui ? this.ui.getUIState() : null,
            calculator: this.calculator ? this.calculator.getState() : null,
            performance: {
                memory: performance.memory?.usedJSHeapSize || 0,
                timing: performance.timing
            }
        };
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Make app available globally for debugging
    window.socialMediaApp = new SocialMediaCalculatorApp();
    
    try {
        await window.socialMediaApp.initialize();
        console.log('🎉 Social Media Calculator ready!');
    } catch (error) {
        console.error('Failed to initialize Social Media Calculator:', error);
    }
});

// Export for ES6 module systems
export { SocialMediaCalculatorApp }; 