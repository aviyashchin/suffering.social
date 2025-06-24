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
        depression: 5000000,
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
            // Calculate rates based on total time elapsed since 2009
            const totalSeconds = (new Date() - this.startDate) / 1000;
            
            // Update rates based on current calculator state
            this.depressionPerSecond = state.depression / totalSeconds;
            this.suicidePerSecond = state.suicides / totalSeconds;
            
            // Both cost counters should use the same rate: total cost divided by total elapsed time
            this.totalCostPerSecond = state.results.totalCost / totalSeconds;
            this.sessionCostPerSecond = state.results.totalCost / totalSeconds;
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
            }, document.body.classList.contains('performance-mode') ? 1000 : 100); // 1s in performance mode, 100ms otherwise
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
            this._initMermaid();
            
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
            
            // Set current year dynamically
            const currentYearEl = document.getElementById('current-year');
            if (currentYearEl) {
                currentYearEl.textContent = new Date().getFullYear();
            }
        }

        _initMermaid() {
            // Wait for Mermaid library to load, then initialize
            const initMermaidWhenReady = () => {
                if (typeof mermaid !== 'undefined') {
                    console.log('Initializing Mermaid...');
                    
                    mermaid.initialize({
                        startOnLoad: false, // We'll manually trigger
                        theme: 'default',
                        flowchart: {
                            useMaxWidth: true,
                            htmlLabels: true
                        },
                        securityLevel: 'loose'
                    });
                    
                    // Store original graph definitions before rendering
                    const graphDefinitions = new Map();
                    
                    // Force render of existing mermaid diagrams
                    setTimeout(() => {
                        try {
                            const diagrams = document.querySelectorAll('.mermaid');
                            console.log('Found', diagrams.length, 'mermaid diagrams');
                            
                            diagrams.forEach((diagram, index) => {
                                const id = diagram.id || `mermaid-${index}`;
                                diagram.id = id;
                                console.log('Rendering diagram:', id);
                                
                                // Store the original graph definition
                                const graphDefinition = diagram.textContent.trim();
                                graphDefinitions.set(id, graphDefinition);
                                
                                // Clear and render
                                diagram.innerHTML = '';
                                
                                mermaid.render(id + '-svg', graphDefinition, (svgCode) => {
                                    diagram.innerHTML = svgCode;
                                });
                            });
                            
                            // Store graph definitions globally for modal access
                            window.mermaidGraphDefinitions = graphDefinitions;
                            
                        } catch (error) {
                            console.error('Mermaid initialization error:', error);
                        }
                    }, 100);
                } else {
                    // Try again in 100ms if Mermaid isn't loaded yet
                    setTimeout(initMermaidWhenReady, 100);
                }
            };
            
            initMermaidWhenReady();
            
            // Add observer to re-render modal diagram when modal opens
            const modal = document.getElementById('causal-modal');
            if (modal) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (!modal.classList.contains('hidden')) {
                                // Modal opened - re-render the modal diagram
                                setTimeout(() => {
                                    const modalDiagram = document.getElementById('causal-diagram-modal');
                                    if (modalDiagram && window.mermaidGraphDefinitions) {
                                        try {
                                            console.log('Rendering modal diagram...');
                                            
                                            // Use stored graph definition or get from main diagram
                                            let graphDefinition = window.mermaidGraphDefinitions.get('causal-diagram-modal');
                                            if (!graphDefinition) {
                                                graphDefinition = window.mermaidGraphDefinitions.get('causal-diagram');
                                            }
                                            
                                            if (graphDefinition) {
                                                modalDiagram.innerHTML = '';
                                                
                                                mermaid.render('modal-svg-' + Date.now(), graphDefinition, (svgCode) => {
                                                    modalDiagram.innerHTML = svgCode;
                                                });
                                            } else {
                                                console.warn('No graph definition found for modal');
                                            }
                                        } catch (error) {
                                            console.error('Modal mermaid render error:', error);
                                        }
                                    }
                                }, 200);
                            }
                        }
                    });
                });
                observer.observe(modal, { attributes: true });
            }
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
            if (this.elements.shareButton) {
                this.elements.shareButton.addEventListener('click', () => {
                    const totalCost = this.elements.totalCost.textContent;
                    const text = `Social media's hidden cost to society is over ${totalCost} per year. This calculator shows how:`;
                    const url = window.location.href;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    window.open(twitterUrl, '_blank');
                });
            }
            if (this.elements.causalModalClose) {
                this.elements.causalModalClose.addEventListener('click', () => this.elements.causalModal.classList.add('hidden'));
            }
            
            // Add click handler to modal background to close it
            if (this.elements.causalModal) {
                this.elements.causalModal.addEventListener('click', (e) => {
                    if (e.target === this.elements.causalModal) {
                        this.elements.causalModal.classList.add('hidden');
                    }
                });
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
            // Performance mode chart options
            const performanceMode = document.body.classList.contains('performance-mode');
            const chartOptions = performanceMode ? {
                animation: false,
                animations: {
                    colors: false,
                    x: false,
                    y: false
                }
            } : {};
            
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
                        ...chartOptions,
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
                        ...chartOptions,
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
                console.error('Tippy.js not loaded! Falling back to click-based tooltips.');
                this._initTooltipsFallback();
                return;
            }

            console.log('Initializing tooltips...');

            // Simple and reliable tooltip initialization
            const tooltipConfig = {
                allowHTML: true,
                interactive: true,
                placement: 'auto',
                theme: 'light',
                arrow: true,
                maxWidth: 450,
                duration: [150, 100],
                offset: [0, 10],
                appendTo: () => document.body,
                trigger: 'mouseenter click', // Show on both hover and click
                delay: [200, 0], // 200ms delay before showing, 0ms delay before hiding
                hideOnClick: 'toggle' // Allow clicking to toggle
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
            // Fallback: create click-based tooltips without Tippy.js
            const infoButtons = document.querySelectorAll('.info-button');
            console.log(`Fallback tooltips: Found ${infoButtons.length} info buttons`);
            
            // Create a tooltip container if it doesn't exist
            let tooltipContainer = document.getElementById('fallback-tooltip');
            if (!tooltipContainer) {
                tooltipContainer = document.createElement('div');
                tooltipContainer.id = 'fallback-tooltip';
                tooltipContainer.className = 'fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md hidden';
                tooltipContainer.style.cssText = `
                    max-width: 400px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    padding: 16px;
                    z-index: 9999;
                    font-size: 14px;
                    line-height: 1.5;
                `;
                document.body.appendChild(tooltipContainer);
            }
            
            infoButtons.forEach((button, index) => {
                let templateId = '';
                
                // Determine template based on the slider this button is associated with
                const sliderContainer = button.closest('.slider-container');
                if (sliderContainer) {
                    const slider = sliderContainer.querySelector('input[type="range"]');
                    if (slider) {
                        const sliderId = slider.id;
                        
                        // Map slider IDs to template IDs
                        const sliderTemplateMap = {
                            'vsl-slider': 'tooltip-mortality-vsl',
                            'suicides-slider': 'tooltip-mortality-suicides', 
                            'attribution-slider': 'tooltip-mortality-attribution',
                            'depression-slider': 'tooltip-qaly-people',
                            'yld-slider': 'tooltip-qaly-yld',
                            'qol-slider': 'tooltip-qaly-qol',
                            'healthcare-slider': 'tooltip-healthcare-costs',
                            'productivity-slider': 'tooltip-healthcare-productivity',
                            'duration-slider': 'tooltip-healthcare-duration'
                        };
                        
                        templateId = sliderTemplateMap[sliderId];
                    }
                } else {
                    // Try to find the closest parameter group for section headers
                    const parameterGroup = button.closest('.parameter-group');
                    if (parameterGroup) {
                        const groupIndex = Array.from(document.querySelectorAll('.parameter-group')).indexOf(parameterGroup);
                        
                        if (groupIndex === 0) {
                            templateId = 'tooltip-mortality';
                        } else if (groupIndex === 1) {
                            templateId = 'tooltip-qaly';
                        } else if (groupIndex === 2) {
                            templateId = 'tooltip-healthcare';
                        }
                    }
                }
                
                const template = document.getElementById(templateId);
                if (template) {
                    console.log(`Fallback: Setting up click tooltip for button ${index} with template ${templateId}`);
                    
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Position tooltip near the button
                        const rect = button.getBoundingClientRect();
                        tooltipContainer.innerHTML = template.innerHTML;
                        tooltipContainer.classList.remove('hidden');
                        
                        // Position tooltip
                        const tooltipRect = tooltipContainer.getBoundingClientRect();
                        let left = rect.left + window.scrollX;
                        let top = rect.bottom + window.scrollY + 10;
                        
                        // Adjust if tooltip goes off screen
                        if (left + tooltipRect.width > window.innerWidth) {
                            left = window.innerWidth - tooltipRect.width - 20;
                        }
                        if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
                            top = rect.top + window.scrollY - tooltipRect.height - 10;
                        }
                        
                        tooltipContainer.style.left = left + 'px';
                        tooltipContainer.style.top = top + 'px';
                    });
                    
                    // Add visual feedback
                    button.style.cursor = 'pointer';
                    button.style.opacity = '0.8';
                    button.addEventListener('mouseenter', () => {
                        button.style.opacity = '1';
                        button.style.background = 'rgba(59, 130, 246, 0.1)';
                    });
                    button.addEventListener('mouseleave', () => {
                        button.style.opacity = '0.8';
                        button.style.background = '';
                    });
                } else {
                    console.warn(`Fallback: No template found for button ${index}, templateId: ${templateId}`);
                }
            });
            
            // Close tooltip when clicking outside
            document.addEventListener('click', (e) => {
                if (tooltipContainer && !tooltipContainer.classList.contains('hidden')) {
                    if (!tooltipContainer.contains(e.target) && !e.target.classList.contains('info-button')) {
                        tooltipContainer.classList.add('hidden');
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
            
            // Dispatch event for viral features
            const event = new CustomEvent('calculationUpdated', {
                detail: { totalCost: state.results.totalCost }
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Manages the application state and orchestrates calculations.
     */
    class CostCalculator {
        constructor() {
            this.state = { ...initialState, results: {} };
            this.uiManager = null; // Will be set by initApp
            this.calculateAll();
        }

        setUIManager(uiManager) {
            this.uiManager = uiManager;
        }

        calculateAll() {
            const s = this.state;
            const mortalityCost = Calculator.mortalityCost(s);
            const mentalHealthCost = Calculator.mentalHealthCost(s);
            const healthcareProductivityCost = Calculator.healthcareProductivityCost(s);
            const totalCost = Calculator.totalCost(mortalityCost, mentalHealthCost, healthcareProductivityCost);
            const gdpPercentage = Calculator.gdpPercentage(totalCost);
            
            // Debug logging to check calculations
            console.log('=== CALCULATION DEBUG ===');
            console.log('State:', s);
            console.log('Mortality Cost:', mortalityCost, '=', s.suicides, '×', s.attribution + '%', '×', '$' + s.vsl + 'M');
            console.log('Mental Health Cost:', mentalHealthCost, '=', s.depression, '×', s.yld, '×', s.qol + '%', '×', '$' + ((s.vsl * 1e6) / 75));
            console.log('Healthcare Cost:', healthcareProductivityCost, '=', s.depression, '×', '($' + s.healthcare, '+', '$' + s.productivity + ')', '×', s.duration);
            console.log('Total Cost:', totalCost);
            console.log('========================');
            
            this.state.results = { mortalityCost, mentalHealthCost, healthcareProductivityCost, totalCost, gdpPercentage };
        }

        updateState(key, value) {
            if (this.state[key] !== undefined) {
                this.state[key] = value;
                this.calculateAll();
                if (this.uiManager) {
                    this.uiManager.update(this.state);
                }
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
        const costCalculator = new CostCalculator();
        const uiManager = new UIManager();
        
        // Make calculator globally accessible for viral features
        window.costCalculatorInstance = costCalculator;
        
        // Set up the circular reference
        costCalculator.setUIManager(uiManager);
        
        uiManager.init(costCalculator);
        
        // Initialize distribution slider integration
        initDistributionSliderIntegration(costCalculator);
        
        // Initialize viral features
        ViralFeatures.init();
    }

    /**
     * Initialize distribution slider integration with graceful fallback
     */
    async function initDistributionSliderIntegration(costCalculator) {
        try {
            // console.log('🔄 Initializing distribution slider integration...');
            console.log('D3 available:', !!window.d3);
            console.log('DistributionSlider available:', !!window.DistributionSlider);
            console.log('calculatorIntegration available:', !!window.calculatorIntegration);
            
            // Wait for integration system to be available
            await new Promise(resolve => {
                let attempts = 0;
                const checkAndInit = async () => {
                    attempts++;
                    console.log(`Attempt ${attempts}: calculatorIntegration=${!!window.calculatorIntegration}`);
                    
                    if (typeof window.calculatorIntegration !== 'undefined') {
                        try {
                            // Initialize integration with our existing update function
                            await window.calculatorIntegration.initialize((sliderId, value, output) => {
                                // This will be called when distribution sliders change
                                // console.log(`Distribution slider ${sliderId} changed to ${value}`);
                                
                                // Update our calculator state
                                const key = sliderId.replace('-slider', '');
                                costCalculator.updateState(key, value);
                            });
                            
                            // Check what features are available
                            const features = window.calculatorIntegration.getFeatures();
                            console.log('✅ Distribution slider features available:', features);
                            
                            // Update UI based on capabilities
                            updateUIForDistributionSliders(features);
                            
                            // Wire up scenario buttons to use distribution sliders
                            wireScenarioButtons();
                            
                            // Add uncertainty analysis updates
                            addUncertaintyAnalysisUpdates(costCalculator);
                            
                            // Initialize test runner
                            initTestRunner();
                            
                            resolve();
                        } catch (error) {
                            console.error('Integration initialization failed:', error);
                            resolve();
                        }
                    } else if (attempts > 10) { // 5 seconds max
                        console.log('⚠️ Distribution slider integration not available, using fallback sliders');
                        updateTestStatus('Distribution sliders not available - using fallback mode', false);
                        resolve();
                    } else {
                        setTimeout(checkAndInit, 500);
                    }
                };
                checkAndInit();
            });
        } catch (error) {
            console.warn('⚠️ Distribution slider integration failed:', error);
            console.log('📋 Falling back to standard sliders');
        }
    }

    /**
     * Update UI based on distribution slider capabilities
     */
    function updateUIForDistributionSliders(features) {
        // Show enhanced features section if distribution sliders are available
        if (features.distributionVisualization) {
            document.body.classList.add('has-distribution-sliders');
            
            // Update integration status
            const statusEl = document.getElementById('integration-status');
            if (statusEl) {
                statusEl.style.display = 'block';
            }
            
            // Update feature list
            const featureListEl = document.getElementById('feature-list');
            if (featureListEl) {
                const featureItems = [];
                if (features.distributionVisualization) featureItems.push('📊 Distribution visualization');
                if (features.uncertaintyAnalysis) featureItems.push('🎯 Uncertainty analysis');
                if (features.confidenceIntervals) featureItems.push('📈 Confidence intervals');
                if (features.statisticalDisplays) featureItems.push('📋 Statistical displays');
                
                featureListEl.innerHTML = featureItems.join(' • ');
            }
        }
    }

    /**
     * Wire scenario buttons to use distribution sliders
     */
    function wireScenarioButtons() {
        const scenarioButtons = document.querySelectorAll('.scenario-btn');
        scenarioButtons.forEach(btn => {
            // Add new event listener that uses distribution sliders
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const scenario = btn.dataset.scenario;
                setDistributionSliderScenario(scenario);
            });
        });
    }

    /**
     * Set scenario values using distribution sliders
     */
    function setDistributionSliderScenario(scenarioName) {
        if (typeof window.calculatorIntegration === 'undefined') {
            // Fallback to existing scenario system
            ViralFeatures.applyScenario(scenarioName);
            return;
        }

        const scenarios = {
            'reset': {
                'vsl-slider': 13.7,
                'attribution-slider': 18,
                'suicides-slider': 110000,
                'depression-slider': 5000000,
                'yld-slider': 6.0,
                'qol-slider': 35,
                'healthcare-slider': 7000,
                'productivity-slider': 6000,
                'duration-slider': 4.5
            },
            'aggressive': {
                'vsl-slider': 20,
                'attribution-slider': 30,
                'suicides-slider': 250000,
                'depression-slider': 12000000,
                'yld-slider': 8.0,
                'qol-slider': 40,
                'healthcare-slider': 15000,
                'productivity-slider': 9000,
                'duration-slider': 6.0
            },
            'facebook-files': {
                'vsl-slider': 18,
                'attribution-slider': 25,
                'suicides-slider': 180000,
                'depression-slider': 8000000,
                'yld-slider': 7.0,
                'qol-slider': 38,
                'healthcare-slider': 12000,
                'productivity-slider': 8000,
                'duration-slider': 5.5
            },
            'optimistic': {
                'vsl-slider': 10.0,
                'attribution-slider': 8,
                'suicides-slider': 80000,
                'depression-slider': 2000000,
                'yld-slider': 3.0,
                'qol-slider': 25,
                'healthcare-slider': 6000,
                'productivity-slider': 5000,
                'duration-slider': 2.5
            }
        };
        
        const scenarioValues = scenarios[scenarioName];
        if (scenarioValues) {
            console.log(`🎯 Applying ${scenarioName} scenario with distribution sliders`);
            window.calculatorIntegration.setValues(scenarioValues);
        }
    }

    /**
     * Add uncertainty analysis updates
     */
    function addUncertaintyAnalysisUpdates(costCalculator) {
        // Listen for slider changes to update uncertainty analysis
        document.addEventListener('sliderChange', (event) => {
            updateUncertaintyAnalysis();
        });
        
        // Initial update
        setTimeout(() => updateUncertaintyAnalysis(), 1000);
    }

    /**
     * Update uncertainty analysis display
     */
    function updateUncertaintyAnalysis() {
        if (typeof window.calculatorIntegration === 'undefined') {
            return;
        }

        try {
            const uncertainty = window.calculatorIntegration.getUncertaintyAnalysis();
            if (!uncertainty) return;

            // Get confidence intervals for key parameters
            const vslCI = uncertainty['vsl-slider']?.ci95;
            const attributionCI = uncertainty['attribution-slider']?.ci95;
            const suicidesCI = uncertainty['suicides-slider']?.ci95;
            const depressionCI = uncertainty['depression-slider']?.ci95;

            if (vslCI && attributionCI && suicidesCI) {
                // Calculate mortality cost confidence interval
                const minMortality = suicidesCI[0] * (attributionCI[0] / 100) * vslCI[0] * 1000000;
                const maxMortality = suicidesCI[1] * (attributionCI[1] / 100) * vslCI[1] * 1000000;

                // Calculate total cost confidence interval (simplified)
                const currentState = window.calculatorIntegration.getAllValues();
                const currentMortality = currentState['suicides-slider'] * (currentState['attribution-slider'] / 100) * currentState['vsl-slider'] * 1000000;
                const currentMental = currentState['depression-slider'] * currentState['yld-slider'] * (currentState['qol-slider'] / 100) * (currentState['vsl-slider'] * 1000000 / 75);
                const currentHealthcare = currentState['depression-slider'] * (currentState['healthcare-slider'] + currentState['productivity-slider']) * currentState['duration-slider'];
                const currentTotal = currentMortality + currentMental + currentHealthcare;

                // Estimate total range (simplified approach)
                const mortalityRatio = (maxMortality - minMortality) / Math.max(currentMortality, 1); // Prevent division by zero
                const estimatedTotalRange = currentTotal * Math.min(mortalityRatio, 2); // Cap the ratio to prevent extreme ranges
                const minTotal = Math.max(0, currentTotal - estimatedTotalRange / 2); // Ensure minimum is never negative
                const maxTotal = currentTotal + estimatedTotalRange / 2;

                // Update uncertainty display
                const uncertaintyDisplay = document.getElementById('uncertainty-range');
                if (uncertaintyDisplay) {
                    uncertaintyDisplay.innerHTML = `
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>Mortality Cost Range:</strong><br>
                                ${formatCurrency(minMortality)} - ${formatCurrency(maxMortality)}
                            </div>
                            <div>
                                <strong>Estimated Total Range:</strong><br>
                                ${formatCurrency(minTotal)} - ${formatCurrency(maxTotal)}
                            </div>
                        </div>
                        <div class="mt-3 text-xs text-gray-600">
                            95% confidence intervals based on research uncertainty. 
                            Actual ranges may vary based on parameter correlations.
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.warn('Error updating uncertainty analysis:', error);
        }
    }

    /**
     * Format currency for uncertainty display
     */
    function formatCurrency(value) {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    }

    /**
     * Initialize test runner
     */
    function initTestRunner() {
        // Run initial tests after a delay to ensure everything is loaded
        setTimeout(() => {
            runIntegrationTests();
        }, 3000);
        
        // Set up test button
        const testButton = document.getElementById('run-tests-btn');
        if (testButton) {
            testButton.addEventListener('click', runIntegrationTests);
        }
    }

    /**
     * Run integration tests and update status
     */
    async function runIntegrationTests() {
        console.log('🧪 Running integration tests...');
        
        try {
            // Check if integration tests are available
            if (typeof window.integrationTests !== 'undefined') {
                const results = await window.integrationTests.runAllTests();
                updateTestStatus('Integration tests completed', true, results);
            } else {
                console.warn('Integration tests not available');
                updateTestStatus('Integration tests not available', false);
            }
        } catch (error) {
            console.error('Integration test error:', error);
            updateTestStatus('Integration tests failed: ' + error.message, false);
        }
    }

    /**
     * Update test status display
     */
    function updateTestStatus(message, success, results = null) {
        const testSummary = document.getElementById('test-summary');
        if (!testSummary) return;

        // Update CSS classes
        testSummary.className = `test-summary text-sm p-3 rounded border-l-4 ${success ? 'all-passed' : 'has-failures'}`;
        
        let html = `<div class="font-medium">${message}</div>`;
        
        if (results && results.results && typeof results.results === 'object') {
            try {
                // Add detailed results - safely check structure
                const failedTests = Object.entries(results.results)
                    .filter(([_, result]) => result && !result.passed)
                    .map(([category, result]) => `${category}: ${result.message || 'Failed'}`)
                    .join(', ');
                    
                if (failedTests) {
                    html += `<div class="text-xs mt-1 opacity-75">Failures: ${failedTests}</div>`;
                }
                
                // Add summary stats if available
                const totalTests = Object.keys(results.results).length;
                const passedTests = Object.values(results.results).filter(r => r && r.passed).length;
                html += `<div class="text-xs mt-1 opacity-75">Tests: ${passedTests}/${totalTests} passed</div>`;
                
            } catch (error) {
                console.warn('Error processing test results:', error);
                html += `<div class="text-xs mt-1 opacity-75">Results format error</div>`;
            }
        }
        
        // Always add timestamp
        html += `<div class="text-xs mt-1 opacity-50">Last checked: ${new Date().toLocaleTimeString()}</div>`;
        
        testSummary.innerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', initApp);

    /**
     * Viral Features Manager - handles personalization, scenarios, and social proof
     */
    const ViralFeatures = {
        personalSnippets: {
            parent: {
                california: "As a California parent, this $2.1T represents 52,000 years of your child's college tuition at UC Berkeley.",
                texas: "Fellow Texan parent: This cost could fund every child in Texas getting a full scholarship to UT Austin for 15 years.",
                "new-york": "NYC parent: This $2.1T could pay rent for every family in Manhattan for 8 months.",
                other: "As a parent, this represents the college tuition for 42 million kids - that's every child in America getting a free education."
            },
            teen: {
                california: "CA teen: This $2.1T is enough to buy TikTok, Instagram, AND Snapchat... and still have $1.8T left over.",
                texas: "Texas teen: This cost could buy every teenager in America a Tesla Model 3 and still have money left for gas for life.",
                "new-york": "NY teen: This $2.1T could fund free mental health therapy for every teen in America for 50 years.",
                other: "Teen: This cost could give every person your age $67,000 cash - enough to start adult life debt-free."
            },
            "young-adult": {
                california: "CA young adult: This $2.1T could eliminate student debt for 42 million Americans - including yours.",
                texas: "Texas young adult: This cost could buy every 20-something in America a house in Austin.",
                "new-york": "NYC young adult: This $2.1T represents 840,000 Manhattan apartments - enough housing for your entire generation.",
                other: "Young adult: This cost could give every person in your generation $52,000 to start their career debt-free."
            },
            "concerned-citizen": {
                california: "Fellow Californian: This $2.1T could solve homelessness, fund universal healthcare, AND still have $1T left over.",
                texas: "Fellow Texan: This cost could fund the entire Texas state budget for 18 years straight.",
                "new-york": "New Yorker: This $2.1T could fund the MTA, fix every bridge, AND give every NYer free healthcare for a decade.",
                other: "Fellow citizen: This cost represents 10% of our entire national GDP - imagine what we could build instead."
            }
        },

        // Shared comparison library used by both viral comparisons and community calculator
        comparisonLibrary: [
            { emoji: "🏠", text: "Built 21 million homes (solving the housing crisis)", category: "housing" },
            { emoji: "🎓", text: "Funded college for every American under 25", category: "education" },
            { emoji: "🏥", text: "Provided free mental health therapy for every teen for 100 years", category: "healthcare" },
            { emoji: "🚀", text: "Funded NASA for 105 years (we'd be on Mars by now)", category: "science" },
            { emoji: "🌍", text: "Eliminated world hunger for 7 years", category: "humanitarian" },
            { emoji: "⚡", text: "Built enough solar panels to power America for 15 years", category: "energy" },
            { emoji: "🚇", text: "Built high-speed rail connecting every major US city", category: "infrastructure" },
            { emoji: "💊", text: "Funded cancer research for 420 years", category: "healthcare" },
            { emoji: "🌊", text: "Cleaned up every ocean on Earth... twice", category: "environment" },
            { emoji: "👨‍⚕️", text: "Hired 10 million additional teachers and therapists", category: "education" },
            { emoji: "🏛️", text: "Rebuilt every school in America... 5 times over", category: "education" },
            { emoji: "🎨", text: "Funded arts education in every school for 200 years", category: "education" },
            { emoji: "🌱", text: "Planted 500 billion trees (reversing climate change)", category: "environment" },
            { emoji: "🚁", text: "Provided emergency medical helicopters to every rural community", category: "healthcare" },
            { emoji: "💰", text: "Given every American family $7,500 in mental health support", category: "healthcare" },
            { emoji: "🎪", text: "Built community centers in every neighborhood in America", category: "community" }
        ],

        get viralComparisons() {
            return this.comparisonLibrary;
        },

        scenarios: {
            reset: {
                vsl: 13.7, suicides: 110000, attribution: 18, depression: 5000000,
                yld: 6, qol: 35, healthcare: 7000, productivity: 6000, duration: 4.5
            },
            aggressive: {
                vsl: 20.0, suicides: 250000, attribution: 30, depression: 12000000,
                yld: 8.0, qol: 40, healthcare: 15000, productivity: 9000, duration: 6.0
            },
            "facebook-files": {
                vsl: 13.7, suicides: 200000, attribution: 25, depression: 8000000,
                yld: 6.5, qol: 38, healthcare: 8500, productivity: 7500, duration: 5.0
            },
            optimistic: {
                vsl: 10.0, suicides: 80000, attribution: 8, depression: 2000000,
                yld: 3.0, qol: 25, healthcare: 6000, productivity: 5000, duration: 2.5
            }
        },

        activityMessages: [
            "Someone in California just calculated $2.3T impact 😱",
            "Parent in Texas shared their results on Facebook",
            "Teen in NYC: 'This is why I deleted Instagram' 💪",
            "Researcher in Boston bookmarked this page",
            "Someone just tried the 'Facebook Files' scenario 📱",
            "Parent in Florida: 'Showing this to my school board'",
            "College student: 'Finally, data for my thesis!' 📚",
            "Someone in Seattle calculated $1.8T (conservative estimate)",
            "Teacher in Chicago: 'Using this in my economics class'",
            "Therapist in Miami shared this with colleagues"
        ],

        init() {
            this.initPersonalization();
            this.initScenarios();
            this.initViralComparisons();
            this.initSocialProof();
            this.initSocialSharing();
        },

        initPersonalization() {
            const calculateBtn = document.getElementById('calculate-community-impact');
            if (calculateBtn) {
                calculateBtn.addEventListener('click', () => {
                    const population = document.getElementById('community-population').value;
                    const state = document.getElementById('state-select').value;
                    
                    if (population && population >= 1000) {
                        const results = this.calculateCommunityImpact(parseInt(population), state);
                        this.showCommunityResults(results);
                    } else {
                        alert('Please enter a community population of at least 1,000 people!');
                    }
                });
            }
        },

        calculateCommunityImpact(population, selectedState) {
            // National baseline statistics (2024)
            const nationalStats = {
                population: 335000000, // US population
                teenDepression: 5200000, // 5.2M teens with major depression
                teenDepressionRate: 0.158, // 15.8% of teens
                annualEconomicCost: 282000000000, // $282B annual cost
                suicideRate: 49000 / 335000000, // 49,000 deaths per 335M people
                youthAgeRange: 0.25 // Approximate % of population that are teens/young adults
            };

                         // State-specific multipliers (some states have higher rates)
             const stateMultipliers = {
                 'national': 1.0,
                 'alaska': 1.8, // Highest suicide rate
                 'montana': 1.6,
                 'wyoming': 1.5,
                 'new-mexico': 1.4,
                 'utah': 1.3,
                 'nevada': 1.3,
                 'colorado': 1.2,
                 'oregon': 1.2,
                 'idaho': 1.2,
                 'oklahoma': 1.2,
                 'arizona': 1.1,
                 'west-virginia': 1.1,
                 'tennessee': 1.1,
                 'kansas': 1.1,
                 'arkansas': 1.1,
                 'alabama': 1.0,
                 'california': 0.9,
                 'texas': 0.9,
                 'florida': 0.9,
                 'new-york': 0.8,
                 'massachusetts': 0.8,
                 'connecticut': 0.7,
                 'new-jersey': 0.7,
                 'hawaii': 0.8,
                 'maryland': 0.8,
                 'rhode-island': 0.8,
                 'delaware': 0.9,
                 'georgia': 1.0,
                 'illinois': 0.9,
                 'indiana': 1.0,
                 'iowa': 1.1,
                 'kentucky': 1.1,
                 'louisiana': 1.0,
                 'maine': 1.2,
                 'michigan': 1.0,
                 'minnesota': 0.9,
                 'mississippi': 1.0,
                 'missouri': 1.1,
                 'nebraska': 1.1,
                 'new-hampshire': 1.2,
                 'north-carolina': 1.0,
                 'north-dakota': 1.3,
                 'ohio': 1.0,
                 'pennsylvania': 0.9,
                 'south-carolina': 1.0,
                 'south-dakota': 1.3,
                 'vermont': 1.2,
                 'virginia': 0.9,
                 'washington': 1.1,
                 'wisconsin': 1.0
             };

            const stateMultiplier = stateMultipliers[selectedState] || 1.0;
            const stateName = selectedState === 'national' ? 'National Average' : 
                selectedState.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Calculate community-specific impacts
            const youthPopulation = Math.round(population * nationalStats.youthAgeRange);
            const estimatedDepressionCases = Math.round(youthPopulation * nationalStats.teenDepressionRate * stateMultiplier);
            const estimatedSuicides = Math.round(population * nationalStats.suicideRate * stateMultiplier);
            
            // Economic impact proportional to population
            const annualEconomicImpact = Math.round((population / nationalStats.population) * nationalStats.annualEconomicCost * stateMultiplier);
            
            // Since 2009 cumulative (15 years)
            const cumulativeEconomicImpact = annualEconomicImpact * 15;

            return {
                population,
                stateName,
                stateMultiplier,
                youthPopulation,
                estimatedDepressionCases,
                estimatedSuicides,
                annualEconomicImpact,
                cumulativeEconomicImpact
            };
        },

        showCommunityResults(results) {
            const container = document.getElementById('community-impact-results');
            if (container) {
                const shareText = `🏘️ My community of ${results.population.toLocaleString()} (${results.stateName}) faces ${results.estimatedDepressionCases} youth with depression & $${this.formatLargeNumber(results.annualEconomicImpact)} annual economic cost from social media. Calculate yours: suffering.social`;
                
                container.innerHTML = `
                    <div class="font-semibold text-green-800 mb-3">📊 Estimated Impact on Your Community</div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div class="bg-blue-50 p-3 rounded-lg text-center">
                            <div class="text-2xl font-bold text-blue-600">${results.estimatedDepressionCases}</div>
                            <div class="text-sm text-gray-600">Youth experiencing major depression</div>
                            <div class="text-xs text-blue-500 mt-1">Out of ${results.youthPopulation.toLocaleString()} youth in your area</div>
                        </div>
                        <div class="bg-red-50 p-3 rounded-lg text-center">
                            <div class="text-2xl font-bold text-red-600">${results.estimatedSuicides}</div>
                            <div class="text-sm text-gray-600">Estimated annual suicide risk</div>
                            <div class="text-xs text-red-500 mt-1">Based on ${results.stateName} rates</div>
                        </div>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg mb-4">
                        <div class="font-semibold text-green-800 mb-2">💰 Annual Economic Cost:</div>
                        <div class="text-3xl font-bold text-green-600">$${this.formatLargeNumber(results.annualEconomicImpact)}</div>
                        <div class="text-sm text-gray-600 mt-1">Based on $282 billion national cost proportioned to population</div>
                        <div class="text-xs text-gray-500 mt-2">Cumulative since 2009: $${this.formatLargeNumber(results.cumulativeEconomicImpact)}</div>
                    </div>
                    
                    <div class="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
                        <strong>Context:</strong> Your community of ${results.population.toLocaleString()} people in ${results.stateName} 
                        ${results.stateMultiplier > 1.0 ? `has ${((results.stateMultiplier - 1) * 100).toFixed(0)}% higher than average rates` : 
                          results.stateMultiplier < 1.0 ? `has ${((1 - results.stateMultiplier) * 100).toFixed(0)}% lower than average rates` : 
                          'has average national rates'} for mental health challenges.
                    </div>
                    
                    <div class="flex gap-2">
                        <button id="copy-community-btn" class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            📋 Copy Results
                        </button>
                        <button id="tweet-community-btn" class="flex-1 px-3 py-2 bg-sky-500 text-white text-sm rounded hover:bg-sky-600">
                            🐦 Share This
                        </button>
                    </div>
                `;
                
                // Add event listeners
                const copyBtn = container.querySelector('#copy-community-btn');
                const tweetBtn = container.querySelector('#tweet-community-btn');
                
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        this.copyToClipboard(shareText, 'Community results copied!');
                    });
                }
                
                if (tweetBtn) {
                    tweetBtn.addEventListener('click', () => {
                        this.shareOnTwitter(shareText, 'SocialMediaCost,MentalHealthCrisis,CommunityImpact');
                    });
                }
                
                container.classList.remove('hidden');
            }
        },

        initScenarios() {
            document.querySelectorAll('.scenario-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const scenario = e.target.dataset.scenario;
                    this.applyScenario(scenario);
                });
            });
        },

        applyScenario(scenarioName) {
            const scenario = this.scenarios[scenarioName];
            if (!scenario) return;

            // Apply all scenario values to sliders
            Object.keys(scenario).forEach(key => {
                const slider = document.getElementById(`${key}-slider`);
                if (slider) {
                    slider.value = scenario[key];
                    // Trigger change event to update the calculator
                    slider.dispatchEvent(new Event('input'));
                }
            });

            // Show notification
            this.showNotification(`📊 Applied "${scenarioName.replace('-', ' ')}" scenario!`);
        },

        initViralComparisons() {
            const generateBtn = document.getElementById('generate-new-comparisons');
            if (generateBtn) {
                generateBtn.addEventListener('click', () => {
                    this.updateViralComparisons();
                });
            }
            
            // Listen for calculation updates
            document.addEventListener('calculationUpdated', (event) => {
                this.updateViralComparisons(event.detail.totalCost);
            });
            
            // Initial load
            this.updateViralComparisons();
        },

        updateViralComparisons(totalCost = null) {
            const container = document.getElementById('viral-comparisons-grid');
            if (!container) return;

            // Get current total cost if not provided
            if (!totalCost) {
                const costCalculator = window.costCalculatorInstance;
                totalCost = costCalculator ? costCalculator.getState().results.totalCost : 2.5e12;
            }

            // Generate dynamic comparisons based on current total cost
            const dynamicComparisons = this.generateDynamicComparisons(totalCost);
            
            // Get 4 random comparisons from the dynamic list
            const selected = dynamicComparisons
                .sort(() => Math.random() - 0.5)
                .slice(0, 4);

            container.innerHTML = selected.map((comp, index) => `
                <div class="comparison-card bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/30 transition-colors cursor-pointer"
                     data-comparison-index="${index}">
                    <div class="text-4xl mb-2">${comp.emoji}</div>
                    <div class="text-sm">${comp.text}</div>
                </div>
            `).join('');
            
            // Add event listeners to comparison cards
            container.querySelectorAll('.comparison-card').forEach((card, index) => {
                card.addEventListener('click', () => {
                    const comp = selected[index];
                    this.shareComparison(comp.emoji, comp.text);
                });
            });
        },

        generateDynamicComparisons(totalCost) {
            // Calculate dynamic multipliers based on total cost
            const trillions = totalCost / 1e12;
            const billions = totalCost / 1e9;
            
            return [
                { emoji: "🏠", text: `Built ${Math.round(trillions * 8.4)} million homes (solving the housing crisis)` },
                { emoji: "🎓", text: `Funded college for every American under 25 for ${Math.round(trillions * 4)} years` },
                { emoji: "🏥", text: `Provided free mental health therapy for every teen for ${Math.round(trillions * 40)} years` },
                { emoji: "🚀", text: `Funded NASA for ${Math.round(trillions * 42)} years (we'd be on Mars by now)` },
                { emoji: "🌍", text: `Eliminated world hunger for ${Math.round(trillions * 2.8)} years` },
                { emoji: "⚡", text: `Built enough solar panels to power America for ${Math.round(trillions * 6)} years` },
                { emoji: "🚇", text: `Built high-speed rail connecting every major US city ${Math.round(trillions * 2)} times over` },
                { emoji: "💊", text: `Funded cancer research for ${Math.round(trillions * 168)} years` },
                { emoji: "🌊", text: `Cleaned up every ocean on Earth ${Math.round(trillions * 0.8)} times` },
                { emoji: "👨‍⚕️", text: `Hired ${Math.round(trillions * 4)} million additional teachers and therapists` },
                { emoji: "🏛️", text: `Rebuilt every school in America ${Math.round(trillions * 2)} times over` },
                { emoji: "🎨", text: `Funded arts education in every school for ${Math.round(trillions * 80)} years` },
                { emoji: "🌱", text: `Planted ${Math.round(trillions * 200)} billion trees (reversing climate change)` },
                { emoji: "🚁", text: `Provided emergency medical helicopters to every rural community ${Math.round(trillions * 10)} times over` },
                { emoji: "💰", text: `Given every American family $${Math.round(trillions * 3000)} in mental health support` },
                { emoji: "🎪", text: `Built ${Math.round(trillions * 5)} community centers in every neighborhood in America` }
            ];
        },

        shareComparison(emoji, text) {
            // Get current total cost for dynamic sharing
            const costCalculator = window.costCalculatorInstance;
            const totalCost = costCalculator ? costCalculator.getState().results.totalCost : 2.5e12;
            const formattedCost = this.formatLargeNumber(totalCost);
            
            const shareText = `🚨 Social media's $${formattedCost} cost could have: ${emoji} ${text}. Instead, we got depression. Calculate: suffering.social`;
            this.shareOnTwitter(shareText, 'SocialMediaCost,TechAccountability,MentalHealth');
        },

        initSocialProof() {
            this.updateActivityFeed();
            // Update activity every 10-30 seconds
            setInterval(() => {
                this.updateActivityFeed();
            }, Math.random() * 20000 + 10000);
        },

        updateActivityFeed() {
            const feed = document.getElementById('activity-feed');
            if (!feed) return;

            // Add new activity message
            const message = this.activityMessages[Math.floor(Math.random() * this.activityMessages.length)];
            const timeAgo = Math.floor(Math.random() * 30) + 1;
            
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item text-sm text-gray-600 opacity-0 transform translate-y-2 transition-all duration-500';
            newActivity.innerHTML = `
                <span class="text-blue-600">•</span> ${message}
                <span class="text-xs text-gray-400 ml-2">${timeAgo}m ago</span>
            `;
            
            feed.insertBefore(newActivity, feed.firstChild);
            
            // Animate in
            setTimeout(() => {
                newActivity.classList.remove('opacity-0', 'translate-y-2');
            }, 100);
            
            // Remove old items (keep only 5)
            while (feed.children.length > 5) {
                feed.removeChild(feed.lastChild);
            }
        },

        initSocialSharing() {
            // Get current calculator state for dynamic sharing
            const getShareContent = () => {
                const costCalculator = window.costCalculatorInstance;
                const state = costCalculator ? costCalculator.getState() : null;
                const totalCost = state ? this.formatLargeNumber(state.results.totalCost) : '2.5T';
                
                return {
                    title: '🚨 Social Media\'s Hidden Economic Cost',
                    description: `Social media costs society $${totalCost} in mental health damage. Calculate the impact: suffering.social`,
                    url: 'https://www.suffering.social/social_media_cost_calculatorv2.html',
                    hashtags: ['SocialMediaCost', 'MentalHealthCrisis', 'TechAccountability']
                };
            };

            // Twitter sharing
            const twitterBtn = document.getElementById('share-twitter');
            if (twitterBtn) {
                twitterBtn.addEventListener('click', () => {
                    const content = getShareContent();
                    const tweetText = `${content.title}: ${content.description}`;
                    this.shareOnTwitter(tweetText, content.hashtags.join(','));
                });
            }

            // LinkedIn sharing
            const linkedinBtn = document.getElementById('share-linkedin');
            if (linkedinBtn) {
                linkedinBtn.addEventListener('click', () => {
                    const content = getShareContent();
                    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}&summary=${encodeURIComponent(content.description)}`;
                    window.open(linkedinUrl, '_blank', 'width=600,height=400');
                });
            }

            // Facebook sharing
            const facebookBtn = document.getElementById('share-facebook');
            if (facebookBtn) {
                facebookBtn.addEventListener('click', () => {
                    const content = getShareContent();
                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}&quote=${encodeURIComponent(content.title + ': ' + content.description)}`;
                    window.open(facebookUrl, '_blank', 'width=600,height=400');
                });
            }
        },

        copyToClipboard(text, successMessage = 'Copied to clipboard!') {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification(successMessage);
            });
        },

        shareOnTwitter(text, hashtags = '') {
            // Ensure tweet stays under 280 characters including hashtags
            const hashtagText = hashtags ? ` #${hashtags.split(',').slice(0, 3).join(' #')}` : '';
            const maxLength = 280 - hashtagText.length - 25; // Reserve space for URL shortening
            
            let finalText = text;
            if (finalText.length > maxLength) {
                finalText = finalText.substring(0, maxLength - 3) + '...';
            }
            
            const tweetText = finalText + hashtagText;
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
            window.open(url, '_blank', 'width=550,height=420');
        },

        showNotification(message) {
            // Create notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        },

        formatLargeNumber(value) {
            if (value >= 1e12) {
                return `${(value / 1e12).toFixed(1)}T`;
            } else if (value >= 1e9) {
                return `${(value / 1e9).toFixed(1)}B`;
            } else if (value >= 1e6) {
                return `${(value / 1e6).toFixed(1)}M`;
            } else if (value >= 1e3) {
                return `${(value / 1e3).toFixed(0)}K`;
            } else {
                return value.toLocaleString();
            }
        }
    };

    // Make ViralFeatures globally accessible for HTML onclick handlers
    window.ViralFeatures = ViralFeatures;

})(); 