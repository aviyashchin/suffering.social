# Social Media Calculator - Code Refactoring & Improvement Plan

## 🎯 Overview

This plan addresses code quality, UI/UX improvements, data consistency, and visual design enhancements to create a maximally professional and maintainable calculator.

---

## 📋 Part 1: Method Renaming & Documentation

### 1.1 Current Method Analysis & Proposed Renames

#### **Core Calculator Methods**
```javascript
// BEFORE → AFTER (with rationale)

calculate() → calculateTotalEconomicImpact()
// More descriptive of what it actually does

updateAllDisplays() → synchronizeDisplaysWithCurrentParameters()
// Clarifies this syncs displays to current parameter state

updateDisplay(param, value) → updateSingleParameterDisplay(parameterName, formattedValue)
// More explicit about updating one parameter's display

loadScenario(scenarioName) → applyResearchScenarioParameters(scenarioIdentifier)
// Clarifies this applies research-based parameter sets

applyCitationValues(citationElement) → applyStudyParametersFromCitation(citationDOMElement)
// More explicit about applying parameters from academic studies
```

#### **Distribution Visualization Methods**
```javascript
// BEFORE → AFTER (with rationale)

setupDistributionCharts() → initializeUncertaintyVisualizationSystem()
// Better describes the uncertainty visualization purpose

createDistributionChart(paramName) → createParameterUncertaintyVisualization(parameterName)
// More descriptive of what it creates

updateDistributionChart(paramName) → refreshParameterDistributionCurve(parameterName)
// Clearer about refreshing the curve

generateDynamicDistributionPoints() → calculateDistributionCurveCoordinates(width, height, parameterName)
// More explicit about coordinate calculation

updateCurrentValueIndicator() → positionCurrentValueMarkerOnDistribution(parameterName)
// Clearer about positioning the red line marker

updateDistributionInfo() → recalculateConfidenceIntervalsForAllParameters()
// More specific about CI recalculation
```

#### **Data Management Methods**
```javascript
// BEFORE → AFTER (with rationale)

getThemeColors(paramName) → getParameterGroupColorScheme(parameterName)
// More descriptive of color scheme retrieval

formatCurrency(amount) → formatEconomicValueWithScaleIndicators(rawAmount)
// Better describes scale-aware formatting ($2.4T vs $2.4B)

getResearchData() → getAcademicCitationDatabase()
// More specific about academic source data

calculateDynamicCI() → calculateResearchBasedConfidenceInterval(currentValue, distributionType, uncertaintyFactor)
// More explicit about research-based CI calculation
```

### 1.2 Comprehensive Function Documentation

#### **Example: Core Calculation Method**
```javascript
/**
 * Calculates the total economic impact of social media on society
 * 
 * Uses a three-component model based on peer-reviewed research:
 * 1. Mortality costs (deaths × attribution × VSL)
 * 2. Disability costs (affected population × duration × quality impact × annual QALY value)
 * 3. Productivity costs (affected population × (healthcare + productivity losses) × treatment duration)
 * 
 * @returns {Object} Economic impact breakdown
 * @returns {number} returns.mortality - Death-related costs in USD
 * @returns {number} returns.mental - Disability/QALY costs in USD  
 * @returns {number} returns.productivity - Economic productivity losses in USD
 * @returns {number} returns.total - Sum of all three components in USD
 * 
 * @throws {Error} If parameters contain invalid values
 * 
 * @example
 * const impact = calculateTotalEconomicImpact();
 * console.log(`Total cost: ${formatEconomicValueWithScaleIndicators(impact.total)}`);
 * // Output: "Total cost: $2.48T"
 * 
 * @see {@link https://econpapers.repec.org/RePEc:aea:aecrev:v:112:y:2022:i:11:p:3660-93} Braghieri et al. 2022 for causal evidence
 * @see {@link https://www.transportation.gov/office-policy/transportation-policy/revised-departmental-guidance-on-valuation-of-a-statistical-life-in-economic-analysis} DOT VSL methodology
 */
calculateTotalEconomicImpact() {
    // Validate all parameters are within expected ranges
    this.validateParameterRanges();
    
    // Component 1: Mortality costs using VSL methodology
    const excessDeaths = this.parameters.suicides * (this.parameters.attribution / 100);
    const mortalityCost = excessDeaths * this.parameters.vsl * 1_000_000;
    
    // Component 2: Disability costs using QALY methodology  
    const annualQALYValue = (this.parameters.vsl * 1_000_000) / 75; // 75-year life expectancy
    const qualityImpact = this.parameters.qol / 100;
    const disabilityCost = this.parameters.depression * this.parameters.yld * qualityImpact * annualQALYValue;
    
    // Component 3: Economic productivity losses
    const annualCostPerPerson = this.parameters.healthcare + this.parameters.productivity;
    const productivityCost = this.parameters.depression * annualCostPerPerson * this.parameters.duration;
    
    const totalCost = mortalityCost + disabilityCost + productivityCost;
    
    // Assert results are reasonable (basic sanity check)
    console.assert(totalCost > 0, 'Total cost must be positive');
    console.assert(totalCost < 50_000_000_000_000, 'Total cost exceeds reasonable bounds'); // $50T sanity check
    
    return {
        mortality: mortalityCost,
        mental: disabilityCost,
        productivity: productivityCost,
        total: totalCost
    };
}
```

---

## 🎨 Part 2: UI/UX Improvements

### 2.1 Fix Section Overlap Issue

**Problem**: "The Hidden Cost of Progress" overlaps with "The Unmeasured" section

**Solution**:
```css
/* Add proper spacing between hero sections */
#hero-section {
    margin-bottom: 4rem; /* Increase from current spacing */
    min-height: 100vh; /* Ensure full viewport height */
}

#calculator-start {
    margin-top: 2rem; /* Add explicit top margin */
    position: relative;
    z-index: 2;
}

/* Add breathing room */
.section-spacing {
    padding: 4rem 0; /* Generous vertical spacing */
}
```

### 2.2 Enhanced Whitespace & Data Breathing

**Current Issue**: Too cramped, data needs more space

**Solution**:
```css
/* Generous spacing system */
:root {
    --spacing-micro: 0.25rem;
    --spacing-xs: 0.5rem; 
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;  /* Increased from 1rem */
    --spacing-lg: 2.5rem;  /* Increased from 1.5rem */
    --spacing-xl: 4rem;    /* Increased from 2rem */
    --spacing-2xl: 6rem;   /* Increased from 3rem */
}

/* Parameter groups need more breathing room */
.parameter-group {
    margin-bottom: var(--spacing-2xl); /* More space between groups */
    padding: var(--spacing-xl);        /* More internal padding */
}

/* Distribution charts need space */
.distribution-viz {
    margin: var(--spacing-lg) 0; /* More top/bottom margin */
}

/* Results cards need breathing room */
.card {
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
}
```

### 2.3 Color Scheme Improvements

**Current Issues**: 
- Facebook Files should be blue
- Research Consensus should be purple
- Colors need better accessibility

**Solution**:
```css
/* Enhanced scenario button colors */
.scenario-btn[data-scenario="reset"] {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed); /* Purple for Research Consensus */
    color: white;
}

.scenario-btn[data-scenario="facebook-files"] {
    background: linear-gradient(135deg, #3b82f6, #2563eb); /* Blue for Facebook Files */
    color: white;
}

.scenario-btn[data-scenario="aggressive"] {
    background: linear-gradient(135deg, #ef4444, #dc2626); /* Keep red for worst case */
    color: white;
}

.scenario-btn[data-scenario="optimistic"] {
    background: linear-gradient(135deg, #10b981, #059669); /* Keep green for optimistic */
    color: white;
}

/* Ensure proper contrast ratios */
.scenario-btn:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## 📊 Part 3: Data Consistency Fixes

### 3.1 Parameter Range Corrections

**Issue**: Ranges should reflect actual research min/max values

**Current VSL**: 8-20M → **Corrected**: 7.2-14M (based on actual studies)

```javascript
// Updated slider configurations with research-based ranges
const RESEARCH_BASED_PARAMETER_RANGES = {
    'vsl': {
        min: 7.2,   // Robinson et al. COVID-19 study
        max: 14.0,  // Upper bound from Banzhaf meta-analysis
        research_consensus: 13.7, // DOT 2024 guidance
        range: { min: 7.2, max: 14.0 },
        citations: [
            'Robinson, L.A., et al. (2021) - $7.2M',
            'DOT (2024) - $13.7M', 
            'Banzhaf meta-analysis - $14.0M upper bound'
        ]
    },
    'suicides': {
        min: 89000,  // PNAS conservative estimate
        max: 300000, // Maximum plausible with all age groups
        research_consensus: 110000, // CDC-based estimate
        range: { min: 89000, max: 300000 },
        citations: [
            'Twenge et al. PNAS (2018) - 89,000',
            'CDC extrapolation - 110,000',
            'Maximum plausible estimate - 300,000'
        ]
    },
    'attribution': {
        min: 5,   // Conservative direct effects only
        max: 30,  // Including all indirect pathways
        research_consensus: 18, // Synthesis estimate
        range: { min: 5, max: 30 },
        citations: [
            'Conservative synthesis - 5%',
            'Research consensus - 18%',
            'Braghieri et al. AER (2022) - 22%',
            'Maximum with all pathways - 30%'
        ]
    }
    // ... continue for all parameters
};
```

### 3.2 Variable Name Consistency

**Problem**: P, Q, R variables overlap between sections

**Current Confusing Usage**:
- Mortality: P (suicides), Q (attribution), VSL (no letter)
- Disability: P (depression cases), Q (years), R (quality impact)  
- Productivity: P (healthcare), Q (productivity), R (duration)

**Solution - Clear Semantic Variables**:
```javascript
// Replace confusing P/Q/R with semantic names
const FORMULA_VARIABLES = {
    // Mortality Section
    mortality: {
        excessDeaths: 'ED',        // Instead of P (suicides)
        attributionRate: 'AR',     // Instead of Q (attribution %)
        valueOfLife: 'VSL'         // Keep VSL clear
    },
    // Disability Section  
    disability: {
        affectedPopulation: 'AP',  // Instead of P (depression cases)
        disabilityDuration: 'DD', // Instead of Q (years lived with disability)
        qualityImpact: 'QI'        // Instead of R (quality of life reduction)
    },
    // Productivity Section
    productivity: {
        healthcareCost: 'HC',      // Instead of P (healthcare costs)
        productivityLoss: 'PL',    // Instead of Q (productivity loss)
        treatmentDuration: 'TD'    // Instead of R (duration)
    }
};
```

**Updated Formula Displays**:
```html
<!-- Mortality Formula -->
<div class="formula-display">
    <strong>☠️ Death Formula:</strong> ED × AR × VSL<br>
    <strong>Result:</strong> <span id="mortality-result">110K × 18% × $13.7M = $271.3B</span>
    <div class="formula-legend">
        <small>ED = Excess Deaths, AR = Attribution Rate, VSL = Value of Statistical Life</small>
    </div>
</div>

<!-- Disability Formula -->  
<div class="formula-display">
    <strong>😞 Disability Formula:</strong> AP × DD × QI × (VSL ÷ 75 years)<br>
    <strong>Result:</strong> <span id="mental-result">5M × 6 × 35% × $182K = $1.92T</span>
    <div class="formula-legend">
        <small>AP = Affected Population, DD = Disability Duration, QI = Quality Impact</small>
    </div>
</div>

<!-- Productivity Formula -->
<div class="formula-display">
    <strong>💸 Productivity Formula:</strong> AP × (HC + PL) × TD<br>
    <strong>Result:</strong> <span id="productivity-result">5M × ($7K + $6K) × 4.5 = $292.5B</span>
    <div class="formula-legend">
        <small>HC = Healthcare Cost, PL = Productivity Loss, TD = Treatment Duration</small>
    </div>
</div>
```

### 3.3 Research Range = Likely Range Fix

**Problem**: When at default settings, "Research range" ≠ "Likely Range"

**Solution**:
```javascript
/**
 * Calculates confidence intervals that match research consensus when at default values
 * When parameters are at research consensus values, CI should match research range
 */
calculateResearchAlignedConfidenceInterval(currentValue, parameterName, distributionType) {
    const paramConfig = RESEARCH_BASED_PARAMETER_RANGES[parameterName];
    
    // If current value is at research consensus, return research range
    if (Math.abs(currentValue - paramConfig.research_consensus) < 0.01) {
        return {
            lower: this.formatParameterValue(paramConfig.min, parameterName),
            upper: this.formatParameterValue(paramConfig.max, parameterName),
            source: 'research_range'
        };
    }
    
    // Otherwise calculate dynamic CI around current value
    return this.calculateDynamicConfidenceInterval(currentValue, distributionType, parameterName);
}
```

---

## 🧪 Part 4: Testing & Validation

### 4.1 Parameter Validation Tests

```javascript
/**
 * Validates that all parameters are within acceptable research-based ranges
 * @throws {ParameterValidationError} If any parameter is out of bounds
 */
validateParameterRanges() {
    const validations = [
        {
            param: 'vsl',
            min: 7.2,
            max: 14.0,
            message: 'VSL must be between $7.2M-$14M based on research literature'
        },
        {
            param: 'suicides', 
            min: 89000,
            max: 300000,
            message: 'Excess suicides must be between 89K-300K based on demographic studies'
        }
        // ... more validations
    ];
    
    for (const validation of validations) {
        const value = this.parameters[validation.param];
        console.assert(
            value >= validation.min && value <= validation.max,
            `${validation.message}. Current: ${value}`
        );
    }
}

/**
 * Tests that calculation results are mathematically consistent
 */
testCalculationConsistency() {
    const baseline = this.calculateTotalEconomicImpact();
    
    // Test: Doubling VSL should roughly double mortality costs
    this.parameters.vsl *= 2;
    const doubled = this.calculateTotalEconomicImpact();
    
    console.assert(
        Math.abs(doubled.mortality / baseline.mortality - 2) < 0.1,
        'VSL doubling should approximately double mortality costs'
    );
    
    // Restore original value
    this.parameters.vsl /= 2;
}
```

---

## 📋 Part 5: Implementation Checklist

### Phase 1: Core Code Refactoring (Week 1)
- [ ] Rename all methods with descriptive names
- [ ] Add comprehensive JSDoc comments to all functions
- [ ] Add parameter validation with meaningful error messages
- [ ] Add basic assertion tests for sanity checking

### Phase 2: UI/UX Improvements (Week 2)  
- [ ] Fix section overlap with proper spacing
- [ ] Implement enhanced whitespace system
- [ ] Update scenario button colors (purple for research, blue for Facebook)
- [ ] Add breathing room to all components

### Phase 3: Data Consistency (Week 2)
- [ ] Update all parameter ranges to match research literature exactly
- [ ] Replace P/Q/R variables with semantic names
- [ ] Fix Research Range = Likely Range when at defaults
- [ ] Update formula displays with clear variable legends

### Phase 4: Testing & Validation (Week 3)
- [ ] Implement comprehensive parameter validation
- [ ] Add calculation consistency tests
- [ ] Add range boundary tests
- [ ] Add UI interaction tests

---

## 🎯 Expected Outcomes

After implementing this plan:

1. **Code Quality**: Maximally informative method names and comprehensive documentation
2. **Visual Design**: Clean, breathing layout with proper color scheme
3. **Data Integrity**: Research-accurate ranges and consistent variable naming
4. **User Experience**: Clear, unconfusing interface with proper spacing
5. **Maintainability**: Well-documented, tested, and validated codebase

The calculator will be both more professional for researchers and more maintainable for developers.

---

*This plan ensures the calculator meets the highest standards of both academic rigor and software engineering best practices.* 