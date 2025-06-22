// JavaScript moved from HTML. See main file for logic. 

// Modular refactor of the Social Media Cost Calculator

/**
 * Central state object for all calculator parameters and results
 */
const state = {
  vsl: 13.7,
  suicides: 110000,
  attribution: 18,
  depression: 4000000,
  yld: 6,
  qol: 35,
  healthcare: 7000,
  productivity: 6000,
  duration: 4.5,
  // Results
  mortalityCost: 0,
  mentalHealthCost: 0,
  healthcareProductivityCost: 0,
  totalCost: 0,
  gdpPercentage: 0,
};

/**
 * Calculator: pure functions for cost calculations
 */
const Calculator = {
  /**
   * Calculate mortality cost
   */
  mortalityCost: (vsl, suicides, attribution) => (suicides * (attribution / 100)) * (vsl * 1e6),

  /**
   * Calculate mental health QALY cost
   */
  mentalHealthCost: (depression, yld, qol, vsl) => {
    const qalyLoss = depression * yld * (qol / 100);
    return qalyLoss * ((vsl * 1e6) / 75);
  },

  /**
   * Calculate healthcare & productivity cost
   */
  healthcareProductivityCost: (depression, healthcare, productivity, duration) => (
    depression * (healthcare + productivity) * duration
  ),

  /**
   * Calculate total cost
   */
  totalCost: (mortality, mental, healthcare) => mortality + mental + healthcare,

  /**
   * Calculate GDP percentage
   */
  gdpPercentage: (total, gdp = 24e12) => (total / gdp) * 100,
};

/**
 * UIManager: handles DOM updates, slider/input sync, dynamic profile, accessibility
 */
const UIManager = {
  /**
   * Update all slider and input values from state
   */
  updateSliders: () => {
    const sliderMap = [
      ['vsl', 'vsl'],
      ['suicides', 'suicides'],
      ['attribution', 'attribution'],
      ['depression', 'depression'],
      ['yld', 'yld'],
      ['qol', 'qol'],
      ['healthcare', 'healthcare'],
      ['productivity', 'productivity'],
      ['duration', 'duration'],
    ];
    sliderMap.forEach(([key, id]) => {
      const slider = document.getElementById(`${id}-slider`);
      const input = document.getElementById(`${id}-input`);
      const valueDisplay = document.getElementById(`${id}-value`);
      
      if (slider) slider.value = state[key];
      if (input) input.value = state[key];
      
      // Update value displays
      if (valueDisplay) {
        switch(id) {
          case 'vsl':
            valueDisplay.textContent = `$${state[key].toFixed(1)}M`;
            break;
          case 'suicides':
            valueDisplay.textContent = `${(state[key]/1000).toFixed(0)}K`;
            break;
          case 'attribution':
            valueDisplay.textContent = `${state[key]}%`;
            break;
          case 'depression':
            valueDisplay.textContent = `${(state[key]/1000000).toFixed(1)}M`;
            break;
          case 'yld':
            valueDisplay.textContent = `${state[key].toFixed(1)} years`;
            break;
          case 'qol':
            valueDisplay.textContent = `${state[key]}%`;
            break;
          case 'healthcare':
            valueDisplay.textContent = `$${state[key].toLocaleString()}`;
            break;
          case 'productivity':
            valueDisplay.textContent = `$${state[key].toLocaleString()}`;
            break;
          case 'duration':
            valueDisplay.textContent = `${state[key].toFixed(1)} years`;
            break;
        }
      }
    });
  },

  /**
   * Update all result displays from state
   */
  updateResults: () => {
    // Mortality
    const mortalityVal = document.getElementById('mortality-formula-result');
    if (mortalityVal) mortalityVal.textContent = `${state.suicides.toLocaleString()} × ${state.attribution}% × $${state.vsl.toFixed(1)}M = $${(state.mortalityCost/1e9).toFixed(1)}B`;
    const mortalityRes = document.getElementById('mortality-result');
    if (mortalityRes) mortalityRes.textContent = `$${(state.mortalityCost/1e9).toFixed(1)}B`;
    // Mental
    const mentalVal = document.getElementById('mental-formula-result');
    if (mentalVal) mentalVal.textContent = `${state.depression.toLocaleString()} × ${state.yld} × ${state.qol}% × $${((state.vsl*1e6)/75/1e3).toFixed(0)}K = $${(state.mentalHealthCost/1e9).toFixed(2)}B`;
    const mentalRes = document.getElementById('mental-result');
    if (mentalRes) mentalRes.textContent = `$${(state.mentalHealthCost/1e9).toFixed(2)}B`;
    // Healthcare
    const healthcareVal = document.getElementById('healthcare-formula-result');
    if (healthcareVal) healthcareVal.textContent = `${state.depression.toLocaleString()} × ($${state.healthcare.toLocaleString()} + $${state.productivity.toLocaleString()}) × ${state.duration} = $${(state.healthcareProductivityCost/1e9).toFixed(2)}B`;
    const healthcareRes = document.getElementById('healthcare-result');
    if (healthcareRes) healthcareRes.textContent = `$${(state.healthcareProductivityCost/1e9).toFixed(2)}B`;
    // Total
    const totalCost = document.getElementById('total-cost');
    if (totalCost) totalCost.textContent = `$${(state.totalCost/1e12).toFixed(2)} Trillion`;
    // GDP %
    const gdpPct = document.getElementById('gdp-percentage');
    if (gdpPct) gdpPct.textContent = `${state.gdpPercentage.toFixed(1)}%`;
    // Final equation
    const finalEq = document.getElementById('final-equation');
    if (finalEq) finalEq.textContent = `Total Cost = $${(state.mortalityCost/1e9).toFixed(1)}B + $${(state.mentalHealthCost/1e9).toFixed(2)}B + $${(state.healthcareProductivityCost/1e9).toFixed(2)}B = $${(state.totalCost/1e12).toFixed(2)} Trillion`;
  },

  /**
   * Update lifetime counters
   */
  updateLifetimeCounters: () => {
    const depressionEl = document.getElementById('lifetime-depression');
    if (depressionEl) depressionEl.textContent = state.depression.toLocaleString();
    const suicideEl = document.getElementById('lifetime-suicide');
    if (suicideEl) suicideEl.textContent = Math.round(state.suicides * state.attribution / 100).toLocaleString();
    const valueEl = document.getElementById('lifetime-value');
    if (valueEl) valueEl.textContent = '$' + (state.totalCost/1e6).toLocaleString(undefined, {maximumFractionDigits:0}) + 'M';
  },
};

/**
 * ChartManager: handles Chart.js chart creation and updates
 */
const ChartManager = {
  pieChart: null,
  timelineChart: null,
  
  /**
   * Initialize charts
   */
  init: () => {
    ChartManager.initPieChart();
    ChartManager.initTimelineChart();
  },

  /**
   * Initialize pie chart
   */
  initPieChart: () => {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    ChartManager.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['☠️ Death', '😞 Disability', '💸 Lost Productivity'],
        datasets: [{
          data: [750, 480, 862],
          backgroundColor: [
            '#dc2626', // Red for death
            '#7c3aed', // Purple for disability
            '#ea580c'  // Orange for lost productivity
          ],
          borderColor: [
            '#b91c1c',
            '#6d28d9',
            '#c2410c'
          ],
          borderWidth: 2,
          hoverBorderWidth: 3
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
              font: {
                size: 12
              },
              usePointStyle: true,
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const dataset = data.datasets[0];
                    const value = dataset.data[i];
                    const total = dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return {
                      text: `${label}: $${value.toFixed(1)}B (${percentage}%)`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor[i],
                      lineWidth: 2,
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const percent = ((value / total) * 100).toFixed(1);
                return `${context.label}: $${value.toFixed(1)}B (${percent}%)`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * Initialize timeline chart
   */
  initTimelineChart: () => {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;
    
    const timelineData = generateTimelineData();
    
    ChartManager.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timelineData.years,
        datasets: [
          {
            label: 'Total Cost',
            data: timelineData.totalData,
            borderColor: '#1f2937',
            backgroundColor: 'rgba(31, 41, 55, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4
          },
          {
            label: '☠️ Death',
            data: timelineData.deathData,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.05)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: '😞 Disability',
            data: timelineData.disabilityData,
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.05)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: '💸 Lost Productivity',
            data: timelineData.productivityData,
            borderColor: '#ea580c',
            backgroundColor: 'rgba(234, 88, 12, 0.05)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 11
              },
              usePointStyle: true,
              padding: 15
            }
          },
          title: {
            display: true,
            text: 'Cumulative Economic Impact (Billions USD)',
            font: {
              size: 14
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Year',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Cumulative Cost (Billions $)',
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            },
            beginAtZero: true
          }
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    });
  },

  /**
   * Update charts with new data
   */
  update: () => {
    if (ChartManager.pieChart) {
      ChartManager.pieChart.data.datasets[0].data = [
        state.mortalityCost / 1e9,
        state.mentalHealthCost / 1e9,
        state.healthcareProductivityCost / 1e9
      ];
      ChartManager.pieChart.update();
    }
    
    if (ChartManager.timelineChart) {
      const timelineData = generateTimelineData();
      ChartManager.timelineChart.data.labels = timelineData.years;
      ChartManager.timelineChart.data.datasets[0].data = timelineData.totalData;
      ChartManager.timelineChart.data.datasets[1].data = timelineData.deathData;
      ChartManager.timelineChart.data.datasets[2].data = timelineData.disabilityData;
      ChartManager.timelineChart.data.datasets[3].data = timelineData.productivityData;
      ChartManager.timelineChart.update();
    }
  },
};

// Global variables for animation and timing
let clockStartTime = Date.now();
let currentTotalCost = 0;
let clockInterval;
let debtClockInterval;
let currentAttributableSuicides = 0;
let currentAttributableDepression = 0;

/**
 * Utility functions
 */
const Utils = {
  /**
   * Format large numbers with appropriate suffixes
   */
  formatLargeNumber: (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  },

  /**
   * Animate count-up for numbers
   */
  animateCountUp: (element, toValue, options = {}) => {
    if (!element) return;
    const { duration = 900, prefix = '', suffix = '', decimals = 0, formatter = null } = options;
    const fromValue = parseFloat(element.getAttribute('data-prev') || '0');
    const start = performance.now();
    const diff = toValue - fromValue;
    
    function format(val) {
      if (formatter) return formatter(val);
      return prefix + val.toLocaleString(undefined, { maximumFractionDigits: decimals }) + suffix;
    }
    
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = fromValue + diff * progress;
      element.textContent = format(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = format(toValue);
        element.setAttribute('data-prev', toValue);
      }
    }
    requestAnimationFrame(step);
  },

  /**
   * Debounce function to limit function calls
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

/**
 * Main calculation function
 */
function calculateCosts() {
  console.log('calculateCosts called, currentTotalCost before:', currentTotalCost);
  
  // Update state from DOM elements
  const parameterIds = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
  parameterIds.forEach(id => {
    const slider = document.getElementById(`${id}-slider`);
    if (slider) {
      state[id] = parseFloat(slider.value);
    }
  });

  // Calculate attributable numbers
  currentAttributableSuicides = state.suicides * (state.attribution / 100);
  currentAttributableDepression = state.depression;

  // Calculate all costs
  state.mortalityCost = Calculator.mortalityCost(state.vsl, state.suicides, state.attribution);
  state.mentalHealthCost = Calculator.mentalHealthCost(state.depression, state.yld, state.qol, state.vsl);
  state.healthcareProductivityCost = Calculator.healthcareProductivityCost(state.depression, state.healthcare, state.productivity, state.duration);
  state.totalCost = Calculator.totalCost(state.mortalityCost, state.mentalHealthCost, state.healthcareProductivityCost);
  state.gdpPercentage = Calculator.gdpPercentage(state.totalCost);
  
  // Update current total for animations
  currentTotalCost = state.totalCost;
  
  console.log('calculateCosts completed, currentTotalCost after:', currentTotalCost);
  
  // Update UI
  UIManager.updateResults();

  const deathNarrativeEl = document.getElementById('death-narrative-number');
  if (deathNarrativeEl) {
      deathNarrativeEl.textContent = Math.round(currentAttributableSuicides).toLocaleString('en-US');
  }

  const disabilityNarrativeEl = document.getElementById('disability-narrative-number');
  if (disabilityNarrativeEl) {
      disabilityNarrativeEl.textContent = Math.round(currentAttributableDepression).toLocaleString('en-US');
  }
  
  UIManager.updateLifetimeCounters();
  debouncedUpdateCharts();
}

// Debounced chart update
const debouncedUpdateCharts = Utils.debounce(() => {
  ChartManager.update();
}, 300);

/**
 * Update dynamic displays (running totals, per-second counters)
 */
function updateDynamicDisplays() {
  const now = Date.now();
  const secondsElapsed = (now - clockStartTime) / 1000;
  const secondsInYear = 365.25 * 24 * 3600;
  const costPerSecondValue = currentTotalCost / secondsInYear;
  const accumulatedCost = costPerSecondValue * secondsElapsed;
  
  console.log('updateDynamicDisplays:', {
    currentTotalCost,
    costPerSecondValue,
    accumulatedCost,
    secondsElapsed
  });
  
  const runningTotalAmount = document.getElementById('running-total-amount');
  if (runningTotalAmount) {
    runningTotalAmount.textContent = accumulatedCost.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  const costPerSecondAmount = document.getElementById('cost-per-second-amount');
  if (costPerSecondAmount) {
    costPerSecondAmount.textContent = Utils.formatLargeNumber(costPerSecondValue);
  }
}

/**
 * Update national debt clock
 */
function updateNationalDebtClock() {
  const totalAmount = document.getElementById('national-debt-clock-total-amount');
  const perSecondAmount = document.getElementById('national-debt-clock-per-second-amount');
  
  // Calculate accumulated cost (same logic as updateDynamicDisplays)
  const now = Date.now();
  const secondsElapsed = (now - clockStartTime) / 1000;
  const secondsInYear = 365.25 * 24 * 3600;
  const costPerSecondValue = currentTotalCost / secondsInYear;
  const accumulatedCost = costPerSecondValue * secondsElapsed;
  
  // Total cost = base economic cost + accumulated real-time costs
  const totalCost = currentTotalCost + accumulatedCost;
  
  console.log('updateNationalDebtClock:', {
    currentTotalCost,
    accumulatedCost,
    totalCost,
    totalAmount: totalAmount?.textContent,
    perSecondAmount: perSecondAmount?.textContent
  });
  
  if (totalAmount) {
    totalAmount.textContent = totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  if (perSecondAmount) {
    perSecondAmount.textContent = Utils.formatLargeNumber(costPerSecondValue);
  }
}

/**
 * Generate timeline data for the chart
 */
function generateTimelineData() {
  const years = Array.from({length: 16}, (_, i) => 2009 + i);
  const deathData = [];
  const disabilityData = [];
  const productivityData = [];
  const totalData = [];

  // Calculate per-year costs
  const yearsElapsed = 2024 - 2009;
  const suicidesPerYear = state.suicides / yearsElapsed;
  const depressionPerYear = state.depression / yearsElapsed;

  for (let year = 2009; year <= 2024; year++) {
    const yearsSoFar = year - 2009 + 1;
    
    // Cumulative death costs (mortality)
    const cumulativeSuicides = suicidesPerYear * yearsSoFar * (state.attribution / 100);
    const deathCost = cumulativeSuicides * (state.vsl * 1e6);
    
    // Cumulative disability costs (mental health)
    const cumulativeDepression = depressionPerYear * yearsSoFar;
    const qalyLoss = cumulativeDepression * state.yld * (state.qol / 100);
    const disabilityCost = qalyLoss * ((state.vsl * 1e6) / 75);
    
    // Cumulative lost productivity costs (healthcare + productivity)
    const productivityCost = cumulativeDepression * (state.healthcare + state.productivity) * state.duration;
    
    deathData.push(deathCost / 1e9);
    disabilityData.push(disabilityCost / 1e9);
    productivityData.push(productivityCost / 1e9);
    totalData.push((deathCost + disabilityCost + productivityCost) / 1e9);
  }

  return { years, deathData, disabilityData, productivityData, totalData };
}

/**
 * Set up all event listeners
 */
function initEventHandlers() {
  // Link sliders to their numeric inputs and value displays
  const sliders = [
    { slider: 'vsl-slider', value: 'vsl-value', format: val => `$${parseFloat(val).toFixed(1)}M` },
    { slider: 'suicides-slider', value: 'suicides-value', format: val => `${(val / 1000).toFixed(0)}K` },
    { slider: 'attribution-slider', value: 'attribution-value', format: val => `${val}%` },
    { slider: 'depression-slider', value: 'depression-value', format: val => `${(val / 1000000).toFixed(1)}M`.replace('.0', 'M')},
    { slider: 'yld-slider', value: 'yld-value', format: val => `${parseFloat(val).toFixed(1)} years` },
    { slider: 'qol-slider', value: 'qol-value', format: val => `${val}%` },
    { slider: 'healthcare-slider', value: 'healthcare-value', format: val => `$${parseInt(val).toLocaleString()}` },
    { slider: 'productivity-slider', value: 'productivity-value', format: val => `$${parseInt(val).toLocaleString()}` },
    { slider: 'duration-slider', value: 'duration-value', format: val => `${parseFloat(val).toFixed(1)} years` }
  ];

  sliders.forEach(({ slider: sliderId, value: valueId, format }) => {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);

    if (slider) {
      // Update value display and recalculate when slider changes
      slider.addEventListener('input', () => {
        valueDisplay.textContent = format(slider.value);
        calculateCosts();
      });

      // Initial display update
      valueDisplay.textContent = format(slider.value);
    }
  });
  
  // Reset button
  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetToDefaults();
      calculateCosts();
    });
  }
  
  // Help popover logic
  const helpBtn = document.getElementById('help-btn');
  const helpPopover = document.getElementById('help-popover');
  const helpPopoverClose = document.getElementById('help-popover-close');
  
  if (helpBtn && helpPopover && helpPopoverClose) {
    helpBtn.addEventListener('click', () => {
      helpPopover.classList.toggle('hidden');
    });

    helpPopoverClose.addEventListener('click', () => {
      helpPopover.classList.add('hidden');
    });
  }
  
  // Causal Pathways pop-out logic
  const causalPopoutBtn = document.getElementById('causal-popout-btn');
  const causalModal = document.getElementById('causal-modal');
  const modalClose = document.getElementById('causal-modal-close');
  const diagram = document.getElementById('causal-diagram');
  const modalDiagram = document.getElementById('causal-diagram-modal');
  
  if (causalPopoutBtn && causalModal && modalClose && diagram && modalDiagram) {
    causalPopoutBtn.addEventListener('click', () => {
      causalModal.classList.remove('hidden');
      modalDiagram.innerHTML = diagram.innerHTML;
      if (window.mermaid) mermaid.init(undefined, modalDiagram);
    });
    
    modalClose.addEventListener('click', () => {
      causalModal.classList.add('hidden');
    });
    
    causalModal.addEventListener('click', (e) => {
      if (e.target === causalModal) {
        causalModal.classList.add('hidden');
      }
    });
  }

  const shareButton = document.getElementById('share-button');
  if (shareButton) {
    shareButton.addEventListener('click', () => {
      const totalCost = document.getElementById('total-cost').textContent;
      const gdpPercentage = document.getElementById('gdp-percentage').textContent;
      const text = `🤯 I just calculated the hidden social cost of social media, and it's over ${totalCost}. That's ${gdpPercentage} of US GDP. See the full breakdown and calculate your own estimate. #SocialMediaCost #MentalHealth`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    });
  }
}

/**
 * Initialize tooltips using Tippy.js
 */
function initTooltips() {
  const tooltipButtons = document.querySelectorAll('.info-button');
  tooltipButtons.forEach((button, index) => {
    const tooltipIds = [
      'tooltip-mortality', 'tooltip-mortality-vsl', 'tooltip-mortality-suicides', 'tooltip-mortality-attribution',
      'tooltip-qaly', 'tooltip-qaly-people', 'tooltip-qaly-yld', 'tooltip-qaly-qol',
      'tooltip-healthcare', 'tooltip-healthcare-costs', 'tooltip-healthcare-productivity', 'tooltip-healthcare-duration'
    ];
    
    const tooltipId = tooltipIds[index];
    const template = document.getElementById(tooltipId);
    
    if (template) {
      tippy(button, {
        content: template.innerHTML,
        allowHTML: true,
        theme: 'card',
        placement: 'top',
        arrow: true,
        animation: 'scale',
        duration: [200, 150],
        trigger: 'mouseenter focus',
        interactive: true,
        appendTo: () => document.body
      });
    }
  });
}

/**
 * App initialization
 */
function initApp() {
  try {
    console.log('initApp started');
    
    // Initialize charts
    ChartManager.init();
    
    // Initialize tooltips
    if (typeof tippy !== 'undefined') {
      initTooltips();
    }
    
    // Initialize Mermaid
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ 
        startOnLoad: true,
        theme: 'default',
        themeVariables: {
          primaryColor: '#667eea',
          primaryTextColor: '#2c3e50',
          primaryBorderColor: '#667eea',
          lineColor: '#667eea',
          fontSize: '14px'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      });
    }
    
    // Set up event handlers
    initEventHandlers();
    
    // Initial calculation and UI update - MUST happen before starting timers
    console.log('About to call calculateCosts');
    calculateCosts();
    UIManager.updateSliders();
    
    // Reset clock start time after initial calculation
    clockStartTime = Date.now();
    console.log('Clock start time set to:', clockStartTime);
    console.log('Current total cost after calculation:', currentTotalCost);
    
    // Start timers AFTER initial calculation
    console.log('Starting timers...');
    setInterval(updateDynamicDisplays, 100);
    setInterval(updateNationalDebtClock, 100);
    console.log('Timers started');
    
    console.log('Social Media Cost Calculator initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function resetToDefaults() {
  const defaults = {
    'vsl-slider': 13.7,
    'suicides-slider': 110000,
    'attribution-slider': 18,
    'depression-slider': 5000000,
    'yld-slider': 6,
    'qol-slider': 35,
    'healthcare-slider': 7000,
    'productivity-slider': 6000,
    'duration-slider': 4.5
  };

  for (const sliderId in defaults) {
    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.value = defaults[sliderId];
      // Manually trigger the input event to update everything
      slider.dispatchEvent(new Event('input'));
    }
  }
  currentTotalCost = 0; // Reset current total cost on reset
}

document.addEventListener('DOMContentLoaded', initApp); 