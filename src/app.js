/**
 * Main Application Orchestrator
 * 
 * Coordinates all calculator components and handles user interactions.
 * Initializes the calculator, sets up event listeners, and manages state.
 * 
 * @fileoverview Main application entry point and controller
 * @version 1.0.0
 */

import { createCalculator } from './components/Calculator.js';
import { SCENARIOS, RANGES, DEFAULTS, CALCULATION } from './utils/constants.js';
import { formatCurrency, formatSliderValue, formatPercentage } from './utils/formatters.js';
import { generateDistributionData, getDistributionSummary, getUncertaintyBounds } from './utils/distributions.js';
import { generatePopupHTML } from './utils/citations.js';

// Make formatCurrency globally available for Chart.js callbacks
window.formatCurrency = formatCurrency;

// Debug: Check if Chart.js is available
console.log('Chart.js available at module load:', typeof Chart !== 'undefined');

/**
 * Main Application class managing the entire calculator interface
 */
class SocialMediaCalculatorApp {
  constructor() {
    this.calculator = null;
    this.startTime = Date.now();
    this.runningCounterInterval = null;
    this.debtClockInterval = null; // Real debt clock ticker
    this.helpModalOpen = false;
    
    // Debounce timer for calculations
    this.calculationDebounceTimer = null;
    
    // Chart instances
    this.pieChart = null;
    this.timelineChart = null;
    this.distributionCharts = {}; // Store all 9 distribution charts
    
    // Debt clock state (will be set properly after calculator initialization)
    this.debtClockBaseAmount = 2481760000000; // Starting amount in 2024
    this.debtClockStartTime = Date.now();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Social Media Calculator...');
      
      // Initialize calculator engine
      this.calculator = createCalculator();
      
      // Set up UI components
      this.initializeUI();
      this.setupEventListeners();
      this.setupSliders();
      this.initializeDisplays();
      
      // Start real-time features
      this.startRunningCounter();
      this.startDebtClock();
      
      // Initialize charts with slight delay to ensure DOM is ready
      setTimeout(() => {
        this.initializeCharts();
        this.initializeDistributionCharts();
      }, 100);
      
      // Fallback: Try again after 2 seconds if charts didn't initialize
      setTimeout(() => {
        if (!this.pieChart || !this.timelineChart) {
          console.warn('Charts not initialized, trying fallback...');
          this.initializeChartsWithFallback();
        }
      }, 2000);
      
      console.log('✅ Calculator initialization complete');
      
      // Initial calculation and display update
      this.updateAllDisplays();
      
      // Initialize debt clock with actual calculated values
      this.resetDebtClock();
      
    } catch (error) {
      console.error('❌ Failed to initialize calculator:', error);
      this.showError('Failed to load calculator. Please refresh the page.');
    }
  }

  /**
   * Initialize UI components and basic setup
   */
  initializeUI() {
    // Ensure body has proper top padding for fixed header
    document.body.style.paddingTop = '80px';
    
    // Initialize help modal
    this.initializeHelpModal();
    
    // Set up scenario buttons
    this.initializeScenarioButtons();
    
    // Set up community calculator
    this.initializeCommunityCalculator();
    
    // Set up share functionality
    this.initializeShareFeatures();
    
    // Set up simple tooltips
    this.initializeTooltips();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Scenario button listeners
    document.querySelectorAll('.scenario-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const scenario = e.target.dataset.scenario;
        this.loadScenario(scenario);
      });
    });

    // Help button listeners
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');

    if (helpButton && helpModal && closeHelp) {
      helpButton.addEventListener('click', () => this.toggleHelpModal());
      closeHelp.addEventListener('click', () => this.closeHelpModal());
      
      // Close modal when clicking outside
      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
          this.closeHelpModal();
        }
      });
    }

    // Community calculator listener
    const communityButton = document.getElementById('calculate-community');
    if (communityButton) {
      communityButton.addEventListener('click', () => this.calculateCommunityImpact());
    }

    // Share button listeners
    document.querySelectorAll('.share-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const platform = e.target.dataset.platform;
        this.shareResults(platform);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.helpModalOpen) {
        this.closeHelpModal();
      }
      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        this.toggleHelpModal();
      }
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        this.loadScenario('reset');
      }
    });
  }

  /**
   * Set up all parameter sliders with proper ranges and event handlers
   */
  setupSliders() {
    const sliderConfigs = [
      { id: 'vsl-slider', param: 'vsl', valueId: 'vsl-value', type: 'vsl' },
      { id: 'suicides-slider', param: 'suicides', valueId: 'suicides-value', type: 'suicides' },
      { id: 'attribution-slider', param: 'attribution', valueId: 'attribution-value', type: 'attribution' },
      { id: 'depression-slider', param: 'depression', valueId: 'depression-value', type: 'depression' },
      { id: 'yld-slider', param: 'yld', valueId: 'yld-value', type: 'yld' },
      { id: 'qol-slider', param: 'qol', valueId: 'qol-value', type: 'qol' },
      { id: 'healthcare-slider', param: 'healthcare', valueId: 'healthcare-value', type: 'healthcare' },
      { id: 'productivity-slider', param: 'productivity', valueId: 'productivity-value', type: 'productivity' },
      { id: 'duration-slider', param: 'duration', valueId: 'duration-value', type: 'duration' }
    ];

    sliderConfigs.forEach(config => {
      const slider = document.getElementById(config.id);
      const valueDisplay = document.getElementById(config.valueId);
      
      if (!slider || !valueDisplay) {
        console.warn(`Slider or value display not found: ${config.id}`);
        return;
      }

      // Set slider attributes from RANGES
      const range = RANGES[config.param];
      if (range) {
        slider.min = range.min;
        slider.max = range.max;
        slider.step = range.step;
        slider.value = DEFAULTS[config.param];
      }

      // Update display immediately
      valueDisplay.textContent = formatSliderValue(config.type, slider.value);

      // Add event listener for real-time updates
      slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        valueDisplay.textContent = formatSliderValue(config.type, value);
        this.debouncedCalculation(config.param, value);
      });

      // Add accessibility
      slider.setAttribute('aria-label', `Adjust ${config.param}`);
    });
  }

  /**
   * Debounced calculation to prevent excessive updates
   */
  debouncedCalculation(parameterName, value) {
    clearTimeout(this.calculationDebounceTimer);
    this.calculationDebounceTimer = setTimeout(() => {
      this.updateParameter(parameterName, value);
    }, CALCULATION.CALCULATION_DEBOUNCE);
  }

  /**
   * Update a single parameter and refresh displays
   */
  updateParameter(parameterName, value) {
    try {
      this.calculator.updateParameter(parameterName, value);
      this.updateAllDisplays();
      
      // Update the distribution chart for this parameter
      this.updateDistributionChart(parameterName, value);
      
      // Reset debt clock when parameters change
      this.resetDebtClock();
    } catch (error) {
      console.error(`Error updating parameter ${parameterName}:`, error);
    }
  }

  /**
   * Load a scenario preset
   */
  loadScenario(scenarioKey) {
    const scenario = SCENARIOS[scenarioKey];
    if (!scenario) {
      console.warn(`Unknown scenario: ${scenarioKey}`);
      return;
    }

    console.log(`Loading scenario: ${scenario.name}`);

    try {
      // Update calculator with scenario values
      this.calculator.updateParameters(scenario.values);

      // Update all slider positions
      Object.entries(scenario.values).forEach(([param, value]) => {
        const slider = document.getElementById(`${param}-slider`);
        const valueDisplay = document.getElementById(`${param}-value`);
        
        if (slider) {
          slider.value = value;
        }
        
        if (valueDisplay) {
          const paramType = this.getParameterType(param);
          valueDisplay.textContent = formatSliderValue(paramType, value);
        }
      });

      // Update visual feedback for active scenario
      document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      const activeButton = document.querySelector(`[data-scenario="${scenarioKey}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }

      // Update all displays
      this.updateAllDisplays();
      
      // Update charts with new data
      this.updateCharts();
      
      // Update all distribution charts with new values
      this.updateAllDistributionCharts();

      // Reset debt clock to new scenario values
      this.resetDebtClock();

    } catch (error) {
      console.error(`Error loading scenario ${scenarioKey}:`, error);
      this.showError('Failed to load scenario. Please try again.');
    }
  }

  /**
   * Update all display elements with current calculation results
   */
  updateAllDisplays() {
    try {
      const results = this.calculator.getResults();
      
      // Ensure results exist and have valid values
      if (!results || typeof results.total !== 'number') {
        console.warn('Invalid results object:', results);
        return;
      }
      
      // Update main total displays (but let debt clock handle total-amount)
      // this.updateElement('total-amount', formatCurrency(results.total).replace('$', '').replace('T', ''));
      this.updateElement('total-result', formatCurrency(results.total));
      this.updateElement('gdp-percentage', `${(results.gdpPercentage || 0).toFixed(1)}%`);

      // Update formula displays if formulas exist
      if (results.formulas) {
        this.updateElement('mortality-formula', results.formulas.mortality?.formula || 'Loading...');
        this.updateElement('mortality-result', results.formulas.mortality?.result || '$0');
        
        this.updateElement('mental-formula', results.formulas.mentalHealth?.formula || 'Loading...');
        this.updateElement('mental-result', results.formulas.mentalHealth?.result || '$0');
        
        this.updateElement('healthcare-formula', results.formulas.healthcare?.formula || 'Loading...');
        this.updateElement('healthcare-result', results.formulas.healthcare?.result || '$0');
      }

      // Update top bar counters (simplified approximations)
      const parameters = results.parameters || {};
      const annualDepressionCases = parameters.depression || 0;
      const annualSuicides = (parameters.suicides || 0) * ((parameters.attribution || 0) / 100);
      
      this.updateElement('depression-counter', Math.round(annualDepressionCases / 1000000 * 10) / 10 + 'M');
      this.updateElement('suicide-counter', Math.round(annualSuicides / 1000) + 'K');

      // Update charts if they exist
      this.updateCharts();

    } catch (error) {
      console.error('Error updating displays:', error);
    }
  }

  /**
   * Initialize display elements with default values
   */
  initializeDisplays() {
    // Ensure all displays show initial values
    this.updateAllDisplays();
  }

  /**
   * Start the running cost counter
   */
  startRunningCounter() {
    this.runningCounterInterval = setInterval(() => {
      try {
        const elapsedSeconds = (Date.now() - this.startTime) / 1000;
        const runningCost = this.calculator.calculateRunningCost(elapsedSeconds);
        
        const counterElement = document.getElementById('running-counter');
        if (counterElement) {
          counterElement.textContent = formatCurrency(runningCost);
        }
      } catch (error) {
        console.error('Error updating running counter:', error);
      }
    }, CALCULATION.COUNTER_TICK || 1000);
  }

  /**
   * Start the real debt clock for the top bar
   */
  startDebtClock() {
    this.debtClockInterval = setInterval(() => {
      try {
        this.updateDebtClock();
      } catch (error) {
        console.error('Error updating debt clock:', error);
      }
    }, 100); // Update every 100ms for smooth ticking
  }

  /**
   * Update the debt clock display with real-time accumulation
   */
  updateDebtClock() {
    try {
      const results = this.calculator.getResults();
      const annualTotal = results.total || this.debtClockBaseAmount;
      
      // Calculate cost per second (more precise calculation)
      const costPerSecond = annualTotal / (365.25 * 24 * 3600); // Account for leap years
      
      // Calculate elapsed time since debt clock started
      const elapsedSeconds = (Date.now() - this.debtClockStartTime) / 1000;
      
      // Calculate current total (base amount + accumulated since start)
      const currentTotal = this.debtClockBaseAmount + (costPerSecond * elapsedSeconds);
      
      // Update top bar display with comma formatting
      const totalAmountElement = document.getElementById('total-amount');
      if (totalAmountElement) {
        // Format with commas: 2,481,760,123,456
        const formattedNumber = Math.floor(currentTotal).toLocaleString('en-US');
        totalAmountElement.textContent = formattedNumber;
      }

      // Also update any other total displays
      const totalDisplayElement = document.getElementById('total-display');
      if (totalDisplayElement) {
        const formattedTotal = formatCurrency(currentTotal);
        totalDisplayElement.textContent = formattedTotal;
      }

      const totalResultElement = document.getElementById('total-result');
      if (totalResultElement) {
        const formattedTotal = formatCurrency(currentTotal);
        totalResultElement.textContent = formattedTotal;
      }

      // Debug logging (remove after testing)
      if (Math.floor(elapsedSeconds) % 5 === 0 && elapsedSeconds > 0) {
        console.log(`🕰️ Debt clock: $${costPerSecond.toFixed(2)}/sec, elapsed: ${elapsedSeconds.toFixed(1)}s, total: ${formatCurrency(currentTotal)}`);
      }

    } catch (error) {
      console.error('Error in updateDebtClock:', error);
    }
  }

  /**
   * Reset debt clock when parameters change significantly
   */
  resetDebtClock() {
    try {
      const results = this.calculator.getResults();
      this.debtClockBaseAmount = results.total || this.debtClockBaseAmount;
      this.debtClockStartTime = Date.now();
      
      const costPerSecond = this.debtClockBaseAmount / (365.25 * 24 * 3600);
      console.log(`🕰️ Debt clock reset to base: ${formatCurrency(this.debtClockBaseAmount)} ($${costPerSecond.toFixed(2)}/sec)`);
    } catch (error) {
      console.error('Error resetting debt clock:', error);
    }
  }

  /**
   * Calculate and display community impact
   */
  calculateCommunityImpact() {
    try {
      const populationInput = document.getElementById('community-population');
      const stateSelect = document.getElementById('state-select');
      const resultsDiv = document.getElementById('community-results');

      if (!populationInput || !resultsDiv) {
        console.warn('Community calculator elements not found');
        return;
      }

      const population = parseInt(populationInput.value);
      const state = stateSelect ? stateSelect.value : 'national';

      if (isNaN(population) || population <= 0) {
        this.showError('Please enter a valid population size.');
        return;
      }

      const communityImpact = this.calculator.calculateCommunityImpact(population, state);

      resultsDiv.innerHTML = `
        <div class="text-sm">
          <div class="font-semibold text-green-700 mb-2">Estimated Impact for ${population.toLocaleString()} people:</div>
          <div class="grid gap-1 text-xs">
            <div><strong>Total Cost:</strong> ${formatCurrency(communityImpact.totalCost)}</div>
            <div><strong>Affected People:</strong> ${communityImpact.affectedPeople.toLocaleString()}</div>
            <div><strong>Excess Deaths:</strong> ${communityImpact.excessDeaths.toLocaleString()}</div>
          </div>
        </div>
      `;

      resultsDiv.classList.remove('hidden');

    } catch (error) {
      console.error('Error calculating community impact:', error);
      this.showError('Failed to calculate community impact. Please check your inputs.');
    }
  }

  /**
   * Initialize help modal
   */
  initializeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      // Initially hidden
      modal.classList.add('hidden');
    }
  }

  /**
   * Toggle help modal visibility
   */
  toggleHelpModal() {
    const modal = document.getElementById('help-modal');
    if (!modal) return;

    if (this.helpModalOpen) {
      this.closeHelpModal();
    } else {
      this.openHelpModal();
    }
  }

  /**
   * Open help modal
   */
  openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    this.helpModalOpen = true;

    // Focus management for accessibility
    const closeButton = modal.querySelector('#close-help');
    if (closeButton) {
      closeButton.focus();
    }
  }

  /**
   * Close help modal
   */
  closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    this.helpModalOpen = false;

    // Return focus to help button
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
      helpButton.focus();
    }
  }

  /**
   * Initialize scenario buttons
   */
  initializeScenarioButtons() {
    // Mark reset as active by default
    const resetButton = document.querySelector('[data-scenario="reset"]');
    if (resetButton) {
      resetButton.classList.add('active');
    }
  }

  /**
   * Initialize community calculator with state options
   */
  initializeCommunityCalculator() {
    const stateSelect = document.getElementById('state-select');
    if (!stateSelect) return;

    // States are already in HTML, just ensure default is selected
    stateSelect.value = 'national';
  }

  /**
   * Initialize share features
   */
  initializeShareFeatures() {
    // Share functionality ready - individual handlers added in setupEventListeners
  }

  /**
   * Initialize tooltip and info popup system
   */
  initializeTooltips() {
    // Create popup modal for detailed information
    const infoModal = document.createElement('div');
    infoModal.id = 'info-modal';
    infoModal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4';
    infoModal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">Parameter Information</h3>
            <button id="close-info-modal" class="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div id="info-modal-content" class="text-sm text-gray-600">
            Loading...
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(infoModal);

    // Add click listeners to info buttons
    document.querySelectorAll('.info-btn').forEach(button => {
      const parameterKey = button.dataset.parameter;
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showInfoModal(parameterKey);
      });
    });

    // Close modal functionality
    const closeModal = () => {
      infoModal.classList.add('hidden');
    };

    document.getElementById('close-info-modal').addEventListener('click', closeModal);
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) {
        closeModal();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  /**
   * Show info modal with parameter details
   */
  showInfoModal(parameterKey) {
    try {
      const modal = document.getElementById('info-modal');
      const content = document.getElementById('info-modal-content');
      
      if (!modal || !content) {
        console.warn('Info modal elements not found');
        return;
      }

      // Generate content using citations utility
      const htmlContent = generatePopupHTML(parameterKey);
      content.innerHTML = htmlContent;

      // Show modal
      modal.classList.remove('hidden');
      
      // Focus management for accessibility
      const closeButton = document.getElementById('close-info-modal');
      if (closeButton) {
        closeButton.focus();
      }

    } catch (error) {
      console.error(`Error showing info modal for ${parameterKey}:`, error);
    }
  }

  /**
   * Share results on social media
   */
  shareResults(platform) {
    try {
      const results = this.calculator.getResults();
      const totalCost = formatCurrency(results.total);
      
      const shareTexts = {
        twitter: `Social media's hidden cost to society: ${totalCost}. Calculate your community's impact: ${window.location.href}`,
        linkedin: `New research quantifies social media's economic impact: ${totalCost} in societal costs. ${window.location.href}`,
        facebook: `Research shows social media costs society ${totalCost} annually through mental health impacts. ${window.location.href}`
      };

      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts.twitter)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
      };

      const url = shareUrls[platform];
      if (url) {
        window.open(url, '_blank', 'width=600,height=400');
      }

    } catch (error) {
      console.error(`Error sharing on ${platform}:`, error);
    }
  }

  /**
   * Initialize Chart.js charts
   */
  initializeCharts(retryCount = 0) {
    try {
      // Wait for Chart.js to load
      if (typeof Chart === 'undefined') {
        if (retryCount < 50) { // Try for 5 seconds max
          console.log(`Chart.js not loaded yet, retrying... (${retryCount + 1}/50)`);
          setTimeout(() => this.initializeCharts(retryCount + 1), 100);
          return;
        } else {
          console.error('Chart.js failed to load after 5 seconds');
          return;
        }
      }

      console.log('Chart.js loaded, initializing charts...');

      // Debug: Check canvas elements
      this.debugCanvasElements();

      // Initialize pie chart
      this.initializePieChart();
      
      // Initialize timeline chart
      this.initializeTimelineChart();

    } catch (error) {
      console.error('Error initializing charts:', error);
      
      // Try to reinitialize charts after a delay if there was an error
      if (retryCount < 3) {
        console.log(`Retrying chart initialization after error... (${retryCount + 1}/3)`);
        setTimeout(() => this.initializeCharts(retryCount + 1), 1000);
      }
    }
  }

  /**
   * Initialize the cost breakdown pie chart
   */
  initializePieChart() {
    const canvas = document.getElementById('pie-chart');
    if (!canvas) {
      console.warn('Pie chart canvas not found');
      return;
    }

    console.log('Initializing pie chart...');
    const results = this.calculator.getResults();
    
    this.pieChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Mortality', 'Mental Health', 'Healthcare & Productivity'],
        datasets: [{
          data: [
            results.mortality || 0,
            results.mentalHealth || 0, 
            results.healthcare || 0
          ],
          backgroundColor: [
            '#dc2626', // Red for mortality
            '#8b5cf6', // Purple for mental health
            '#059669'  // Green for healthcare
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                // Use global formatCurrency function
                const formattedValue = window.formatCurrency ? window.formatCurrency(value) : `$${value.toLocaleString()}`;
                return `${context.label}: ${formattedValue} (${percentage}%)`;
              }
            }
          }
        },
        layout: {
          padding: 10
        }
      }
    });
    
    console.log('Pie chart initialized successfully');
  }

  /**
   * Initialize the timeline chart
   */
  initializeTimelineChart() {
    const canvas = document.getElementById('timeline-chart');
    if (!canvas) {
      console.warn('Timeline chart canvas not found');
      return;
    }

    console.log('Initializing timeline chart...');

    // Generate cumulative cost data from 2009 to 2024
    const years = [];
    const cumulativeCosts = [];
    const annualCost = this.calculator.getResults().total || 0;
    
    for (let year = 2009; year <= 2024; year++) {
      years.push(year.toString());
      // Assume gradual increase from 2009 to current levels
      const progress = (year - 2009) / (2024 - 2009);
      const yearCost = annualCost * progress;
      cumulativeCosts.push(yearCost);
    }

    this.timelineChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Annual Cost',
          data: cumulativeCosts,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                // Use global formatCurrency function
                return window.formatCurrency ? window.formatCurrency(value) : `$${value.toLocaleString()}`;
              },
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            },
            title: {
              display: true,
              text: 'Year',
              font: {
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const formattedValue = window.formatCurrency ? window.formatCurrency(context.parsed.y) : `$${context.parsed.y.toLocaleString()}`;
                return `Cost: ${formattedValue}`;
              }
            }
          }
        },
        elements: {
          point: {
            backgroundColor: '#dc2626'
          }
        },
        layout: {
          padding: 10
        }
      }
    });
    
    console.log('Timeline chart initialized successfully');
  }

  /**
   * Debug canvas elements to ensure they're properly sized and positioned
   */
  debugCanvasElements() {
    const pieCanvas = document.getElementById('pie-chart');
    const timelineCanvas = document.getElementById('timeline-chart');
    
    console.log('=== ENHANCED Canvas Debug Info ===');
    console.log('Current window size:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Is desktop size (>= 1024px)?', window.innerWidth >= 1024);
    
    // Check layout containers
    const mainContainer = document.querySelector('.container');
    const gridContainer = document.querySelector('.lg\\:grid');
    const resultsSection = document.querySelector('.results-section');
    const chartsSection = document.querySelector('.charts-section');
    
    console.log('Layout containers:', {
      mainContainer: mainContainer ? mainContainer.getBoundingClientRect() : null,
      gridContainer: gridContainer ? gridContainer.getBoundingClientRect() : null,
      resultsSection: resultsSection ? resultsSection.getBoundingClientRect() : null,
      chartsSection: chartsSection ? chartsSection.getBoundingClientRect() : null
    });
    
    if (pieCanvas) {
      const pieRect = pieCanvas.getBoundingClientRect();
      const pieStyle = getComputedStyle(pieCanvas);
      const pieParent = pieCanvas.parentElement;
      const pieParentRect = pieParent ? pieParent.getBoundingClientRect() : null;
      
      console.log(`Pie chart canvas:`, {
        canvas: {
          width: pieRect.width,
          height: pieRect.height,
          visible: pieRect.width > 0 && pieRect.height > 0,
          display: pieStyle.display,
          visibility: pieStyle.visibility,
          opacity: pieStyle.opacity
        },
        parent: {
          className: pieParent?.className,
          width: pieParentRect?.width,
          height: pieParentRect?.height,
          display: pieParent ? getComputedStyle(pieParent).display : null
        }
      });
    } else {
      console.error('❌ Pie chart canvas not found in DOM');
    }
    
    if (timelineCanvas) {
      const timelineRect = timelineCanvas.getBoundingClientRect();
      const timelineStyle = getComputedStyle(timelineCanvas);
      const timelineParent = timelineCanvas.parentElement;
      const timelineParentRect = timelineParent ? timelineParent.getBoundingClientRect() : null;
      
      console.log(`Timeline chart canvas:`, {
        canvas: {
          width: timelineRect.width,
          height: timelineRect.height,
          visible: timelineRect.width > 0 && timelineRect.height > 0,
          display: timelineStyle.display,
          visibility: timelineStyle.visibility,
          opacity: timelineStyle.opacity
        },
        parent: {
          className: timelineParent?.className,
          width: timelineParentRect?.width,
          height: timelineParentRect?.height,
          display: timelineParent ? getComputedStyle(timelineParent).display : null
        }
      });
    } else {
      console.error('❌ Timeline chart canvas not found in DOM');
    }
    
    console.log('=== End Enhanced Canvas Debug ===');
  }

  /**
   * Initialize all 9 distribution charts for parameter sliders
   */
  initializeDistributionCharts() {
    console.log('🎯 Initializing distribution charts...');
    
    const parameters = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
    
    parameters.forEach(paramKey => {
      try {
        const canvas = document.getElementById(`${paramKey}-distribution`);
        if (!canvas) {
          console.warn(`Distribution chart canvas not found: ${paramKey}-distribution`);
          return;
        }

        console.log(`Creating distribution chart for ${paramKey}...`);
        
        // Get distribution data
        const distributionData = generateDistributionData(paramKey);
        if (!distributionData) {
          console.warn(`No distribution data for parameter: ${paramKey}`);
          return;
        }

        // Create Chart.js bar chart for distribution
        this.distributionCharts[paramKey] = new Chart(canvas, {
          type: 'bar',
          data: distributionData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: () => '',
                  label: (context) => {
                    return `Probability: ${(context.parsed.y * 100).toFixed(0)}%`;
                  }
                }
              }
            },
            scales: {
              x: {
                display: false, // Hide x-axis labels for compact view
                grid: { display: false }
              },
              y: {
                display: false, // Hide y-axis for compact view
                beginAtZero: true,
                max: 1.1,
                grid: { display: false }
              }
            },
            elements: {
              bar: {
                borderWidth: 0
              }
            },
            animation: {
              duration: 300 // Quick animations
            }
          }
        });

        console.log(`✅ Distribution chart created for ${paramKey}`);

        // Initialize statistics display
        this.updateDistributionStats(paramKey, DEFAULTS[paramKey]);

      } catch (error) {
        console.error(`❌ Error creating distribution chart for ${paramKey}:`, error);
      }
    });

    console.log('📊 Distribution charts initialization complete');
  }

  /**
   * Update a specific distribution chart when parameter changes
   */
  updateDistributionChart(parameterKey, currentValue) {
    try {
      const chart = this.distributionCharts[parameterKey];
      if (!chart) {
        console.warn(`Distribution chart not found for parameter: ${parameterKey}`);
        return;
      }

      // Generate new distribution data with current value highlighted
      const distributionData = generateDistributionData(parameterKey, currentValue);
      if (!distributionData) {
        console.warn(`Could not generate distribution data for: ${parameterKey}`);
        return;
      }

      // Update chart data
      chart.data = distributionData;
      chart.update('none'); // No animation for smooth real-time updates

      // Update statistics display
      this.updateDistributionStats(parameterKey, currentValue);

    } catch (error) {
      console.error(`Error updating distribution chart for ${parameterKey}:`, error);
    }
  }

  /**
   * Update statistics display for a distribution chart
   */
  updateDistributionStats(parameterKey, currentValue) {
    try {
      const statsElement = document.getElementById(`${parameterKey}-stats`);
      if (!statsElement) {
        console.warn(`Stats element not found for parameter: ${parameterKey}`);
        return;
      }

      // Get distribution summary and uncertainty bounds
      const summary = getDistributionSummary(parameterKey);
      const bounds = getUncertaintyBounds(parameterKey);
      
      if (!summary || !bounds) {
        console.warn(`Distribution data not found for parameter: ${parameterKey}`);
        return;
      }

      // Format values based on parameter type
      const formatValue = (value) => {
        if (summary.defaultValue >= 1000000) {
          // Large numbers (like depression count or VSL)
          if (summary.defaultValue >= 1000000000) {
            return `${(value / 1000000000).toFixed(1)}B`;
          } else {
            return `${(value / 1000000).toFixed(1)}M`;
          }
        } else if (summary.defaultValue >= 1000) {
          // Thousands (like healthcare costs)
          return `$${(value / 1000).toFixed(1)}K`;
        } else if (parameterKey === 'qol' || parameterKey === 'attribution') {
          // Percentages
          return `${value.toFixed(1)}%`;
        } else if (parameterKey === 'vsl') {
          // VSL in millions
          return `$${value.toFixed(1)}M`;
        } else {
          // Years and other small numbers
          return `${value.toFixed(1)}`;
        }
      };

      // Calculate mean (current default), median (same as mean for our simplified distributions)
      const mean = summary.defaultValue;
      const median = summary.defaultValue;
      const ciLower = bounds.lower;
      const ciUpper = bounds.upper;

      // Create statistics text
      const statsText = `Mean: ${formatValue(mean)} | Median: ${formatValue(median)} | 95% CI: [${formatValue(ciLower)}, ${formatValue(ciUpper)}]`;
      
      statsElement.textContent = statsText;

    } catch (error) {
      console.error(`Error updating distribution stats for ${parameterKey}:`, error);
    }
  }

  /**
   * Update all distribution charts with current parameter values
   */
  updateAllDistributionCharts() {
    try {
      const results = this.calculator.getResults();
      const parameters = results.parameters || {};
      
      Object.keys(this.distributionCharts).forEach(paramKey => {
        const currentValue = parameters[paramKey];
        if (currentValue !== undefined) {
          this.updateDistributionChart(paramKey, currentValue);
        }
      });
    } catch (error) {
      console.error('Error updating all distribution charts:', error);
    }
  }

  /**
   * Fallback chart initialization with simplified approach
   */
  initializeChartsWithFallback() {
    console.log('🚨 Attempting fallback chart initialization...');
    
    // Try to create simple test charts
    const pieCanvas = document.getElementById('pie-chart');
    const timelineCanvas = document.getElementById('timeline-chart');
    
    if (pieCanvas && typeof Chart !== 'undefined') {
      try {
        console.log('Creating fallback pie chart...');
        this.pieChart = new Chart(pieCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Mortality', 'Mental Health', 'Healthcare'],
            datasets: [{
              data: [500, 1500, 300],
              backgroundColor: ['#ef4444', '#8b5cf6', '#10b981'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { font: { size: 11 } }
              }
            }
          }
        });
        console.log('✅ Fallback pie chart created');
      } catch (error) {
        console.error('❌ Fallback pie chart failed:', error);
      }
    }
    
    if (timelineCanvas && typeof Chart !== 'undefined') {
      try {
        console.log('Creating fallback timeline chart...');
        this.timelineChart = new Chart(timelineCanvas, {
          type: 'line',
          data: {
            labels: ['2009', '2012', '2015', '2018', '2021', '2024'],
            datasets: [{
              label: 'Cost Growth',
              data: [100, 400, 800, 1500, 2000, 2500],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { font: { size: 10 } } },
              x: { ticks: { font: { size: 10 } } }
            }
          }
        });
        console.log('✅ Fallback timeline chart created');
      } catch (error) {
        console.error('❌ Fallback timeline chart failed:', error);
      }
    }
  }

  /**
   * Update charts with new calculation data
   */
  updateCharts() {
    try {
      const results = this.calculator.getResults();
      
      // Update pie chart
      if (this.pieChart) {
        this.pieChart.data.datasets[0].data = [
          results.mortality || 0,
          results.mentalHealth || 0,
          results.healthcare || 0
        ];
        this.pieChart.update('none'); // No animation for faster updates
      } else {
        console.warn('Pie chart not initialized yet');
      }

      // Update timeline chart
      if (this.timelineChart) {
        const annualCost = results.total || 0;
        const newData = [];
        
        for (let year = 2009; year <= 2024; year++) {
          const progress = (year - 2009) / (2024 - 2009);
          const yearCost = annualCost * progress;
          newData.push(yearCost);
        }
        
        this.timelineChart.data.datasets[0].data = newData;
        this.timelineChart.update('none'); // No animation for faster updates
      } else {
        console.warn('Timeline chart not initialized yet');
      }

    } catch (error) {
      console.error('Error updating charts:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Update element text content safely
   */
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    } else {
      console.warn(`Element not found: ${id}`);
    }
  }

  /**
   * Get parameter type for formatting
   */
  getParameterType(param) {
    const typeMap = {
      vsl: 'vsl',
      suicides: 'suicides',
      attribution: 'attribution',
      depression: 'depression',
      yld: 'yld',
      qol: 'qol',
      healthcare: 'healthcare',
      productivity: 'productivity',
      duration: 'duration'
    };
    return typeMap[param] || 'default';
  }

  /**
   * Show error message to user
   */
  showError(message) {
    console.error('User Error:', message);
    // Simple alert for now - could be enhanced with a proper notification system
    alert(message);
  }

  /**
   * Clean up resources when app is destroyed
   */
  destroy() {
    if (this.runningCounterInterval) {
      clearInterval(this.runningCounterInterval);
    }
    if (this.debtClockInterval) {
      clearInterval(this.debtClockInterval);
    }
    if (this.calculationDebounceTimer) {
      clearTimeout(this.calculationDebounceTimer);
    }

    // Destroy charts
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }

    // Destroy distribution charts
    Object.values(this.distributionCharts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.distributionCharts = {};
  }
}

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

/**
 * Initialize the application when DOM is ready
 */
function initializeApp() {
  console.log('Starting Social Media Calculator App...');
  
  // Create and initialize app instance
  const app = new SocialMediaCalculatorApp();
  
  // Make app globally available for debugging
  if (typeof window !== 'undefined') {
    window.calculatorApp = app;
  }
  
  // Initialize the app
  app.init().catch(error => {
    console.error('Failed to initialize app:', error);
  });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for module systems
export default SocialMediaCalculatorApp; 