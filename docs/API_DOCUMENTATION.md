# API Documentation

Complete reference for all calculator functions, components, and utilities.

## Table of Contents

- [Calculator Component](#calculator-component)
- [Formatters](#formatters)
- [Constants](#constants)
- [Main Application](#main-application)

---

## Calculator Component

**File**: `src/components/Calculator.js`

### Class: Calculator

Main calculation engine for economic impact analysis.

#### Constructor

```javascript
const calculator = new Calculator()
```

**Description**: Creates a new calculator instance with default parameter values.

**Returns**: `Calculator` instance

---

#### Methods

### `updateParameter(parameterName, value)`

**Purpose**: Update a single parameter and recalculate all results.

**Parameters**:
- `parameterName` (string): Name of parameter to update
  - Valid values: `'vsl'`, `'suicides'`, `'attribution'`, `'depression'`, `'yld'`, `'qol'`, `'healthcare'`, `'productivity'`, `'duration'`
- `value` (number): New parameter value

**Returns**: `Object` - Updated calculation results

**Example**:
```javascript
const results = calculator.updateParameter('vsl', 15.2);
console.log(results.total); // Updated total cost
```

---

### `updateParameters(newParameters)`

**Purpose**: Update multiple parameters at once (used for scenario loading).

**Parameters**:
- `newParameters` (Object): Key-value pairs of parameters to update

**Returns**: `Object` - Updated calculation results

**Example**:
```javascript
const scenario = {
  vsl: 20.0,
  suicides: 250000,
  attribution: 25
};
const results = calculator.updateParameters(scenario);
```

---

### `calculateAll()`

**Purpose**: Perform all calculations and return complete results.

**Parameters**: None

**Returns**: `Object` - Complete calculation results
```javascript
{
  mortality: 271300000000,        // Mortality costs in USD
  mentalHealth: 1920000000000,    // Mental health costs in USD  
  healthcare: 292500000000,       // Healthcare costs in USD
  total: 2483800000000,          // Total cost in USD
  gdpPercentage: 2.4,            // Percentage of US GDP
  parameters: { ... },           // Current parameter values
  formulas: { ... },             // Formatted formula strings
  timestamp: 1640995200000       // Calculation timestamp
}
```

**Example**:
```javascript
const results = calculator.calculateAll();
console.log(`Total: $${(results.total / 1e12).toFixed(1)}T`);
```

---

### `calculateMortalityCosts()`

**Purpose**: Calculate mortality costs using VSL methodology.

**Formula**: `Excess Suicides × Attribution % × Value of Statistical Life`

**Parameters**: None (uses current parameter values)

**Returns**: `number` - Mortality costs in USD

**Example**:
```javascript
const mortalityCost = calculator.calculateMortalityCosts();
// Returns: 271300000000 (for default values)
```

---

### `calculateMentalHealthCosts()`

**Purpose**: Calculate mental health costs using QALY methodology.

**Formula**: `People × Years × Quality Loss % × (VSL ÷ Life Expectancy)`

**Parameters**: None (uses current parameter values)

**Returns**: `number` - Mental health costs in USD

**Example**:
```javascript
const mentalHealthCost = calculator.calculateMentalHealthCosts();
// Returns: 1920000000000 (for default values)
```

---

### `calculateHealthcareCosts()`

**Purpose**: Calculate healthcare and productivity costs.

**Formula**: `Affected People × (Healthcare + Productivity) × Duration`

**Parameters**: None (uses current parameter values)

**Returns**: `number` - Healthcare costs in USD

**Example**:
```javascript
const healthcareCost = calculator.calculateHealthcareCosts();
// Returns: 292500000000 (for default values)
```

---

### `calculateCommunityImpact(population, state)`

**Purpose**: Calculate community-specific impact based on population scaling.

**Parameters**:
- `population` (number): Community population size (1,000 to 10,000,000)
- `state` (string, optional): State or region identifier (default: 'national')

**Returns**: `Object` - Community impact breakdown
```javascript
{
  totalCost: 7515060.0,          // Scaled total cost
  mortality: 821212.0,           // Scaled mortality cost
  mentalHealth: 5813018.0,       // Scaled mental health cost
  healthcare: 884830.0,          // Scaled healthcare cost
  affectedPeople: 15,            // Estimated affected people
  excessDeaths: 1,               // Estimated excess deaths
  population: 100000,            // Input population
  state: 'national'              // Input state
}
```

**Example**:
```javascript
const impact = calculator.calculateCommunityImpact(100000, 'california');
console.log(`Community cost: $${impact.totalCost.toLocaleString()}`);
```

---

### `calculateRunningCost(elapsedSeconds)`

**Purpose**: Calculate cost accumulated since a start time (for real-time counter).

**Parameters**:
- `elapsedSeconds` (number): Seconds elapsed since start time

**Returns**: `number` - Accumulated cost in USD

**Example**:
```javascript
const startTime = Date.now();
// ... later ...
const elapsed = (Date.now() - startTime) / 1000;
const runningCost = calculator.calculateRunningCost(elapsed);
```

---

### `calculateUncertaintyRange(parameterVariation)`

**Purpose**: Calculate uncertainty range for sensitivity analysis.

**Parameters**:
- `parameterVariation` (number, optional): Variation percentage (default: 0.15 for ±15%)

**Returns**: `Object` - Uncertainty range
```javascript
{
  min: 2111230000000,    // Minimum estimate
  max: 2856370000000,    // Maximum estimate  
  variation: 15          // Variation percentage
}
```

**Example**:
```javascript
const uncertainty = calculator.calculateUncertaintyRange(0.20); // ±20%
console.log(`Range: ${formatCurrency(uncertainty.min)} - ${formatCurrency(uncertainty.max)}`);
```

---

### `getParameters()`

**Purpose**: Get current parameter values.

**Parameters**: None

**Returns**: `Object` - Copy of current parameters

**Example**:
```javascript
const params = calculator.getParameters();
console.log(`VSL: $${params.vsl}M`);
```

---

### `getResults()`

**Purpose**: Get current calculation results.

**Parameters**: None

**Returns**: `Object` - Copy of current results (same format as `calculateAll()`)

---

### `reset()`

**Purpose**: Reset all parameters to default values and recalculate.

**Parameters**: None

**Returns**: `Object` - Reset calculation results

**Example**:
```javascript
const defaultResults = calculator.reset();
```

---

### `validateParameters()`

**Purpose**: Validate all current parameters for errors.

**Parameters**: None

**Returns**: `Array<string>` - Array of validation error messages (empty if valid)

**Example**:
```javascript
const errors = calculator.validateParameters();
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}
```

---

## Formatters

**File**: `src/utils/formatters.js`

### `formatCurrency(value, decimalPlaces)`

**Purpose**: Format large numbers as currency (trillions/billions).

**Parameters**:
- `value` (number): Raw value to format
- `decimalPlaces` (number, optional): Decimal places (default: 1)

**Returns**: `string` - Formatted currency string

**Examples**:
```javascript
formatCurrency(2480000000000);     // "$2.5T"
formatCurrency(271300000000);      // "$271.3B"
formatCurrency(15700000);          // "$15.7M"
formatCurrency(5500);              // "$5.5K"
```

---

### `formatPercentage(value, decimalPlaces)`

**Purpose**: Format a number as a percentage.

**Parameters**:
- `value` (number): Raw percentage value (e.g., 18 for 18%)
- `decimalPlaces` (number, optional): Decimal places (default: 1)

**Returns**: `string` - Formatted percentage string

**Examples**:
```javascript
formatPercentage(18);      // "18.0%"
formatPercentage(35.7);    // "35.7%"
formatPercentage(4.25, 2); // "4.25%"
```

---

### `formatNumber(value, decimalPlaces)`

**Purpose**: Format numbers with appropriate scale and commas.

**Parameters**:
- `value` (number): Raw number value
- `decimalPlaces` (number, optional): Decimal places (default: 0)

**Returns**: `string` - Formatted number string

**Examples**:
```javascript
formatNumber(5000000);     // "5.0M"
formatNumber(110000);      // "110K"
formatNumber(1500);        // "1,500"
```

---

### `formatYears(value, decimalPlaces)`

**Purpose**: Format a decimal number as years.

**Parameters**:
- `value` (number): Raw years value (e.g., 4.5)
- `decimalPlaces` (number, optional): Decimal places (default: 1)

**Returns**: `string` - Formatted years string

**Examples**:
```javascript
formatYears(4.5);    // "4.5 years"
formatYears(1.0);    // "1.0 year"
formatYears(6);      // "6.0 years"
```

---

### `formatSliderValue(parameterType, value)`

**Purpose**: Format slider values for display based on parameter type.

**Parameters**:
- `parameterType` (string): Type of parameter
  - Valid types: `'vsl'`, `'suicides'`, `'depression'`, `'attribution'`, `'qol'`, `'yld'`, `'duration'`, `'healthcare'`, `'productivity'`
- `value` (number): Raw value to format

**Returns**: `string` - Formatted value for display

**Examples**:
```javascript
formatSliderValue('vsl', 13.7);           // "$13.7M"
formatSliderValue('attribution', 18);     // "18%"
formatSliderValue('suicides', 110000);    // "110K"
formatSliderValue('healthcare', 7000);    // "$7,000"
```

---

### `isValidNumber(value)`

**Purpose**: Check if a value is valid for calculations.

**Parameters**:
- `value` (*): Value to check

**Returns**: `boolean` - True if valid number

**Examples**:
```javascript
isValidNumber(42);        // true
isValidNumber("42");      // false  
isValidNumber(NaN);       // false
isValidNumber(-5);        // false (negative not allowed)
isValidNumber(Infinity);  // false
```

---

## Constants

**File**: `src/utils/constants.js`

### DEFAULTS

Default parameter values for calculator initialization.

```javascript
{
  vsl: 13.7,              // Value of Statistical Life (millions USD)
  suicides: 110000,       // Excess suicides since 2009
  attribution: 18,        // % attributable to social media
  depression: 5000000,    // Americans with SM-induced depression
  yld: 6.0,              // Years Lived with Disability
  qol: 35,               // Quality of Life reduction (%)
  healthcare: 7000,       // Annual healthcare costs per person (USD)
  productivity: 6000,     // Annual productivity loss per person (USD)
  duration: 4.5,         // Treatment duration in years
  communityPopulation: 100000,  // Default community size
  state: 'national'      // Default state selection
}
```

---

### RANGES

Valid ranges for slider controls.

```javascript
{
  vsl: { min: 8, max: 20, step: 0.1 },
  suicides: { min: 100000, max: 300000, step: 1000 },
  attribution: { min: 5, max: 30, step: 1 },
  depression: { min: 3000000, max: 15000000, step: 100000 },
  yld: { min: 4, max: 8, step: 0.1 },
  qol: { min: 30, max: 40, step: 1 },
  healthcare: { min: 6500, max: 20000, step: 100 },
  productivity: { min: 6000, max: 10000, step: 100 },
  duration: { min: 3, max: 6, step: 0.1 }
}
```

---

### SCENARIOS

Predefined scenario configurations.

```javascript
{
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
    values: { vsl: 8.0, suicides: 100000, attribution: 5, ... }
  },
  
  aggressive: {
    name: 'Worst Case Scenario', 
    emoji: '🚨',
    description: 'Higher estimates reflecting severe impact scenarios',
    values: { vsl: 20.0, suicides: 250000, attribution: 25, ... }
  },
  
  facebookFiles: {
    name: '"Facebook Files" Scenario',
    emoji: '📱', 
    description: 'Based on internal Facebook research revelations',
    values: { vsl: 13.7, suicides: 180000, attribution: 22, ... }
  }
}
```

---

## Main Application

**File**: `src/app.js`

### Class: SocialMediaCalculatorApp

Main application controller managing UI and user interactions.

#### Methods

### `init()`

**Purpose**: Initialize the entire application.

**Parameters**: None

**Returns**: `Promise<void>`

**Usage**: Called automatically on page load.

---

### `loadScenario(scenarioKey)`

**Purpose**: Load a predefined scenario.

**Parameters**:
- `scenarioKey` (string): Scenario identifier (`'reset'`, `'optimistic'`, `'aggressive'`, `'facebookFiles'`)

**Returns**: `void`

**Example**:
```javascript
app.loadScenario('aggressive'); // Load worst-case scenario
```

---

### `updateParameter(parameterName, value)`

**Purpose**: Update parameter and refresh all displays.

**Parameters**:
- `parameterName` (string): Parameter to update
- `value` (number): New value

**Returns**: `void`

---

### `calculateCommunityImpact()`

**Purpose**: Calculate and display community impact based on user input.

**Parameters**: None (reads from UI inputs)

**Returns**: `void`

---

### Global Access

The main app instance is available globally for debugging:

```javascript
// In browser console:
window.calculatorApp.loadScenario('optimistic');
window.calculatorApp.calculator.getResults();
```

---

## Error Handling

All API functions include comprehensive error handling:

- **Input Validation**: Parameters are validated before processing
- **Calculation Errors**: Math errors return safe default values
- **UI Errors**: Display errors are logged and user is notified
- **Network Errors**: Graceful degradation for external dependencies

### Error Response Format

```javascript
{
  error: true,
  message: "Detailed error description",
  timestamp: 1640995200000,
  context: { /* Additional error context */ }
}
```

---

## Performance Notes

- **Debounced Calculations**: Slider updates are debounced to prevent excessive recalculation
- **Efficient Updates**: Only changed display elements are updated
- **Memory Management**: Intervals and timers are properly cleaned up
- **Validation Caching**: Parameter validation results are cached when possible

---

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **JavaScript**: ES6+ modules required
- **CSS**: Grid and Flexbox support required
- **Features**: No polyfills needed for supported browsers 