# Maintenance Guide

Step-by-step instructions for common editing tasks. Each task should take **5 minutes or less** with this refactored codebase.

## 🎯 Quick Reference

| Task | Time | Files to Edit | Difficulty |
|------|------|---------------|------------|
| Add new parameter | 5 min | constants.js, index.html | Easy |
| Change calculation formula | 3 min | Calculator.js | Easy |
| Update UI styling | 2 min | components.css | Easy |
| Add new scenario | 4 min | constants.js | Easy |
| Change default values | 1 min | constants.js | Very Easy |
| Update research citations | 3 min | constants.js | Easy |

---

## 📋 Common Tasks

### 1. Adding a New Parameter

**Example**: Adding "Social Media Hours per Day" parameter

**Time**: ~5 minutes

**Steps**:

1. **Add to constants** (`src/utils/constants.js`):
```javascript
// In DEFAULTS object:
socialMediaHours: 3.5,  // Daily social media usage hours

// In RANGES object:  
socialMediaHours: { min: 1, max: 8, step: 0.1 },

// Update all scenario values:
values: {
  // ... existing values ...
  socialMediaHours: 3.5
}
```

2. **Add HTML slider** (`index.html`):
```html
<div class="parameter">
  <label class="parameter-label">
    <span>Daily Social Media Hours</span>
    <span class="parameter-value" id="social-media-hours-value">3.5 hours</span>
  </label>
  <input type="range" id="social-media-hours-slider" class="parameter-slider">
</div>
```

3. **Add to slider config** (`src/app.js`):
```javascript
// In setupSliders() method, add to sliderConfigs array:
{ id: 'social-media-hours-slider', param: 'socialMediaHours', valueId: 'social-media-hours-value', type: 'socialMediaHours' }
```

4. **Add formatting** (`src/utils/formatters.js`):
```javascript
// In formatSliderValue() function, add new case:
case 'socialMediaHours':
  return formatYears(value);
```

5. **Update calculation** (if needed) in `src/components/Calculator.js`

**Done!** The new parameter will automatically work with scenarios, reset, and calculations.

---

### 2. Changing a Calculation Formula

**Example**: Modifying the mortality cost calculation

**Time**: ~3 minutes

**Steps**:

1. **Update calculation method** (`src/components/Calculator.js`):
```javascript
calculateMortalityCosts() {
  const { suicides, attribution, vsl, socialMediaHours } = this.parameters;
  
  // NEW FORMULA: Include social media hours factor
  const attributionDecimal = attribution / 100;
  const vslActual = vsl * 1000000;
  const hoursFactor = socialMediaHours / 4; // Scale based on 4-hour baseline
  
  const mortalityCost = suicides * attributionDecimal * vslActual * hoursFactor;
  
  // ... validation stays the same ...
  return mortalityCost;
}
```

2. **Update formula display** (`src/utils/constants.js`):
```javascript
// In FORMULAS object:
mortality: {
  display: 'P × Q × VSL × H',
  description: 'Deaths × Attribution % × Value per Life × Hours Factor',
  variables: ['suicides', 'attribution', 'vsl', 'socialMediaHours']
}
```

3. **Update display formula** (`src/components/Calculator.js`):
```javascript
// In getFormulaResults() method:
mortality: {
  formula: `${this.formatNumber(suicides)} × ${attribution}% × $${vsl}M × ${socialMediaHours}hrs`,
  result: this.formatCurrency(this.results.mortality),
  description: FORMULAS.mortality.description
}
```

**Done!** The formula will update everywhere automatically.

---

### 3. Updating UI Styling

**Example**: Changing the color scheme for mortality parameters

**Time**: ~2 minutes

**Steps**:

1. **Update component CSS** (`src/styles/components.css`):
```css
/* Find the mortality parameter group section: */
.parameter-group[data-group="mortality"] {
  border-left: 4px solid #dc2626; /* Change this color */
}

.parameter-group[data-group="mortality"] h3 {
  color: #dc2626; /* Change this color */
}
```

2. **Update colors in constants** (optional, `src/utils/constants.js`):
```javascript
// In UI.colors object:
primary: '#ef4444',  // New red color for mortality
```

**Done!** The new colors will apply immediately.

---

### 4. Adding a New Scenario

**Example**: Adding "Post-Regulation Scenario"

**Time**: ~4 minutes

**Steps**:

1. **Add scenario definition** (`src/utils/constants.js`):
```javascript
// In SCENARIOS object:
postRegulation: {
  name: 'Post-Regulation Scenario',
  emoji: '⚖️',
  description: 'Estimated impact after platform regulation',
  values: {
    vsl: 13.7,
    suicides: 80000,     // Reduced due to regulation
    attribution: 12,      // Lower attribution
    depression: 3000000,  // Fewer affected people
    yld: 6.0,
    qol: 30,             // Less severe impact
    healthcare: 6500,
    productivity: 5500,
    duration: 3.5
  }
}
```

2. **Add button to HTML** (`index.html`):
```html
<!-- Add to scenario-buttons grid: -->
<button class="scenario-btn" data-scenario="postRegulation">⚖️ Post-Regulation</button>
```

3. **Update CSS grid** (if needed, `src/styles/components.css`):
```css
.scenario-buttons {
  grid-template-columns: repeat(3, 1fr); /* Change from 2 to 3 if adding 5th button */
}
```

**Done!** The new scenario will work with all existing functionality.

---

### 5. Changing Default Values

**Example**: Updating the default VSL to new government guidance

**Time**: ~1 minute

**Steps**:

1. **Update constants** (`src/utils/constants.js`):
```javascript
// In DEFAULTS object:
vsl: 15.2,  // Updated from 13.7 to new DOT guidance

// Update reset scenario (automatically uses DEFAULTS):
reset: {
  name: 'Research Consensus Values',
  emoji: '🔬',
  description: 'Values based on peer-reviewed research and government data',
  values: { ...DEFAULTS }  // This automatically picks up the new default
}
```

**Done!** The new default will apply to fresh loads and the reset scenario.

---

### 6. Updating Research Citations

**Example**: Adding a new study reference

**Time**: ~3 minutes

**Steps**:

1. **Add citation** (`src/utils/constants.js`):
```javascript
// In CITATIONS object:
newStudy2024: {
  source: 'Smith et al. (2024) - Nature Mental Health',
  url: 'https://nature.com/articles/s44220-024-00123-4',
  finding: 'Causal relationship confirmed with 25% attribution rate'
}
```

2. **Update research section** (`index.html`):
```html
<!-- Add to research-links grid: -->
<a href="https://nature.com/articles/s44220-024-00123-4" class="research-link p-3 bg-white rounded border" target="_blank">
  <strong>Smith et al. (2024)</strong><br>
  <span class="text-sm text-gray-600">Confirms 25% attribution rate</span>
</a>
```

**Done!** The new citation is now available and linked.

---

## 🔧 Advanced Tasks

### Adding a New Calculation Type

**Example**: Adding "Educational Impact" costs

**Time**: ~10 minutes

**Steps**:

1. **Add parameters** to `src/utils/constants.js`
2. **Add calculation method** to `src/components/Calculator.js`:
```javascript
calculateEducationalCosts() {
  const { students, testScoreDecline, futureLoss } = this.parameters;
  return students * testScoreDecline * futureLoss;
}
```

3. **Update `calculateAll()` method** to include new cost type
4. **Add HTML section** to `index.html`
5. **Add styling** to `src/styles/components.css`

### Adding Data Visualization

**Example**: Adding a new chart type

**Time**: ~15 minutes

**Steps**:

1. **Add Chart.js configuration** in a new file `src/components/Charts.js`
2. **Add canvas element** to `index.html`
3. **Initialize chart** in `src/app.js`
4. **Update chart data** in display update methods

---

## 🚨 Critical Guidelines

### DO:
- ✅ Always update `constants.js` first for any new values
- ✅ Test in multiple browsers after UI changes  
- ✅ Use existing CSS classes when possible
- ✅ Follow the established naming conventions
- ✅ Add proper JSDoc comments for new functions

### DON'T:
- ❌ Hard-code values directly in JavaScript or HTML
- ❌ Add inline styles instead of using CSS classes  
- ❌ Modify the Calculator class without updating tests
- ❌ Create circular dependencies between components
- ❌ Use complex CSS workarounds (keep it simple)

---

## 🧪 Testing Your Changes

### Quick Manual Test Checklist:

1. **Load page** - No console errors
2. **Adjust sliders** - Values update in real-time  
3. **Click scenarios** - All presets load correctly
4. **Community calculator** - Calculates and displays results
5. **Help modal** - Opens and closes properly
6. **Share buttons** - Open correct social media URLs
7. **Mobile view** - Layout works on small screens

### Browser Testing:
- Chrome (primary)
- Firefox  
- Safari
- Edge

### Performance Check:
- Page loads in < 3 seconds
- Slider updates feel smooth (< 100ms)
- No memory leaks in console

---

## 🐛 Common Issues & Solutions

### Issue: Slider not updating display
**Solution**: Check slider ID matches the config in `setupSliders()`

### Issue: New parameter not in scenario
**Solution**: Add parameter to all scenario `values` objects in constants

### Issue: Calculation returns NaN
**Solution**: Check parameter validation in `Calculator.js`

### Issue: CSS not applying
**Solution**: Check CSS selector specificity and file load order

### Issue: Console errors on load
**Solution**: Verify all required HTML elements exist with correct IDs

---

## 📱 Mobile Considerations

### Touch-Friendly Requirements:
- Buttons minimum 44px height
- Slider handles at least 24px 
- Adequate spacing between interactive elements

### Responsive Testing:
- iPhone SE (375px width)
- iPad (768px width)  
- Desktop (1200px+ width)

---

## 🎨 Design System

### Color Scheme:
- **Red** (#dc2626): Mortality, errors, critical values
- **Purple** (#8b5cf6): Mental health, secondary actions
- **Green** (#059669): Healthcare, success states
- **Blue** (#3b82f6): Interactive elements, links
- **Gray** (#374151): Text, backgrounds

### Typography:
- **Headers**: system-ui, 600 weight
- **Body**: system-ui, 400 weight  
- **Code/Data**: 'Courier New', monospace
- **Interactive**: 500 weight for emphasis

### Spacing:
- **Small**: 0.5rem (8px)
- **Medium**: 1rem (16px) 
- **Large**: 1.5rem (24px)
- **XL**: 2rem (32px)

---

## 📖 File Organization

### When to create new files:
- **New component**: 50+ lines of focused functionality
- **New utility**: Reusable functions used in 3+ places
- **New feature**: Self-contained feature with own styling

### When to extend existing files:
- **Simple additions**: < 20 lines of code
- **Related functionality**: Builds on existing features
- **Minor modifications**: Tweaking existing behavior

---

## 🔄 Deployment Checklist

Before pushing changes to production:

1. ✅ All files saved and formatted
2. ✅ No console errors or warnings  
3. ✅ Manual testing completed
4. ✅ Performance check passed
5. ✅ Mobile layout verified
6. ✅ All scenarios tested
7. ✅ Documentation updated if needed

---

## 💡 Optimization Tips

### For Performance:
- Use `const` for values that won't change
- Avoid frequent DOM queries (cache element references)
- Debounce expensive operations
- Use CSS transforms for animations

### For Maintainability:  
- Keep functions under 20 lines when possible
- Use descriptive variable names
- Add comments for complex logic
- Follow established patterns

### For User Experience:
- Provide immediate feedback for interactions
- Use appropriate loading states
- Include error messages that help users
- Ensure keyboard navigation works

---

**Remember**: The goal is to make changes quickly and confidently. If a task takes longer than expected, there might be a simpler approach following the established patterns. 