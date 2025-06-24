/**
 * Social Media Cost Calculator - Configuration Constants
 * 
 * Single source of truth for all application configuration, default values,
 * scenarios, UI settings, and calculation parameters.
 * 
 * @fileoverview All configuration values for the calculator
 * @version 1.0.0
 */

// ============================================================================
// DEFAULT PARAMETER VALUES
// ============================================================================

export const DEFAULTS = {
  // Mortality costs parameters
  vsl: 13.7,              // Value of Statistical Life (millions USD)
  suicides: 110000,       // Excess suicides since 2009
  attribution: 18,        // % attributable to social media
  
  // Mental health parameters  
  depression: 5000000,    // Americans with SM-induced depression
  yld: 6.0,              // Years Lived with Disability
  qol: 35,               // Quality of Life reduction (%)
  
  // Healthcare & productivity parameters
  healthcare: 7000,       // Annual healthcare costs per person (USD)
  productivity: 6000,     // Annual productivity loss per person (USD)
  duration: 4.5,         // Treatment duration in years
  
  // Community calculator
  communityPopulation: 100000,  // Default community size
  state: 'national'      // Default state selection
};

// ============================================================================
// PARAMETER RANGES (for sliders)
// ============================================================================

export const RANGES = {
  vsl: { min: 8, max: 20, step: 0.1 },
  suicides: { min: 100000, max: 300000, step: 1000 },
  attribution: { min: 5, max: 30, step: 1 },
  depression: { min: 3000000, max: 15000000, step: 100000 },
  yld: { min: 4, max: 8, step: 0.1 },
  qol: { min: 30, max: 40, step: 1 },
  healthcare: { min: 6500, max: 20000, step: 100 },
  productivity: { min: 6000, max: 10000, step: 100 },
  duration: { min: 3, max: 6, step: 0.1 },
  communityPopulation: { min: 1000, max: 10000000, step: 1000 }
};

// ============================================================================
// SCENARIO PRESETS
// ============================================================================

export const SCENARIOS = {
  reset: {
    name: 'Research Consensus Values',
    emoji: '🔬',
    description: 'Values based on peer-reviewed research and government data',
    values: { ...DEFAULTS }
  },
  
  optimistic: {
    name: 'Most Optimistic',
    emoji: '🌟', 
    description: 'Conservative estimates with minimal attribution',
    values: {
      vsl: 8.0,
      suicides: 100000,
      attribution: 5,
      depression: 3000000,
      yld: 4.0,
      qol: 30,
      healthcare: 6500,
      productivity: 6000,
      duration: 3.0
    }
  },
  
  aggressive: {
    name: 'Worst Case Scenario',
    emoji: '🚨',
    description: 'Higher estimates reflecting severe impact scenarios',
    values: {
      vsl: 20.0,
      suicides: 250000,
      attribution: 25,
      depression: 12000000,
      yld: 8.0,
      qol: 40,
      healthcare: 15000,
      productivity: 9000,
      duration: 6.0
    }
  },
  
  facebookFiles: {
    name: '"Facebook Files" Scenario',
    emoji: '📱',
    description: 'Based on internal Facebook research revelations',
    values: {
      vsl: 13.7,
      suicides: 180000,
      attribution: 22,
      depression: 8000000,
      yld: 6.5,
      qol: 38,
      healthcare: 10000,
      productivity: 7500,
      duration: 5.0
    }
  }
};

// ============================================================================
// CALCULATION CONSTANTS
// ============================================================================

export const CALCULATION = {
  // Economic constants
  US_GDP: 24000000000000,         // US GDP in USD (24 trillion)
  LIFE_EXPECTANCY: 75,            // Used for QALY calculations
  YEARS_SINCE_SM: 15,             // Years since social media adoption (2009-2024)
  
  // Display formatting
  DECIMAL_PLACES: {
    currency: 1,     // Trillions: $2.5T
    percentage: 1,   // Percentages: 18.5%
    years: 1,       // Years: 4.5 years
    count: 0        // People count: 110,000
  },
  
  // Update frequencies (milliseconds)
  CALCULATION_DEBOUNCE: 100,      // Delay before recalculating
  DISPLAY_UPDATE: 50,             // Display update frequency
  COUNTER_TICK: 1000             // Running counter update interval
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI = {
  // Color scheme
  colors: {
    primary: '#dc2626',           // Red for mortality
    secondary: '#8b5cf6',         // Purple for mental health  
    tertiary: '#059669',          // Green for productivity
    accent: '#1f2937',            // Dark gray
    success: '#22c55e',           // Green for success states
    warning: '#f59e0b',           // Orange for warnings
    error: '#ef4444'              // Red for errors
  },
  
  // Responsive breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px'
  },
  
  // Animation timing
  animations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  // Z-index layers
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
    fixed: 2147483647          // Maximum for critical fixed elements
  }
};

// ============================================================================
// FORMULA DEFINITIONS
// ============================================================================

export const FORMULAS = {
  mortality: {
    display: 'P × Q × VSL',
    description: 'Deaths × Attribution % × Value per Life',
    variables: ['suicides', 'attribution', 'vsl']
  },
  
  mentalHealth: {
    display: 'P × Q × R × (VSL ÷ 75 years)',
    description: 'People × Years × Quality Loss × Annual Life Value',
    variables: ['depression', 'yld', 'qol', 'vsl']
  },
  
  healthcare: {
    display: 'People × (Healthcare + Productivity) × Duration',
    description: 'Total affected × Annual costs × Treatment years',
    variables: ['depression', 'healthcare', 'productivity', 'duration']
  }
};

// ============================================================================
// RESEARCH CITATIONS
// ============================================================================

export const CITATIONS = {
  vsl: {
    source: 'US Department of Transportation (2024)',
    url: 'https://www.transportation.gov/office-policy/transportation-policy/revised-departmental-guidance-on-valuation-of-a-statistical-life-in-economic-analysis',
    value: '$13.7M'
  },
  
  attribution: {
    source: 'Braghieri, Levy & Makarin (2022) - American Economic Review',
    url: 'https://econpapers.repec.org/RePEc:aea:aecrev:v:112:y:2022:i:11:p:3660-93',
    finding: 'Causal evidence of Facebook impact on mental health'
  },
  
  depression: {
    source: 'Twenge et al. (2018) - PNAS',
    url: 'https://www.pnas.org/doi/pdf/10.1073/pnas.1815663116',
    finding: '0.23-point increase per hour of social media use'
  },
  
  economicBurden: {
    source: 'Greenberg et al. (2021) - Economic Burden Study',
    url: 'https://www.psychiatrist.com/jcp/economic-burden-adults-major-depressive-disorder-united/',
    value: '$333.7B total societal burden'
  }
};

// ============================================================================
// SHARING & VIRAL FEATURES
// ============================================================================

export const SHARING = {
  // Social media platforms
  platforms: {
    twitter: {
      url: 'https://twitter.com/intent/tweet',
      text: 'Social media\'s hidden cost to society: ${total} trillion. Calculate your community\'s impact:'
    },
    
    facebook: {
      url: 'https://www.facebook.com/sharer/sharer.php',
      text: 'Research shows social media costs society ${total} trillion annually through mental health impacts.'
    },
    
    linkedin: {
      url: 'https://www.linkedin.com/sharing/share-offsite/',
      text: 'New research quantifies social media\'s economic impact: ${total} trillion in societal costs.'
    }
  },
  
  // Viral comparison generators
  comparisons: [
    'Could fund NASA for ${years} years',
    'Could provide free college for ${students} million students',
    'Equals ${percent}% of the entire US federal budget',
    'Could end homelessness ${times} times over',
    'Could provide universal healthcare for ${people} million people',
    'Equals the GDP of ${countries} combined',
    'Could fund ${teachers} million teacher salaries',
    'Could build ${hospitals} major hospitals'
  ]
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  // Input limits
  limits: {
    vsl: { min: 1, max: 50, message: 'VSL must be between $1M and $50M' },
    suicides: { min: 50000, max: 500000, message: 'Suicides must be between 50K and 500K' },
    attribution: { min: 1, max: 50, message: 'Attribution must be between 1% and 50%' },
    depression: { min: 1000000, max: 50000000, message: 'Depression cases must be between 1M and 50M' }
  },
  
  // Required fields
  required: ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'],
  
  // Data types
  types: {
    vsl: 'number',
    suicides: 'integer',
    attribution: 'integer',
    depression: 'integer',
    yld: 'number',
    qol: 'integer',
    healthcare: 'integer',
    productivity: 'integer',
    duration: 'number'
  }
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERRORS = {
  calculation: {
    overflow: 'Calculation resulted in overflow. Please reduce input values.',
    underflow: 'Calculation resulted in negative value. Please check inputs.',
    invalid: 'Invalid calculation parameters provided.',
    timeout: 'Calculation is taking too long. Please try again.'
  },
  
  validation: {
    required: 'This field is required.',
    numeric: 'Please enter a valid number.',
    range: 'Value is outside the acceptable range.',
    format: 'Please enter a valid format.'
  },
  
  display: {
    loadFailed: 'Failed to load component. Please refresh the page.',
    updateFailed: 'Failed to update display. Data may be outdated.',
    chartError: 'Unable to render chart. Check browser compatibility.'
  }
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  // Performance optimizations
  enablePerformanceMode: true,
  enableDistributionSliders: true,
  enableCharts: true,
  enableTooltips: true,
  
  // Advanced features
  enableCommunityCalculator: true,
  enableSocialSharing: true,
  enableAdvancedScenarios: true,
  enableExportData: false,      // Future feature
  
  // Experimental features
  enableDarkMode: false,        // Future feature
  enableMultiLanguage: false,   // Future feature
  enableRealTimeData: false     // Future feature
};

// ============================================================================
// ACCESSIBILITY SETTINGS
// ============================================================================

export const ACCESSIBILITY = {
  // ARIA labels
  ariaLabels: {
    calculator: 'Social media cost calculator',
    slider: 'Parameter adjustment slider',
    button: 'Interactive button',
    chart: 'Data visualization chart',
    tooltip: 'Additional information'
  },
  
  // Keyboard navigation
  keyboardShortcuts: {
    help: '?',
    reset: 'r',
    calculate: 'Enter',
    escape: 'Escape'
  },
  
  // Screen reader support
  screenReader: {
    announceCalculation: true,
    announceScenarioChange: true,
    announceValueUpdates: false   // Too frequent for screen readers
  }
};

// Export all constants as default object for easy importing
export default {
  DEFAULTS,
  RANGES, 
  SCENARIOS,
  CALCULATION,
  UI,
  FORMULAS,
  CITATIONS,
  SHARING,
  VALIDATION,
  ERRORS,
  FEATURES,
  ACCESSIBILITY
}; 