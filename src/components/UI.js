// src/components/UI.js - UI Controller for Social Media Calculator

import { Calculator } from './Calculator.js';
import { DistributionChart } from './DistributionChart.js';
import { ChartManager } from './ChartManager.js';
import { CalculatorUtils } from '../utils/formatting.js';

/**
 * UI Controller - Manages all DOM interactions and updates
 * Separates presentation from business logic for better maintainability
 */
export class UIController {
    constructor() {
        this.calculator = new Calculator();
        this.distributionCharts = new Map();
        this.chartManager = null;
        this.sliders = new Map();
        this.isInitialized = false;
        
        // Bind calculator events
        this.calculator.on('parameterChanged', this.handleParameterChange.bind(this));
        this.calculator.on('significantChange', this.handleSignificantChange.bind(this));
        this.calculator.on('scenarioApplied', this.handleScenarioApplied.bind(this));
        
        console.log('✅ UI Controller initialized');
    }
    
    /**
     * Initialize the UI system - sets up all DOM interactions
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🎯 Initializing UI Controller...');
        
        try {
            // Initialize core components
            await this.initializeSliders();
            await this.initializeCharts();
            await this.initializeScenarioButtons();
            await this.initializeInfoButtons();
            await this.initializeDistributionCharts();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial calculation and display update
            this.updateAllDisplays();
            
            this.isInitialized = true;
            console.log('✅ UI Controller fully initialized');
            
        } catch (error) {
            console.error('❌ UI Controller initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Initialize parameter sliders with noUiSlider or fallback
     */
    async initializeSliders() {
        const sliderConfigs = {
            'vsl': { range: { min: 7.2, max: 14.0 }, start: 13.7, step: 0.1 },
            'suicides': { range: { min: 89000, max: 300000 }, start: 110000, step: 1000 },
            'attribution': { range: { min: 5, max: 30 }, start: 18, step: 1 },
            'depression': { range: { min: 3000000, max: 15000000 }, start: 5000000, step: 100000 },
            'yld': { range: { min: 4.8, max: 8.2 }, start: 6.0, step: 0.1 },
            'qol': { range: { min: 31, max: 47 }, start: 35, step: 1 },
            'healthcare': { range: { min: 6500, max: 20000 }, start: 7000, step: 100 },
            'productivity': { range: { min: 4800, max: 10000 }, start: 6000, step: 100 },
            'duration': { range: { min: 3.0, max: 8.5 }, start: 4.5, step: 0.1 }
        };
        
        for (const [param, config] of Object.entries(sliderConfigs)) {
            await this.createSlider(param, config);
        }
        
        console.log('✅ All sliders initialized');
    }
    
    /**
     * Create individual slider with proper theming
     */
    async createSlider(paramName, config) {
        const container = document.getElementById(`${paramName}-nouislider`);
        if (!container) {
            console.warn(`Slider container for ${paramName} not found`);
            return;
        }
        
        // Check if noUiSlider is available
        if (typeof noUiSlider !== 'undefined') {
            try {
                noUiSlider.create(container, {
                    range: config.range,
                    start: config.start,
                    step: config.step,
                    connect: 'lower',
                    tooltips: {
                        to: (value) => this.calculator.getFormattedParameter(paramName),
                        from: (value) => Number(value)
                    }
                });
                
                // Store reference and add event listeners
                this.sliders.set(paramName, container.noUiSlider);
                
                container.noUiSlider.on('update', (values, handle) => {
                    const value = parseFloat(values[handle]);
                    this.calculator.updateParameter(paramName, value);
                    this.updateParameterDisplay(paramName, value);
                });
                
                container.noUiSlider.on('change', () => {
                    this.updateAllDisplays();
                });
                
            } catch (error) {
                console.warn(`Failed to create noUiSlider for ${paramName}, using fallback`);
                this.createFallbackSlider(paramName, config, container);
            }
        } else {
            this.createFallbackSlider(paramName, config, container);
        }
    }
    
    /**
     * Create fallback HTML slider if noUiSlider fails
     */
    createFallbackSlider(paramName, config, container) {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `${paramName}-slider`;
        slider.min = config.range.min;
        slider.max = config.range.max;
        slider.step = config.step;
        slider.value = config.start;
        slider.className = 'slider fallback-slider w-full';
        
        container.appendChild(slider);
        
        slider.addEventListener('input', () => {
            const value = parseFloat(slider.value);
            this.calculator.updateParameter(paramName, value);
            this.updateParameterDisplay(paramName, value);
        });
        
        slider.addEventListener('change', () => {
            this.updateAllDisplays();
        });
        
        console.log(`✅ Created fallback slider for ${paramName}`);
    }
    
    /**
     * Initialize chart management system
     */
    async initializeCharts() {
        this.chartManager = new ChartManager();
        await this.chartManager.initialize();
        console.log('✅ Chart manager initialized');
    }
    
    /**
     * Initialize scenario buttons
     */
    async initializeScenarioButtons() {
        const scenarioButtons = document.querySelectorAll('.scenario-btn');
        
        scenarioButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const scenario = e.target.dataset.scenario;
                this.applyScenario(scenario);
                
                // Visual feedback
                this.highlightActiveScenario(button);
            });
        });
        
        console.log('✅ Scenario buttons initialized');
    }
    
    /**
     * Initialize info buttons with tooltips
     */
    async initializeInfoButtons() {
        const infoButtons = document.querySelectorAll('.info-button');
        
        // Check if Tippy.js is available
        if (typeof tippy !== 'undefined') {
            infoButtons.forEach(button => {
                const tooltipId = button.dataset.tooltip;
                if (tooltipId) {
                    this.createResearchTooltip(button, tooltipId);
                }
            });
        } else {
            // Fallback to simple click handlers
            infoButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.showSimpleTooltip(button);
                });
            });
        }
        
        console.log('✅ Info buttons initialized');
    }
    
    /**
     * Initialize distribution charts for uncertainty visualization
     */
    async initializeDistributionCharts() {
        const parameters = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
        
        for (const param of parameters) {
            const container = document.getElementById(`${param}-distribution`);
            if (container) {
                const chart = new DistributionChart(container, param);
                await chart.initialize(this.calculator.parameters[param]);
                this.distributionCharts.set(param, chart);
            }
        }
        
        console.log('✅ Distribution charts initialized');
    }
    
    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.toggleHelpModal());
        }
        
        // Community calculator
        const communityBtn = document.getElementById('calculate-community-btn');
        if (communityBtn) {
            communityBtn.addEventListener('click', () => this.calculateCommunityImpact());
        }
        
        // Share buttons
        const shareButtons = document.querySelectorAll('[id^="share-"]');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.id.replace('share-', '');
                this.shareResults(platform);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.applyScenario('reset');
            }
        });
        
        console.log('✅ Event listeners set up');
    }
    
    /**
     * Handle parameter change from calculator
     */
    handleParameterChange(event) {
        const { parameter, newValue } = event;
        this.updateParameterDisplay(parameter, newValue);
        
        // Update distribution chart
        const chart = this.distributionCharts.get(parameter);
        if (chart) {
            chart.updateCurrentValue(newValue);
        }
    }
    
    /**
     * Handle significant parameter changes
     */
    handleSignificantChange(event) {
        console.log('🔄 Significant change detected:', event);
        this.updateAllDisplays();
        this.updateAllDistributionCharts();
    }
    
    /**
     * Handle scenario application
     */
    handleScenarioApplied(event) {
        const { scenarioName, newParameters } = event;
        
        // Update all sliders to new values
        Object.entries(newParameters).forEach(([param, value]) => {
            const slider = this.sliders.get(param);
            if (slider) {
                slider.set(value);
            }
            this.updateParameterDisplay(param, value);
        });
        
        this.updateAllDisplays();
        this.updateAllDistributionCharts();
        
        console.log(`✅ UI updated for scenario: ${scenarioName}`);
    }
    
    /**
     * Update individual parameter display
     */
    updateParameterDisplay(paramName, value) {
        const display = document.getElementById(`${paramName}-value`);
        if (display) {
            display.textContent = this.calculator.getFormattedParameter(paramName);
        }
    }
    
    /**
     * Update all displays with current calculation results
     */
    updateAllDisplays() {
        const results = this.calculator.calculateTotalEconomicImpact();
        
        // Update main totals
        this.updateElementText('total-cost', CalculatorUtils.formatLargeNumber(results.total));
        this.updateElementText('total-amount', Math.round(results.total).toLocaleString());
        this.updateElementText('hero-total-cost', CalculatorUtils.formatLargeNumber(results.total));
        
        // Update GDP percentage
        const gdpPercentage = CalculatorUtils.calculateGDPPercentage(results.total);
        this.updateElementText('gdp-percentage', `${gdpPercentage}%`);
        
        // Update formula displays
        this.updateFormulaDisplays(results);
        
        // Update charts
        if (this.chartManager) {
            this.chartManager.updateCharts(results);
        }
        
        console.log('✅ All displays updated');
    }
    
    /**
     * Update formula displays with current parameters
     */
    updateFormulaDisplays(results) {
        const params = this.calculator.parameters;
        
        // Mortality formula
        const mortalityFormula = `${Math.round(params.suicides/1000)}K × ${params.attribution}% × $${params.vsl}M = ${CalculatorUtils.formatLargeNumber(results.mortality)}`;
        this.updateElementText('mortality-result', mortalityFormula);
        
        // Mental health formula
        const mentalFormula = `${(params.depression/1000000).toFixed(1)}M × ${params.yld} × ${params.qol}% × $${Math.round(params.vsl * 1000000 / 75 / 1000)}K = ${CalculatorUtils.formatLargeNumber(results.mental)}`;
        this.updateElementText('mental-result', mentalFormula);
        
        // Productivity formula
        const productivityFormula = `${(params.depression/1000000).toFixed(1)}M × ($${Math.round(params.healthcare/1000)}K + $${Math.round(params.productivity/1000)}K) × ${params.duration} = ${CalculatorUtils.formatLargeNumber(results.productivity)}`;
        this.updateElementText('healthcare-result', productivityFormula);
    }
    
    /**
     * Apply scenario with UI feedback
     */
    applyScenario(scenarioName) {
        this.calculator.applyScenario(scenarioName);
        
        // Add loading animation
        this.addLoadingState();
        
        setTimeout(() => {
            this.removeLoadingState();
        }, 300);
    }
    
    /**
     * Update all distribution charts
     */
    updateAllDistributionCharts() {
        this.distributionCharts.forEach((chart, paramName) => {
            const currentValue = this.calculator.parameters[paramName];
            chart.updateCurrentValue(currentValue);
        });
    }
    
    /**
     * Utility function to safely update element text
     */
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Element ${elementId} not found`);
        }
    }
    
    /**
     * Add loading state to UI
     */
    addLoadingState() {
        document.body.classList.add('updating');
    }
    
    /**
     * Remove loading state from UI
     */
    removeLoadingState() {
        document.body.classList.remove('updating');
    }
    
    /**
     * Create research tooltip for info buttons
     */
    createResearchTooltip(button, tooltipId) {
        // Implementation would go here
        console.log(`Creating tooltip for ${tooltipId}`);
    }
    
    /**
     * Show simple tooltip fallback
     */
    showSimpleTooltip(button) {
        alert('Research information available - check methodology section');
    }
    
    /**
     * Toggle help modal
     */
    toggleHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.toggle('show');
        }
    }
    
    /**
     * Calculate community impact
     */
    calculateCommunityImpact() {
        // Implementation would go here
        console.log('Calculating community impact...');
    }
    
    /**
     * Share results on social media
     */
    shareResults(platform) {
        const results = this.calculator.calculateTotalEconomicImpact();
        const totalCost = CalculatorUtils.formatLargeNumber(results.total);
        
        const message = `Social media's hidden cost to society: ${totalCost}. Calculate your community's impact: https://suffering.social`;
        
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://suffering.social')}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://suffering.social')}`
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    }
    
    /**
     * Highlight active scenario button
     */
    highlightActiveScenario(activeButton) {
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.style.opacity = '0.7';
        });
        activeButton.style.opacity = '1';
        
        setTimeout(() => {
            document.querySelectorAll('.scenario-btn').forEach(btn => {
                btn.style.opacity = '1';
            });
        }, 1000);
    }
    
    /**
     * Get current UI state for debugging
     */
    getUIState() {
        return {
            calculator: this.calculator.getState(),
            slidersCount: this.sliders.size,
            chartsCount: this.distributionCharts.size,
            isInitialized: this.isInitialized
        };
    }
} 