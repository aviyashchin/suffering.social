# Social Media Cost Calculator - Master Guide

## 🎯 Core Objectives

**Primary Purpose**: Estimate the economic impact of social media on mental health using research-based calculations.

**Key Features**:
- Interactive parameter adjustment with real-time calculations
- Multiple scenario presets (optimistic, aggressive, research consensus)
- Uncertainty analysis with visual distributions
- Research-backed formulas with citations
- Community impact calculator
- Social sharing capabilities

## 🏗️ Architecture Principles

### **1. Single Responsibility**
- Each component handles one specific concern
- Calculator logic separate from UI rendering
- Data separate from presentation

### **2. Configuration-Driven**
- All values, scenarios, and settings in `src/utils/constants.js`
- No hard-coded values in components
- Easy parameter updates without code changes

### **3. Modular Design**
- Independent, reusable components
- Clear input/output interfaces
- Minimal cross-dependencies

### **4. Documentation-First**
- Every function documented with inputs/outputs
- Component usage examples provided
- Maintenance procedures clearly outlined

## 📁 File Structure

```
/
├── index.html                     # Main application entry point
├── docs/                          # All documentation
│   ├── MASTER_GUIDE.md           # This file - primary reference
│   ├── API_DOCUMENTATION.md      # Function/component documentation
│   ├── COMPONENT_GUIDE.md        # How to use each component
│   └── MAINTENANCE_GUIDE.md      # Common editing tasks
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Calculator.js         # Core calculation engine
│   │   ├── FixedElements.js      # Sticky positioning system
│   │   ├── Charts.js            # All data visualizations
│   │   ├── Tooltips.js          # Information popup system
│   │   └── ShareFeatures.js     # Social media sharing
│   ├── utils/                   # Helper functions and config
│   │   ├── constants.js         # ALL configuration values
│   │   ├── formatters.js        # Number/text formatting
│   │   ├── validators.js        # Input validation
│   │   └── helpers.js          # Utility functions
│   ├── styles/                  # Modular CSS
│   │   ├── base.css            # Reset, typography, core styles
│   │   ├── components.css      # Component-specific styles
│   │   ├── layout.css          # Grid, positioning, responsive
│   │   └── themes.css          # Colors, dark mode, theming
│   └── app.js                  # Main application orchestrator
└── assets/                     # Static files (kept minimal)
```

## 🔧 Core Components

### **Calculator Component**
- **Purpose**: Performs all economic calculations
- **Input**: Parameter object with slider values
- **Output**: Structured cost breakdown object
- **Location**: `src/components/Calculator.js`

### **FixedElements Component**
- **Purpose**: Handles sticky positioning (top bar, help button, branding)
- **Replaces**: Complex "nuclear" CSS overrides
- **Location**: `src/components/FixedElements.js`

### **Charts Component**
- **Purpose**: All data visualizations (pie charts, timelines, etc.)
- **Dependencies**: Chart.js library
- **Location**: `src/components/Charts.js`

## 🎮 Common Editing Tasks

### **Adding a New Parameter**
1. Add default value to `src/utils/constants.js`
2. Add slider HTML to parameter section in `index.html`
3. Update calculation logic in `src/components/Calculator.js`
4. Add tooltip content to `src/components/Tooltips.js`
5. Test with various input ranges

### **Changing a Calculation Formula**
1. Locate formula in `src/components/Calculator.js`
2. Update the specific method (e.g., `calculateMortalityCosts()`)
3. Update formula display text in constants
4. Update any related documentation
5. Test edge cases

### **Updating UI Styling**
1. Identify component in `src/styles/components.css`
2. Make targeted changes (avoid global overrides)
3. Test responsive behavior
4. Verify accessibility (contrast, focus states)

### **Adding a New Scenario**
1. Add scenario object to `src/utils/constants.js`
2. Add button to scenario section in `index.html`
3. Update scenario handler in `src/app.js`
4. Test all parameters load correctly

## ⚠️ Critical Guidelines

### **DO:**
- Always update constants.js for value changes
- Document any new functions with JSDoc
- Test across different screen sizes
- Keep components focused on single responsibilities
- Use semantic HTML and proper accessibility attributes

### **DON'T:**
- Edit compiled or generated files
- Add inline styles (use CSS classes)
- Hard-code values in JavaScript
- Create circular dependencies between components
- Use complex CSS workarounds (keep it simple)

## 🐛 Debugging Guide

### **Calculation Issues**
1. Check browser console for JavaScript errors
2. Verify input values in `Calculator.js`
3. Test individual calculation methods
4. Check for divide-by-zero or infinity values

### **UI/Display Issues**
1. Verify CSS is loading properly
2. Check responsive breakpoints
3. Test in different browsers
4. Validate HTML structure

### **Performance Issues**
1. Check for excessive DOM updates
2. Monitor calculation frequency
3. Verify event listener cleanup
4. Test with large input values

## 📚 Research Foundation

### **Core Studies Referenced**
- Braghieri et al. (2022) - Facebook rollout causal analysis
- Twenge et al. (2018) - Teen mental health trends
- Greenberg et al. (2021) - Depression economic burden
- US DOT (2024) - Value of Statistical Life guidance

### **Calculation Methodology**
- **Mortality Costs**: P × Q × VSL (deaths × attribution × value per life)
- **Mental Health Costs**: P × Q × R × (VSL ÷ 75) (people × years × quality loss × annual value)
- **Healthcare Costs**: People × (Healthcare + Productivity) × Duration

### **Data Sources**
- CDC WONDER database for mortality statistics
- NIMH for depression prevalence
- WHO methodology for QALY calculations
- Government agencies for economic valuations

## 🔄 Version Control

### **File Naming Convention**
- Use descriptive, lowercase names with hyphens
- Version numbers only for major architectural changes
- Keep file names under 30 characters

### **Change Documentation**
- Update relevant documentation when changing functionality
- Add comments for complex logic
- Note any breaking changes in commit messages

## 🎯 Performance Standards

### **Load Time Targets**
- Initial page load: < 2 seconds
- Interactive ready: < 3 seconds
- Calculation updates: < 100ms

### **Code Quality Metrics**
- Function length: < 20 lines typical, < 50 lines maximum
- File length: < 300 lines for components, < 500 lines for utilities
- CSS specificity: Avoid !important except for critical overrides
- JavaScript complexity: Keep cyclomatic complexity < 10

## 🔮 Future Enhancement Areas

### **Planned Features**
- Dark mode toggle
- Data export functionality
- Advanced uncertainty modeling
- Multi-language support
- Mobile app version

### **Technical Debt to Address**
- Replace any remaining inline styles
- Implement proper error boundaries
- Add comprehensive test suite
- Optimize bundle size

---

**Last Updated**: December 2024  
**Next Review**: When adding major features or after significant changes 