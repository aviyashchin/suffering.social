/**
 * Social Media Cost Calculator - Ultra Clean Implementation
 * 
 * Following .cursorrules: readable over performant, no placeholders, modern JS
 */

import { SCENARIOS, RANGES, DEFAULTS } from './utils/constants.js';
import { formatCurrency, formatSliderValue } from './utils/formatters.js';
import { generateDistributionData, getDistributionSummary } from './utils/distributions.js';
import { generatePopupHTML } from './utils/citations.js';

class SocialMediaCalculator {
  constructor() {
    this.parameters = { ...DEFAULTS };
    this.charts = {};
    this.startTime = Date.now();
    
    this.init();
  }

  init() {
    console.log('🧮 Calculator starting...');
    
    // Simple, sequential initialization
    this.setupEventListeners();
    this.setupCharts();
    this.setupD3Sliders();
    this.startRealTimeUpdates();
    this.updateAllDisplays();
    
    console.log('✅ Calculator ready');
  }

  // ==============================================================================
  // CORE CALCULATIONS (Clear & Auditable)
  // ==============================================================================

  calculateResults() {
    const { vsl, suicides, attribution, depression, yld, qol, healthcare, productivity, duration } = this.parameters;

    // Simple, readable formulas
    const mortalityCost = suicides * (attribution / 100) * vsl;
    const annualQALYValue = vsl / 75;
    const mentalHealthCost = depression * yld * (qol / 100) * annualQALYValue;
    const healthcareCost = depression * (healthcare + productivity) * duration;
    const totalCost = mortalityCost + mentalHealthCost + healthcareCost;

    return {
      mortality: mortalityCost,
      mentalHealth: mentalHealthCost,
      healthcare: healthcareCost,
      total: totalCost,
      gdpPercentage: (totalCost / 24000000000000) * 100,
      formulas: {
        mortality: `${Math.round(suicides/1000)}K × ${attribution}% × ${formatCurrency(vsl)} = ${formatCurrency(mortalityCost)}`,
        mentalHealth: `${Math.round(depression/1000000)}M × ${yld}yr × ${qol}% × ${formatCurrency(annualQALYValue)} = ${formatCurrency(mentalHealthCost)}`,
        healthcare: `${Math.round(depression/1000000)}M × ${formatCurrency(healthcare + productivity)} × ${duration}yr = ${formatCurrency(healthcareCost)}`
      }
    };
  }

  // ==============================================================================
  // D3.js SLIDER SETUP (Professional Distribution Sliders)
  // ==============================================================================

  setupD3Sliders() {
    console.log('🎚️ Setting up D3 distribution sliders...');
    
    // Wait for D3 to be available
    if (typeof d3 === 'undefined' || typeof window.D3SliderManager === 'undefined') {
      setTimeout(() => this.setupD3Sliders(), 100);
      return;
    }

    try {
      // Create D3 slider manager
      this.d3SliderManager = new window.D3SliderManager(this);
      
      // Initialize all sliders
      this.d3SliderManager.initialize();
      
      // Update parameters from slider initial values
      Object.keys(this.d3SliderManager.configs).forEach(param => {
        const slider = this.d3SliderManager.sliders[param];
        if (slider) {
          this.parameters[param] = slider.getValue();
        }
      });
      
      console.log('✅ D3 sliders setup complete');
    } catch (error) {
      console.error('❌ Failed to setup D3 sliders:', error);
      // Fallback to basic functionality
      this.setupBasicSliders();
    }
  }

  setupBasicSliders() {
    console.log('🔄 Setting up basic fallback sliders...');
    
    const sliders = [
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

    sliders.forEach(({ id, param, valueId, type }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(valueId);
      
      if (!slider || !valueDisplay) return;

      // Configure with range data
      const range = RANGES[param];
      if (range) {
        Object.assign(slider, range);
        slider.value = DEFAULTS[param];
      }

      // Set initial display
      valueDisplay.textContent = formatSliderValue(type, slider.value);

      // Update on change with validation
      slider.addEventListener('input', () => {
        const value = this.validateParameterValue(param, parseFloat(slider.value));
        if (value !== null) {
          this.parameters[param] = value;
          valueDisplay.textContent = formatSliderValue(type, value);
          
          this.updateAllDisplays();
        }
      });
    });
  }

  // ==============================================================================
  // DISPLAY UPDATES (Simple & Direct)
  // ==============================================================================

  updateAllDisplays() {
    const results = this.calculateResults();

    // Update main displays
    this.updateElement('total-cost', formatCurrency(results.total));
    this.updateElement('total-amount-value', Math.floor(results.total).toLocaleString('en-US'));
    this.updateElement('gdp-percentage', `${results.gdpPercentage.toFixed(1)}%`);

    // Update formula results
    this.updateElement('mortality-result', results.formulas.mortality);
    this.updateElement('mental-result', results.formulas.mentalHealth);
    this.updateElement('healthcare-result', results.formulas.healthcare);

    // Update charts
    this.updateCharts(results);
  }

  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) element.textContent = content;
  }

  // ==============================================================================
  // CHARTS (Simplified)
  // ==============================================================================

  setupCharts() {
    if (typeof Chart === 'undefined') {
      setTimeout(() => this.setupCharts(), 100);
      return;
    }

    this.createPieChart();
    this.createTimelineChart();
  }

  createPieChart() {
    const canvas = document.getElementById('pie-chart');
    if (!canvas) return;

    this.charts.pie = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Mortality', 'Mental Health', 'Healthcare & Productivity'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#dc2626', '#8b5cf6', '#059669'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true }},
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createTimelineChart() {
    const canvas = document.getElementById('timeline-chart');
    if (!canvas) return;

    // Generate timeline data
    const years = Array.from({length: 16}, (_, i) => (2009 + i).toString());
    const results = this.calculateResults();
    const costs = years.map((_, i) => results.total * (i / 15));

    this.charts.timeline = new Chart(canvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Annual Cost',
          data: costs,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value) }}
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (context) => `Cost: ${formatCurrency(context.parsed.y)}` }}
        }
      }
    });
  }

  updateCharts(results) {
    if (this.charts.pie) {
      this.charts.pie.data.datasets[0].data = [results.mortality, results.mentalHealth, results.healthcare];
      this.charts.pie.update('none');
    }

    if (this.charts.timeline) {
      const newData = this.charts.timeline.data.labels.map((_, i) => 
        results.total * (i / (this.charts.timeline.data.labels.length - 1))
      );
      this.charts.timeline.data.datasets[0].data = newData;
      this.charts.timeline.update('none');
    }
  }

  // ==============================================================================
  // D3.js SLIDER INTEGRATION
  // ==============================================================================

  updateParameterFromSlider(param, value) {
    // Called by D3 sliders when values change
    const validValue = this.validateParameterValue(param, value);
    if (validValue !== null) {
      this.parameters[param] = validValue;
      this.updateAllDisplays();
    }
  }

  // ==============================================================================
  // EVENT HANDLING (Modern & Clean)
  // ==============================================================================

  setupEventListeners() {
    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        this.loadScenario(e.target.dataset.scenario);
      });
    });

    // Info buttons
    this.setupInfoButtons();

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        this.shareResults(e.target.dataset.platform);
      });
    });
  }

  setupInfoButtons() {
    // Create info modal
    const modal = this.createInfoModal();
    document.body.appendChild(modal);

    // Add click listeners
    document.querySelectorAll('.info-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.showInfoModal(button.dataset.parameter);
      });
    });
  }

  createInfoModal() {
    const modal = document.createElement('div');
    modal.id = 'info-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">Parameter Information</h3>
            <button id="close-info-modal" class="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
          </div>
          <div id="info-modal-content" class="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    `;

    // Close handlers
    modal.querySelector('#close-info-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

    return modal;
  }

  showInfoModal(parameterKey) {
    const modal = document.getElementById('info-modal');
    const content = document.getElementById('info-modal-content');
    
    if (modal && content) {
      content.innerHTML = generatePopupHTML(parameterKey);
      modal.classList.remove('hidden');
    }
  }

  loadScenario(scenarioKey) {
    const scenario = SCENARIOS[scenarioKey];
    if (!scenario) return;

    console.log(`🎯 Loading scenario: ${scenario.name || scenarioKey}`);

    // Update parameters
    Object.assign(this.parameters, scenario.values);

    // Update D3 sliders if available
    if (this.d3SliderManager) {
      Object.entries(scenario.values).forEach(([param, value]) => {
        this.d3SliderManager.updateSlider(param, value);
      });
    } else {
      // Fallback: Update basic HTML sliders and displays
      Object.entries(scenario.values).forEach(([param, value]) => {
        const slider = document.getElementById(`${param}-slider`);
        const valueDisplay = document.getElementById(`${param}-value`);
        
        if (slider) slider.value = value;
        if (valueDisplay) {
          valueDisplay.textContent = formatSliderValue(param, value);
        }
      });
    }

    this.updateAllDisplays();

    // Visual feedback
    document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-scenario="${scenarioKey}"]`)?.classList.add('active');
  }

  shareResults(platform) {
    const results = this.calculateResults();
    const text = `Social media's hidden cost to society: ${formatCurrency(results.total)} - ${window.location.href}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  }

  // ==============================================================================
  // REAL-TIME UPDATES (Simplified)
  // ==============================================================================

  startRealTimeUpdates() {
    // Update running total every second
    setInterval(() => {
      const elapsedSeconds = (Date.now() - this.startTime) / 1000;
      const results = this.calculateResults();
      const costPerSecond = results.total / (365.25 * 24 * 3600);
      const runningCost = costPerSecond * elapsedSeconds;
      
      this.updateElement('running-total', formatCurrency(runningCost));
    }, 1000);

    // Update main total display
    setInterval(() => {
      const results = this.calculateResults();
      this.updateElement('total-amount-value', Math.floor(results.total).toLocaleString('en-US'));
    }, 100);
  }

  // ==============================================================================
  // VALIDATION & ERROR HANDLING
  // ==============================================================================

  validateParameterValue(param, value) {
    if (isNaN(value) || !isFinite(value)) return null;
    
    const range = RANGES[param];
    if (!range) return value;
    
    return Math.max(range.min, Math.min(range.max, value));
  }

  handleError(context, error) {
    console.error(`Calculator error in ${context}:`, error);
    
    // User-friendly error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">⚠️</span>
        <span>Calculator temporarily unavailable. Please refresh the page.</span>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  getResults() {
    try {
      return this.calculateResults();
    } catch (error) {
      this.handleError('getResults', error);
      return null;
    }
  }

  updateParameter(param, value) {
    try {
      const validValue = this.validateParameterValue(param, value);
      if (validValue !== null) {
        this.parameters[param] = validValue;
        this.updateAllDisplays();
        
        // Update D3 slider if it exists and the update didn't come from the slider itself
        if (this.d3SliderManager && this.d3SliderManager.sliders[param]) {
          const currentSliderValue = this.d3SliderManager.getSliderValue(param);
          if (Math.abs(currentSliderValue - validValue) > 0.001) {
            this.d3SliderManager.updateSlider(param, validValue);
          }
        }
      }
    } catch (error) {
      this.handleError('updateParameter', error);
    }
  }
}

// Initialize calculator
function initializeCalculator() {
  const init = () => {
    window.calculator = new SocialMediaCalculator();
    
    // Add window resize handler for D3 sliders
    window.addEventListener('resize', () => {
      if (window.calculator && window.calculator.d3SliderManager) {
        window.calculator.d3SliderManager.handleResize();
      }
    });
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

window.formatCurrency = formatCurrency;
initializeCalculator();

export default SocialMediaCalculator; 