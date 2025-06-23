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
     * Real-time counter system for lifetime statistics
     */
    const LifetimeCounter = {
        startDate: new Date('2009-01-01T00:00:00Z'),
        sessionStartDate: new Date(),
        depressionPerSecond: 0,
        suicidePerSecond: 0,
        costPerSecond: 0,
        sessionCostPerSecond: 0,
        interval: null,

        init() {
            // Calculate total seconds since 2009
            const now = new Date();
            const totalSeconds = (now - this.startDate) / 1000;
            
            // Calculate rates per second based on current state
            this.updateRates();
            
            // Start the ticking animation
            this.startTicking();
        },

        updateRates() {
            // Get current state values (these will be updated by the calculator)
            const depressionTotal = 15000000; // 15M total depression cases
            const suicideTotal = 89400; // 89,400 total suicides
            const costTotal = 2039660000000; // $2.04T total cost
            
            const totalSeconds = (new Date() - this.startDate) / 1000;
            
            this.depressionPerSecond = depressionTotal / totalSeconds;
            this.suicidePerSecond = suicideTotal / totalSeconds;
            this.costPerSecond = costTotal / totalSeconds;
            
            // Calculate session cost per second (annual rate divided by seconds in a year)
            const annualCost = 2090000000000; // $2.09T annual cost
            this.sessionCostPerSecond = annualCost / (365 * 24 * 60 * 60); // Convert annual to per second
        },

        startTicking() {
            if (this.interval) clearInterval(this.interval);
            
            this.interval = setInterval(() => {
                const now = new Date();
                const elapsedSeconds = (now - this.startDate) / 1000;
                const sessionElapsedSeconds = (now - this.sessionStartDate) / 1000;
                
                const currentDepression = this.depressionPerSecond * elapsedSeconds;
                const currentSuicide = this.suicidePerSecond * elapsedSeconds;
                const currentCost = this.costPerSecond * elapsedSeconds;
                const sessionCost = this.sessionCostPerSecond * sessionElapsedSeconds;
                
                // Update the display with 2 decimal places
                const depressionEl = document.getElementById('lifetime-depression');
                const suicideEl = document.getElementById('lifetime-suicide');
                const costEl = document.getElementById('national-debt-clock-total-amount');
                const sessionCostEl = document.getElementById('running-total-amount');
                
                if (depressionEl) {
                    depressionEl.textContent = currentDepression.toFixed(2);
                }
                if (suicideEl) {
                    suicideEl.textContent = currentSuicide.toFixed(2);
                }
                if (costEl) {
                    costEl.textContent = Math.floor(currentCost).toLocaleString();
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
                mentalHealthFormula: document.getElementById('mental-health-display-formula'),
                healthcareFormula: document.getElementById('healthcare-display-formula'),
                pieChart: document.getElementById('pieChart'),
                resetButton: document.getElementById('reset-button'),
                shareButton: document.getElementById('share-button'),
                causalPopoutBtn: document.getElementById('causal-popout-btn'),
                causalModal: document.getElementById('causal-modal'),
                causalModalClose: document.getElementById('causal-modal-close'),
            };
            this.charts = { pie: null };
            this.sliderIds = Object.keys(initialState);
        }

        init(costCalculator) {
            this._initSliders(costCalculator);
            this._initButtons();
            this._initCharts();
            this.update(costCalculator.getState());
            
            // Initialize the lifetime counter
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
        }

        _initCharts() {
            if (!this.elements.pieChart) return;
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
            if (this.elements.mortalityFormula) {
                this.elements.mortalityFormula.textContent = `${Number(state.suicides).toLocaleString()} × ${state.attribution}% × $${state.vsl.toFixed(1)}M = ${this._formatCurrency(state.results.mortalityCost)}`;
            }
            if (this.elements.mentalHealthFormula) {
                this.elements.mentalHealthFormula.textContent = `${Number(state.depression).toLocaleString()} × ${state.yld}yrs × ${state.qol}% = ${this._formatCurrency(state.results.mentalHealthCost)}`;
            }
            if (this.elements.healthcareFormula) {
                this.elements.healthcareFormula.textContent = `${Number(state.depression).toLocaleString()} × ($${Number(state.healthcare).toLocaleString()} + $${Number(state.productivity).toLocaleString()}) × ${state.duration.toFixed(1)}yrs = ${this._formatCurrency(state.results.healthcareProductivityCost)}`;
            }
        }
        
        _updateCharts(state) {
            if (this.charts.pie) {
                this.charts.pie.data.datasets[0].data = [
                    state.results.mortalityCost,
                    state.results.mentalHealthCost,
                    state.results.healthcareProductivityCost
                ];
                this.charts.pie.update('none');
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
            this.elements.totalCost.textContent = this._formatCurrency(state.results.totalCost);
            this.elements.gdpPercentage.textContent = `${state.results.gdpPercentage.toFixed(1)}%`;
            if (this.elements.finalEquation) {
                this.elements.finalEquation.textContent = `Total = ${this._formatCurrency(state.results.mortalityCost)} + ${this._formatCurrency(state.results.mentalHealthCost)} + ${this._formatCurrency(state.results.healthcareProductivityCost)}`;
            }
            
            this._updateSliderDisplays(state);
            this._updateFormulaDisplays(state);
            this._updateCharts(state);
            this._updateDynamicComparisons(state.results.totalCost);
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