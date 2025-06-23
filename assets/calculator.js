(function() {
    'use strict';

    /**
     * Central state object for all calculator parameters and results.
     * This holds the default values.
     */
    const initialState = {
        vsl: 13.7,
        suicides: 110000,
        attribution: 18,
        depression: 4000000,
        yld: 6,
        qol: 35,
        healthcare: 7000,
        productivity: 6000,
        duration: 4.5,
    };

    /**
     * Manages live ticking counters that update based on calculated rates
     */
    const LifetimeCounter = {
        startDate: new Date('2009-01-01'),
        sessionStartDate: new Date(),
        interval: null,
        
        // Current rates (updated when sliders change)
        depressionPerSecond: 0,
        suicidePerSecond: 0,
        totalCostPerSecond: 0,
        sessionCostPerSecond: 0,

        init() {
            this.sessionStartDate = new Date();
            this.startTicking();
        },

        updateRates(state) {
            // Calculate total seconds since 2009
            const totalSeconds = (new Date() - this.startDate) / 1000;
            
            // Update rates based on current calculator state
            this.depressionPerSecond = state.depression / totalSeconds;
            this.suicidePerSecond = state.suicides / totalSeconds;
            this.totalCostPerSecond = state.results.totalCost / totalSeconds;
            
            // Session cost should show CURRENT annual impact, not historical average
            // This represents: "At current settings, we're generating this much cost per year"
            this.sessionCostPerSecond = state.results.totalCost / (365 * 24 * 60 * 60);
        },

        startTicking() {
            if (this.interval) clearInterval(this.interval);
            
            this.interval = setInterval(() => {
                const now = new Date();
                const elapsedSeconds = (now - this.startDate) / 1000;
                const sessionElapsedSeconds = (now - this.sessionStartDate) / 1000;
                
                // Calculate current values based on rates
                const currentDepression = this.depressionPerSecond * elapsedSeconds;
                const currentSuicide = this.suicidePerSecond * elapsedSeconds;
                const currentTotalCost = this.totalCostPerSecond * elapsedSeconds;
                const sessionCost = this.sessionCostPerSecond * sessionElapsedSeconds;
                
                // Update displays
                const depressionEl = document.getElementById('lifetime-depression');
                const suicideEl = document.getElementById('lifetime-suicide');
                const nationalDebtEl = document.getElementById('national-debt-clock-total-amount');
                const sessionCostEl = document.getElementById('running-total-amount');
                
                if (depressionEl) {
                    // Format with commas and appropriate decimal places
                    const formatted = currentDepression >= 1000000 ? 
                        Math.floor(currentDepression).toLocaleString() : 
                        currentDepression.toFixed(2);
                    depressionEl.textContent = formatted;
                }
                if (suicideEl) {
                    // Format with commas and appropriate decimal places
                    const formatted = currentSuicide >= 1000 ? 
                        Math.floor(currentSuicide).toLocaleString() : 
                        currentSuicide.toFixed(2);
                    suicideEl.textContent = formatted;
                }
                if (nationalDebtEl) {
                    nationalDebtEl.textContent = Math.floor(currentTotalCost).toLocaleString();
                }
                if (sessionCostEl) {
                    sessionCostEl.textContent = Math.floor(sessionCost).toLocaleString();
                }
            }, 100); // Update every 100ms for smooth animation
        },

        stop() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    };

    /**
     * Pure functions for all cost calculations.
     */
    const Calculator = {
        mortalityCost: (s) => (s.suicides * (s.attribution / 100)) * (s.vsl * 1e6),
        mentalHealthCost: (s) => (s.depression * s.yld * (s.qol / 100)) * ((s.vsl * 1e6) / 75),
        healthcareProductivityCost: (s) => (s.depression * (s.healthcare + s.productivity) * s.duration),
        totalCost: (mortality, mental, healthcare) => mortality + mental + healthcare,
        gdpPercentage: (total, gdp = 24e12) => (total / gdp) * 100,
    };

    /**
     * Manages all DOM interactions, including sliders, buttons, charts, and display updates.
     */
    class UIManager {
        constructor() {
            this.elements = {
                totalCost: document.getElementById('total-cost'),
                gdpPercentage: document.getElementById('gdp-percentage'),
                finalEquation: document.getElementById('final-equation'),
                mortalityFormula: document.getElementById('mortality-display-formula'),
                mentalHealthFormula: document.getElementById('mental-display-formula'),
                healthcareFormula: document.getElementById('healthcare-display-formula'),
                pieChart: document.getElementById('pieChart'),
                timelineChart: document.getElementById('timelineChart'),
                resetButton: document.getElementById('reset-button'),
                shareButton: document.getElementById('share-button'),
                causalPopoutBtn: document.getElementById('causal-popout-btn'),
                causalModal: document.getElementById('causal-modal'),
                causalModalClose: document.getElementById('causal-modal-close'),
            };
            this.charts = {};
            this.sliderIds = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
        }

        init(costCalculator) {
            this._initSliders(costCalculator);
            this._initButtons();
            this._initCharts();
            
            // Add a small delay to ensure all external libraries are loaded
            setTimeout(() => {
                this._initTooltips();
            }, 100);
            
            // Add a small delay to ensure charts are fully initialized before updating with data
            setTimeout(() => {
                // Update with initial state to populate charts and displays
                this.update(costCalculator.getState());
            }, 200);
            
            // Initialize the lifetime counter (will be updated with correct rates by the update call above)
            LifetimeCounter.init();
        }

        _initSliders(costCalculator) {
            this.sliderIds.forEach(id => {
                const slider = document.getElementById(`${id}-slider`);
                if (slider) {
                    slider.addEventListener('input', () => {
                        const value = parseFloat(slider.value);
                        costCalculator.updateState(id, value);
                    });
                }
            });
        }

        _initButtons() {
            if (this.elements.resetButton) {
                this.elements.resetButton.addEventListener('click', () => window.location.reload());
            }
            if (this.elements.shareButton) {
                this.elements.shareButton.addEventListener('click', () => {
                    const totalCost = this.elements.totalCost.textContent;
                    const text = `Social media's hidden cost to society is over ${totalCost} per year. This calculator shows how:`;
                    const url = window.location.href;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    window.open(twitterUrl, '_blank');
                });
            }
            if (this.elements.causalPopoutBtn) {
                this.elements.causalPopoutBtn.addEventListener('click', () => this.elements.causalModal.classList.remove('hidden'));
            }
            if (this.elements.causalModalClose) {
                this.elements.causalModalClose.addEventListener('click', () => this.elements.causalModal.classList.add('hidden'));
            }
            
            // Initialize help button functionality
            const helpBtn = document.getElementById('help-btn');
            const helpPopover = document.getElementById('help-popover');
            const helpPopoverClose = document.getElementById('help-popover-close');
            
            if (helpBtn && helpPopover) {
                helpBtn.addEventListener('click', () => {
                    helpPopover.classList.toggle('hidden');
                });
            }
            
            if (helpPopoverClose && helpPopover) {
                helpPopoverClose.addEventListener('click', () => {
                    helpPopover.classList.add('hidden');
                });
            }
            
            // Close help popover when clicking outside
            document.addEventListener('click', (e) => {
                if (helpPopover && !helpPopover.classList.contains('hidden')) {
                    if (!helpBtn.contains(e.target) && !helpPopover.contains(e.target)) {
                        helpPopover.classList.add('hidden');
                    }
                }
            });
        }

        _initCharts() {
            // Initialize pie chart
            if (this.elements.pieChart) {
                this.charts.pie = new Chart(this.elements.pieChart, {
                    type: 'doughnut',
                    data: {
                        labels: ['☠️ Death', '😞 Disability', '💸 Lost Productivity'],
                        datasets: [{
                            data: [0, 0, 0], // Initial data
                            backgroundColor: ['#dc2626', '#7c3aed', '#ea580c'],
                            borderColor: ['#b91c1c', '#6d28d9', '#c2410c'],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: '#333', font: { size: 14, family: "'Inter', sans-serif" }}},
                            tooltip: { callbacks: { label: (c) => ` ${c.label}: ${this._formatCurrency(c.raw)}` }}
                        }
                    }
                });
            }

            // Initialize timeline chart
            const timelineChartEl = document.getElementById('timelineChart');
            if (timelineChartEl) {
                this.charts.timeline = new Chart(timelineChartEl, {
                    type: 'line',
                    data: {
                        labels: ['2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                        datasets: [{
                            label: '☠️ Death',
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            borderColor: '#dc2626',
                            backgroundColor: 'rgba(220, 38, 38, 0.1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4
                        }, {
                            label: '😞 Disability',
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            borderColor: '#7c3aed',
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4
                        }, {
                            label: '💸 Lost Productivity',
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            borderColor: '#ea580c',
                            backgroundColor: 'rgba(234, 88, 12, 0.1)',
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4
                        }, {
                            label: 'Total Cost',
                            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            borderColor: '#1f2937',
                            backgroundColor: 'rgba(31, 41, 55, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            borderDash: [5, 5] // Dashed line for total
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { 
                                display: true,
                                position: 'bottom',
                                labels: { 
                                    color: '#333', 
                                    font: { size: 12, family: "'Inter', sans-serif" },
                                    usePointStyle: true,
                                    padding: 15
                                }
                            },
                            tooltip: { 
                                callbacks: { 
                                    label: (c) => `${c.dataset.label}: ${this._formatCurrency(c.raw)}`,
                                    title: (items) => `Year ${items[0].label}`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: (value) => this._formatCurrency(value)
                                }
                            }
                        },
                        interaction: {
                            mode: 'index',
                            intersect: false
                        }
                    }
                });
            }
        }

        _initTooltips() {
            // Check if Tippy.js is loaded
            if (typeof tippy === 'undefined') {
                console.error('Tippy.js not loaded! Tooltips will not work.');
                return;
            }

            console.log('Initializing tooltips...');

            // Simple and reliable tooltip initialization
            const tooltipConfig = {
                allowHTML: true,
                interactive: true,
                placement: 'top',
                theme: 'light',
                arrow: true,
                maxWidth: 400,
                duration: [200, 150],
                offset: [0, 10],
                appendTo: () => document.body,
                trigger: 'mouseenter focus', // Show on hover/focus
                delay: [300, 0] // 300ms delay before showing, 0ms delay before hiding
            };

            // Direct mapping of slider IDs to tooltip template IDs
            const tooltipMapping = {
                // Mortality section
                'vsl-slider': 'tooltip-mortality-vsl',
                'suicides-slider': 'tooltip-mortality-suicides', 
                'attribution-slider': 'tooltip-mortality-attribution',
                
                // Mental health section
                'depression-slider': 'tooltip-qaly-people',
                'yld-slider': 'tooltip-qaly-yld',
                'qol-slider': 'tooltip-qaly-qol',
                
                // Healthcare section
                'healthcare-slider': 'tooltip-healthcare-costs',
                'productivity-slider': 'tooltip-healthcare-productivity',
                'duration-slider': 'tooltip-healthcare-duration'
            };

            let initializedCount = 0;

            // Initialize tooltips for slider info buttons
            Object.entries(tooltipMapping).forEach(([sliderId, templateId]) => {
                const slider = document.getElementById(sliderId);
                if (slider) {
                    // Find the info button that's a sibling of the slider's parent container
                    const sliderContainer = slider.closest('.slider-container');
                    const infoButton = sliderContainer?.querySelector('.info-button');
                    const template = document.getElementById(templateId);
                    
                    if (infoButton && template) {
                        console.log(`Initializing tooltip for ${sliderId} with template ${templateId}`);
                        try {
                            tippy(infoButton, {
                                ...tooltipConfig,
                                content: template.innerHTML
                            });
                            initializedCount++;
                        } catch (error) {
                            console.error(`Error initializing tooltip for ${sliderId}:`, error);
                        }
                    } else {
                        console.warn(`Missing elements for ${sliderId}:`, { 
                            infoButton: !!infoButton, 
                            template: !!template,
                            sliderContainer: !!sliderContainer 
                        });
                    }
                } else {
                    console.warn(`Slider not found: ${sliderId}`);
                }
            });

            // Initialize section header tooltips
            const sectionTooltips = [
                { selector: '.parameter-group:nth-child(1) h3 .info-button', template: 'tooltip-mortality' },
                { selector: '.parameter-group:nth-child(2) h3 .info-button', template: 'tooltip-qaly' },
                { selector: '.parameter-group:nth-child(3) h3 .info-button', template: 'tooltip-healthcare' }
            ];

            sectionTooltips.forEach(({ selector, template }) => {
                const button = document.querySelector(selector);
                const templateEl = document.getElementById(template);
                
                if (button && templateEl) {
                    console.log(`Initializing section tooltip for ${template}`);
                    try {
                        tippy(button, {
                            ...tooltipConfig,
                            content: templateEl.innerHTML
                        });
                        initializedCount++;
                    } catch (error) {
                        console.error(`Error initializing section tooltip for ${template}:`, error);
                    }
                } else {
                    console.warn(`Missing section tooltip elements:`, { 
                        button: !!button, 
                        template: !!templateEl, 
                        selector 
                    });
                }
            });

            // Debug: Log how many tooltips were initialized
            console.log(`Successfully initialized ${initializedCount} tooltips`);
            
            // If no tooltips were initialized, try a fallback approach
            if (initializedCount === 0) {
                console.warn('No tooltips initialized, trying fallback approach...');
                this._initTooltipsFallback();
            }
        }

        _initTooltipsFallback() {
            // Fallback: initialize all info buttons with their corresponding templates
            const infoButtons = document.querySelectorAll('.info-button');
            console.log(`Found ${infoButtons.length} info buttons`);
            
            infoButtons.forEach((button, index) => {
                // Try to find the closest parameter group and determine which template to use
                const parameterGroup = button.closest('.parameter-group');
                if (parameterGroup) {
                    const groupIndex = Array.from(document.querySelectorAll('.parameter-group')).indexOf(parameterGroup);
                    let templateId = '';
                    
                    if (groupIndex === 0) {
                        // Mortality section
                        templateId = 'tooltip-mortality';
                    } else if (groupIndex === 1) {
                        // Mental health section
                        templateId = 'tooltip-qaly';
                    } else if (groupIndex === 2) {
                        // Healthcare section
                        templateId = 'tooltip-healthcare';
                    }
                    
                    const template = document.getElementById(templateId);
                    if (template) {
                        console.log(`Fallback: Initializing tooltip for button ${index} with template ${templateId}`);
                        try {
                            tippy(button, {
                                allowHTML: true,
                                interactive: true,
                                placement: 'top',
                                theme: 'light',
                                arrow: true,
                                maxWidth: 400,
                                content: template.innerHTML
                            });
                        } catch (error) {
                            console.error(`Error in fallback tooltip initialization:`, error);
                        }
                    }
                }
            });
        }

        _formatCurrency(value) {
            if (value >= 1e12) return `$${(value / 1e12).toFixed(2)} Trillion`;
            if (value >= 1e9) return `$${(value / 1e9).toFixed(1)} Billion`;
            return `$${(value / 1e6).toFixed(1)} Million`;
        }

        _updateSliderDisplays(state) {
            this.sliderIds.forEach(id => {
                const sliderEl = document.getElementById(`${id}-slider`);
                if(sliderEl) sliderEl.value = state[id];

                const valueDisplay = document.getElementById(`${id}-value`);
                if (!valueDisplay) return;

                let text = '';
                switch (id) {
                    case 'vsl': text = `$${state[id].toFixed(1)}M`; break;
                    case 'suicides': text = `${(state[id] / 1000).toFixed(0)}K`; break;
                    case 'attribution': text = `${state[id]}%`; break;
                    case 'depression': text = `${(state[id] / 1e6).toFixed(1).replace('.0', '')}M`; break;
                    case 'yld': text = `${state[id].toFixed(1)} years`; break;
                    case 'qol': text = `${state[id]}%`; break;
                    case 'healthcare': text = `$${state[id].toLocaleString()}`; break;
                    case 'productivity': text = `$${state[id].toLocaleString()}`; break;
                    case 'duration': text = `${state[id].toFixed(1)} years`; break;
                }
                valueDisplay.textContent = text;
            });
        }

        _updateFormulaDisplays(state) {
            // Calculate the VSL per year for mental health calculations
            const vslPerYear = (state.vsl * 1e6) / 75;
            
            if (this.elements.mortalityFormula) {
                this.elements.mortalityFormula.textContent = `${Number(state.suicides).toLocaleString()} × ${state.attribution}% × $${state.vsl.toFixed(1)}M = ${this._formatCurrency(state.results.mortalityCost)}`;
            }
            if (this.elements.mentalHealthFormula) {
                this.elements.mentalHealthFormula.textContent = `${Number(state.depression).toLocaleString()} × ${state.yld}yrs × ${state.qol}% × $${(vslPerYear / 1e3).toFixed(0)}K = ${this._formatCurrency(state.results.mentalHealthCost)}`;
            }
            if (this.elements.healthcareFormula) {
                this.elements.healthcareFormula.textContent = `${Number(state.depression).toLocaleString()} × ($${Number(state.healthcare).toLocaleString()} + $${Number(state.productivity).toLocaleString()}) × ${state.duration.toFixed(1)}yrs = ${this._formatCurrency(state.results.healthcareProductivityCost)}`;
            }
        }

        _updateCostBreakdownResults(state) {
            // Update the cost breakdown results in the right column
            const mortalityResult = document.getElementById('mortality-result');
            const mentalResult = document.getElementById('mental-result');
            const healthcareResult = document.getElementById('healthcare-result');

            if (mortalityResult) {
                mortalityResult.textContent = this._formatCurrency(state.results.mortalityCost);
            }
            if (mentalResult) {
                mentalResult.textContent = this._formatCurrency(state.results.mentalHealthCost);
            }
            if (healthcareResult) {
                healthcareResult.textContent = this._formatCurrency(state.results.healthcareProductivityCost);
            }
        }

        _updateLeftColumnFormulaResults(state) {
            // Calculate the VSL per year for mental health calculations
            const vslPerYear = (state.vsl * 1e6) / 75;
            
            // Update the formula results in the left column sections
            const mortalityFormulaResult = document.getElementById('mortality-formula-result');
            const mentalFormulaResult = document.getElementById('mental-formula-result');

            if (mortalityFormulaResult) {
                mortalityFormulaResult.textContent = `${Number(state.suicides).toLocaleString()} × ${state.attribution}% × $${state.vsl.toFixed(1)}M = ${this._formatCurrency(state.results.mortalityCost)}`;
            }
            if (mentalFormulaResult) {
                mentalFormulaResult.textContent = `${Number(state.depression).toLocaleString()} × ${state.yld} × ${state.qol}% × $${(vslPerYear / 1e3).toFixed(0)}K = ${this._formatCurrency(state.results.mentalHealthCost)}`;
            }
        }
        
        _updateCharts(state) {
            // Update pie chart
            if (this.charts.pie) {
                this.charts.pie.data.datasets[0].data = [
                    state.results.mortalityCost,
                    state.results.mentalHealthCost,
                    state.results.healthcareProductivityCost
                ];
                this.charts.pie.update(); // Force full update to ensure rendering
            }

            // Update timeline chart with cumulative costs for all components
            if (this.charts.timeline) {
                const years = 16; // 2009-2024
                
                // Calculate annual costs for each component
                const annualMortalityCost = state.results.mortalityCost / years;
                const annualMentalHealthCost = state.results.mentalHealthCost / years;
                const annualHealthcareCost = state.results.healthcareProductivityCost / years;
                const annualTotalCost = state.results.totalCost / years;
                
                // Create cumulative data arrays for each component
                const mortalityData = [];
                const mentalHealthData = [];
                const healthcareData = [];
                const totalData = [];
                
                for (let i = 0; i < years; i++) {
                    // Create a realistic growth pattern: starts low, accelerates around 2012 (Instagram launch)
                    let growthFactor;
                    if (i < 3) { // 2009-2011: Early adoption, minimal impact
                        growthFactor = 0.1 + (0.1 * i / 3);
                    } else if (i < 8) { // 2012-2016: Rapid growth phase
                        growthFactor = 0.2 + (0.5 * (i - 3) / 5);
                    } else { // 2017-2024: Maturation and full impact
                        growthFactor = 0.7 + (0.3 * (i - 8) / 8);
                    }
                    
                    // Calculate cumulative costs up to this year
                    const cumulativeMortality = annualMortalityCost * growthFactor * (i + 1);
                    const cumulativeMentalHealth = annualMentalHealthCost * growthFactor * (i + 1);
                    const cumulativeHealthcare = annualHealthcareCost * growthFactor * (i + 1);
                    const cumulativeTotal = annualTotalCost * growthFactor * (i + 1);
                    
                    mortalityData.push(cumulativeMortality);
                    mentalHealthData.push(cumulativeMentalHealth);
                    healthcareData.push(cumulativeHealthcare);
                    totalData.push(cumulativeTotal);
                }
                
                // Update all four datasets
                this.charts.timeline.data.datasets[0].data = mortalityData;      // Death
                this.charts.timeline.data.datasets[1].data = mentalHealthData;  // Disability
                this.charts.timeline.data.datasets[2].data = healthcareData;    // Lost Productivity
                this.charts.timeline.data.datasets[3].data = totalData;         // Total
                
                this.charts.timeline.update(); // Force full update to ensure rendering
            }
        }

        _updateDynamicComparisons(totalCost) {
            const comparisons = [
                { threshold: 200e9, text: "the US federal education budget", icon: "🎓" },
                { threshold: 280e9, text: "the cost of the Apollo Program", icon: "🚀" },
                { threshold: 500e9, text: "the GDP of Norway", icon: "🇳🇴" },
                { threshold: 900e9, text: "the US defense budget", icon: "🛡️" },
                { threshold: 1.5e12, text: "the GDP of Australia", icon: "🇦🇺" },
                { threshold: 2.0e12, text: "the GDP of Canada", icon: "🇨🇦" },
                { threshold: 4.0e12, text: "the GDP of Japan", icon: "🇯🇵" },
            ];

            let bestMatch = comparisons.filter(c => totalCost > c.threshold).pop() || comparisons[0];

            const container = document.getElementById('dynamic-comparison-container');
            if (container) {
                container.querySelector('span:first-child').textContent = bestMatch.icon;
                container.querySelector('span:last-child').innerHTML = `Larger than <strong class="font-bold text-white">${bestMatch.text}</strong>.`;
            }
        }
        
        update(state) {
            // Update main total cost display
            this.elements.totalCost.textContent = this._formatCurrency(state.results.totalCost);
            this.elements.gdpPercentage.textContent = `${state.results.gdpPercentage.toFixed(1)}%`;
            
            // Update final equation
            if (this.elements.finalEquation) {
                this.elements.finalEquation.textContent = `Total = ${this._formatCurrency(state.results.mortalityCost)} + ${this._formatCurrency(state.results.mentalHealthCost)} + ${this._formatCurrency(state.results.healthcareProductivityCost)}`;
            }
            
            // Update all displays
            this._updateSliderDisplays(state);
            this._updateFormulaDisplays(state);
            this._updateCostBreakdownResults(state);
            this._updateLeftColumnFormulaResults(state);
            this._updateCharts(state);
            this._updateDynamicComparisons(state.results.totalCost);
            
            // Update ticking counter rates with new calculated values
            LifetimeCounter.updateRates(state);
        }
    }

    /**
     * Manages the application state and orchestrates calculations.
     */
    class CostCalculator {
        constructor(uiManager) {
            this.state = { ...initialState, results: {} };
            this.uiManager = uiManager;
            this.calculateAll();
        }

        calculateAll() {
            const s = this.state;
            const mortalityCost = Calculator.mortalityCost(s);
            const mentalHealthCost = Calculator.mentalHealthCost(s);
            const healthcareProductivityCost = Calculator.healthcareProductivityCost(s);
            const totalCost = Calculator.totalCost(mortalityCost, mentalHealthCost, healthcareProductivityCost);
            const gdpPercentage = Calculator.gdpPercentage(totalCost);
            
            this.state.results = { mortalityCost, mentalHealthCost, healthcareProductivityCost, totalCost, gdpPercentage };
        }

        updateState(key, value) {
            if (this.state[key] !== undefined) {
                this.state[key] = value;
                this.calculateAll();
                this.uiManager.update(this.state);
            }
        }

        getState() {
            return this.state;
        }
    }

    /**
     * Main application entry point.
     */
    function initApp() {
        const uiManager = new UIManager();
        const costCalculator = new CostCalculator(uiManager);
        uiManager.init(costCalculator);
    }

    document.addEventListener('DOMContentLoaded', initApp);

})(); 