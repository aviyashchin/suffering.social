# Distribution Slider Library

A professional, production-ready JavaScript library for creating interactive sliders with mathematically accurate probability distributions. Perfect for economic calculators, risk analysis tools, and uncertainty visualization.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Dependencies](https://img.shields.io/badge/dependencies-D3.js-orange.svg)

## ✨ Features

- **🎯 Mathematically Accurate**: Implements Normal, Beta, and Log-Normal distributions with proper PDF, CDF, and quantile functions
- **📊 Real-time Visualization**: Dynamic distribution curves that update as you drag the slider
- **🎨 Professional Design**: Multiple themes, confidence intervals, and statistical displays
- **🔧 Easy Integration**: Clean API designed for seamless integration into existing applications
- **📱 Responsive**: Works on desktop and mobile with touch support
- **⚡ Performance**: Optimized rendering with D3.js for smooth interactions
- **🧪 Battle-tested**: Comprehensive unit tests and error handling

## 🚀 Quick Start

### Installation

```html
<!-- Include D3.js (required dependency) -->
<script src="https://d3js.org/d3.v7.min.js"></script>

<!-- Include the distribution slider library -->
<script src="assets/distribution-sliders.js"></script>
```

### Basic Usage

```html
<!-- Create a container for your slider -->
<div id="my-slider"></div>

<script>
// Create a slider
const slider = new DistributionSlider({
  containerId: 'my-slider',
  min: 0,
  max: 100,
  default: 50,
  distributionType: 'normal',
  onChange: (value) => console.log('New value:', value)
});
</script>
```

## 📊 Distribution Types

### Normal Distribution
Perfect for modeling values with natural variation around a central tendency.

```javascript
const normalSlider = new DistributionSlider({
  containerId: 'normal-container',
  min: 8,
  max: 20,
  default: 13.7,
  distributionType: 'normal',
  format: (v) => `$${v.toFixed(1)}M`
});
```

### Beta Distribution
Ideal for percentages and proportions with natural bounds.

```javascript
const betaSlider = new DistributionSlider({
  containerId: 'beta-container',
  min: 5,
  max: 30,
  default: 18,
  distributionType: 'beta',
  distributionParams: { concentration: 8 },
  format: (v) => `${v.toFixed(0)}%`
});
```

### Log-Normal Distribution
Great for modeling positive values with right-skewed distributions.

```javascript
const lognormalSlider = new DistributionSlider({
  containerId: 'lognormal-container',
  min: 1000000,
  max: 10000000,
  default: 5000000,
  distributionType: 'lognormal',
  format: (v) => `${(v/1000000).toFixed(1)}M`
});
```

## 🎛️ Slider Manager

For managing multiple sliders efficiently:

```javascript
// Create manager
const sliderManager = new DistributionSliderManager();

// Create multiple sliders
const vslSlider = sliderManager.create({
  containerId: 'vsl-container',
  sliderId: 'vsl',
  min: 8,
  max: 20,
  default: 13.7,
  distributionType: 'normal',
  onChange: updateCalculations
});

const attributionSlider = sliderManager.create({
  containerId: 'attribution-container',
  sliderId: 'attribution',
  min: 5,
  max: 30,
  default: 18,
  distributionType: 'beta',
  onChange: updateCalculations
});

// Batch operations
function updateCalculations() {
  const values = sliderManager.getAllValues();
  const totalCost = values.vsl * values.attribution * 0.01 * 110000;
  console.log('Total Cost:', totalCost);
}

// Reset all sliders
sliderManager.resetAll();

// Get complete output from all sliders
const completeState = sliderManager.getAllOutput();
```

## 📚 API Reference

### DistributionSlider Constructor

```javascript
new DistributionSlider(config)
```

#### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `containerId` | string | ✅ | - | DOM container element ID |
| `min` | number | ✅ | - | Minimum slider value |
| `max` | number | ✅ | - | Maximum slider value |
| `default` | number | ✅ | - | Default/initial value |
| `sliderId` | string | ❌ | auto-generated | Unique identifier |
| `step` | number | ❌ | auto-calculated | Value step size |
| `distributionType` | string | ❌ | 'normal' | 'normal', 'beta', or 'lognormal' |
| `distributionParams` | object | ❌ | {} | Distribution-specific parameters |
| `format` | function | ❌ | `(v) => v.toFixed(2)` | Value formatting function |
| `onChange` | function | ❌ | `() => {}` | Change callback |
| `onUpdate` | function | ❌ | `() => {}` | Update callback (during drag) |
| `showStats` | boolean | ❌ | true | Show statistics display |
| `showConfidenceInterval` | boolean | ❌ | true | Show 95% confidence interval |
| `theme` | string | ❌ | 'default' | Color theme |
| `width` | number | ❌ | auto | Custom width |
| `height` | number | ❌ | 160 | Custom height |

#### Themes

- `'default'` - Blue theme
- `'red'` - Red theme (great for mortality/risk)
- `'purple'` - Purple theme (great for mental health)
- `'cyan'` - Cyan theme (great for economic data)

### Public Methods

#### getValue()
Returns the current slider value.

```javascript
const currentValue = slider.getValue();
```

#### setValue(value, triggerChange = true)
Set the slider value programmatically.

```javascript
slider.setValue(75);
slider.setValue(75, false); // Don't trigger onChange callback
```

#### reset()
Reset slider to its default value.

```javascript
slider.reset();
```

#### getStats()
Get distribution statistics.

```javascript
const stats = slider.getStats();
console.log(stats);
// {
//   mean: 50.2,
//   median: 50.0,
//   mode: 50.0,
//   std: 15.3,
//   variance: 234.1,
//   ci95: [20.1, 80.3]
// }
```

#### getOutput()
Get complete slider state and statistics.

```javascript
const output = slider.getOutput();
console.log(output);
// {
//   id: 'slider-123',
//   value: 50,
//   formattedValue: '50.00',
//   stats: { ... },
//   config: { ... }
// }
```

#### updateConfig(newConfig)
Update slider configuration.

```javascript
slider.updateConfig({
  theme: 'red',
  showStats: false,
  format: (v) => `$${v}M`
});
```

#### destroy()
Clean up and remove the slider.

```javascript
slider.destroy();
```

### DistributionSliderManager Methods

#### create(config)
Create and register a new slider.

```javascript
const slider = manager.create(config);
```

#### get(id)
Get slider by ID.

```javascript
const slider = manager.get('my-slider-id');
```

#### remove(id)
Remove slider by ID.

```javascript
const removed = manager.remove('my-slider-id');
```

#### getAllValues()
Get all slider values as an object.

```javascript
const values = manager.getAllValues();
// { 'slider1': 50, 'slider2': 75 }
```

#### setAllValues(values)
Set multiple slider values.

```javascript
manager.setAllValues({
  'slider1': 60,
  'slider2': 80
});
```

#### resetAll()
Reset all sliders to default values.

```javascript
manager.resetAll();
```

#### getAllOutput()
Get complete output from all sliders.

```javascript
const completeState = manager.getAllOutput();
```

#### destroyAll()
Destroy all sliders and clean up.

```javascript
manager.destroyAll();
```

## 🧮 Integration with Social Media Cost Calculator

### Step 1: Add Containers

Replace your existing slider HTML with containers:

```html
<!-- Replace existing VSL slider -->
<div id="vsl-slider-container"></div>

<!-- Replace existing attribution slider -->
<div id="attribution-slider-container"></div>

<!-- Replace existing depression cases slider -->
<div id="depression-slider-container"></div>
```

### Step 2: Initialize Sliders

```javascript
// Initialize slider manager
const distributionSliders = new DistributionSliderManager();

// Create VSL slider
const vslSlider = distributionSliders.create({
  containerId: 'vsl-slider-container',
  sliderId: 'vsl',
  min: 8,
  max: 20,
  default: 13.7,
  distributionType: 'normal',
  format: (v) => `$${v.toFixed(1)}M`,
  theme: 'red',
  onChange: updateCalculations
});

// Create Attribution slider
const attributionSlider = distributionSliders.create({
  containerId: 'attribution-slider-container',
  sliderId: 'attribution',
  min: 5,
  max: 30,
  default: 18,
  distributionType: 'beta',
  distributionParams: { concentration: 8 },
  format: (v) => `${v.toFixed(0)}%`,
  theme: 'purple',
  onChange: updateCalculations
});

// Create Depression cases slider
const depressionSlider = distributionSliders.create({
  containerId: 'depression-slider-container',
  sliderId: 'depression',
  min: 3000000,
  max: 15000000,
  default: 5000000,
  distributionType: 'lognormal',
  format: (v) => {
    if (v >= 1000000) return `${(v/1000000).toFixed(1)}M`;
    return `${(v/1000).toFixed(0)}K`;
  },
  theme: 'cyan',
  onChange: updateCalculations
});
```

### Step 3: Update Calculations

```javascript
function updateCalculations() {
  // Get all slider values
  const values = distributionSliders.getAllValues();
  
  // Your existing calculation logic
  const mortalityCost = values.vsl * 1000000 * (values.attribution / 100) * 110000;
  const mentalHealthCost = values.depression * 6 * 0.35 * (values.vsl * 1000000 / 75);
  const totalCost = mortalityCost + mentalHealthCost;
  
  // Update displays
  document.getElementById('total-cost').textContent = formatCurrency(totalCost);
  
  // Get uncertainty ranges for sensitivity analysis
  const vslStats = vslSlider.getStats();
  const attributionStats = attributionSlider.getStats();
  
  // Calculate confidence intervals for total cost
  const minCost = vslStats.ci95[0] * 1000000 * (attributionStats.ci95[0] / 100) * 110000;
  const maxCost = vslStats.ci95[1] * 1000000 * (attributionStats.ci95[1] / 100) * 110000;
  
  console.log(`Cost range: $${formatCurrency(minCost)} - $${formatCurrency(maxCost)}`);
}
```

### Step 4: Add Scenario Support

```javascript
function setScenario(scenarioName) {
  const scenarios = {
    'research-consensus': {
      vsl: 13.7,
      attribution: 18,
      depression: 5000000
    },
    'aggressive': {
      vsl: 20,
      attribution: 30,
      depression: 12000000
    },
    'optimistic': {
      vsl: 8,
      attribution: 5,
      depression: 3000000
    }
  };
  
  const scenario = scenarios[scenarioName];
  if (scenario) {
    distributionSliders.setAllValues(scenario);
  }
}

// Wire up to existing scenario buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const scenario = btn.dataset.scenario;
    if (scenario === 'reset') {
      setScenario('research-consensus');
    } else {
      setScenario(scenario);
    }
  });
});
```

## 🎨 Styling

The library uses inline styles for core functionality, but you can customize appearance:

```css
/* Custom slider track styling */
.slider-track {
  stroke: #your-color !important;
  stroke-width: 6px !important;
}

/* Custom handle styling */
.slider-handle circle {
  fill: #your-color !important;
  stroke: white !important;
  stroke-width: 4px !important;
}

/* Custom distribution styling */
.distribution-path {
  stroke: #your-color !important;
  stroke-width: 4px !important;
}

.distribution-fill {
  fill: #your-color !important;
  opacity: 0.3 !important;
}
```

## 🧪 Testing

The library includes comprehensive mathematical validation:

```javascript
// Test normal distribution
const normal = new NormalDistribution(0, 1);
console.assert(Math.abs(normal.cdf(0) - 0.5) < 1e-10, 'Normal CDF test');

// Test beta distribution
const beta = new BetaDistribution(2, 2);
console.assert(Math.abs(beta.cdf(0.5) - 0.5) < 1e-10, 'Beta CDF test');

// Test log-normal distribution
const lognormal = new LogNormalDistribution(0, 1);
console.assert(lognormal.pdf(1) > 0, 'Log-normal PDF test');
```

## 🔧 Advanced Configuration

### Custom Distribution Parameters

```javascript
// Beta distribution with custom concentration
const betaSlider = new DistributionSlider({
  // ... other config
  distributionType: 'beta',
  distributionParams: {
    concentration: 12  // Higher = more peaked around current value
  }
});

// Log-normal with custom spread
const lognormalSlider = new DistributionSlider({
  // ... other config
  distributionType: 'lognormal',
  distributionParams: {
    sigma: 0.8  // Higher = more spread/uncertainty
  }
});
```

### Custom Formatting

```javascript
const slider = new DistributionSlider({
  // ... other config
  format: (value) => {
    if (value >= 1e9) return `$${(value/1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value/1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value/1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
});
```

### Real-time Updates

```javascript
const slider = new DistributionSlider({
  // ... other config
  onUpdate: (value) => {
    // Called during drag for real-time updates
    document.getElementById('live-display').textContent = value;
  },
  onChange: (value, output) => {
    // Called when drag ends or value is set
    console.log('Final value:', value);
    console.log('Statistics:', output.stats);
    updateCalculations();
  }
});
```

## 🐛 Error Handling

The library includes comprehensive error handling:

```javascript
try {
  const slider = new DistributionSlider({
    containerId: 'non-existent-container',
    min: 0,
    max: 100,
    default: 50
  });
} catch (error) {
  console.error('Slider creation failed:', error.message);
}

// Graceful handling of invalid values
slider.setValue(NaN); // Will be ignored
slider.setValue(Infinity); // Will be clamped to max
slider.setValue(-100); // Will be clamped to min
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For questions, issues, or feature requests:

- **Email**: ethicsboard@subconscious.ai
- **GitHub Issues**: [Create an issue](https://github.com/subconscious-ai/distribution-sliders/issues)
- **Discord**: [Join our community](https://discord.gg/3bgj4ZhABz)

---

**Built with ❤️ by [Subconscious.ai](https://subconscious.ai)**

*Ready for production use in your social media cost calculator and beyond.* 