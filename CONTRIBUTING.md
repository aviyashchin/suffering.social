# Contributing to Suffering.Social

Thank you for your interest in contributing to this research project! This guide will help you get started.

## 🎯 Ways to Contribute

### 📚 Research Contributions (Most Needed!)
- **Add new studies**: Find peer-reviewed research on social media's impact
- **Update parameters**: Keep data current with latest findings
- **Verify citations**: Check existing research links and findings
- **Add international data**: Expand beyond US-focused research

### 💻 Technical Contributions  
- **Bug fixes**: Fix calculation errors or UI issues
- **Performance**: Improve load times and responsiveness
- **Mobile optimization**: Better touch targets and responsive design
- **Accessibility**: WCAG compliance and screen reader support
- **Testing**: Add automated tests for calculations

### 🎨 Design Contributions
- **UI/UX improvements**: Better user experience
- **Data visualization**: New charts and interactive elements
- **Documentation**: Improve explanations and help text
- **Educational content**: Create guides and tutorials

## 🚀 Quick Start for Developers

### Prerequisites
- **Node.js** 16+ (optional, but recommended for development)
- **Git** for version control
- **Text editor** (VS Code, etc.)

### Setup
```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/suffering.social.git
cd suffering.social

# 3. Install dependencies (optional)
npm install

# 4. Start development server
npm run dev
# Opens at http://localhost:3000

# 5. Make your changes and test locally
```

### File Structure
```
social_media_cost_calculatorv5.html  # Main calculator (single file)
├── HTML structure                    # Page layout
├── CSS styles                       # All styling (embedded)
├── JavaScript                       # Calculator logic (embedded)
├── Research data                    # Citation database
└── Distribution charts              # Uncertainty visualizations
```

## 📊 Research Guidelines

### Adding New Studies
When adding research, please include:

1. **Full citation** with DOI/URL
2. **Key finding** relevant to the calculator
3. **Study methodology** (RCT, longitudinal, etc.)
4. **Sample size** and population
5. **Confidence level** (high/medium/low)

### Parameter Updates
For updating parameter values:

1. **Source**: Must be peer-reviewed or government data
2. **Recency**: Prefer studies from 2020+
3. **Sample size**: Larger studies preferred
4. **Replication**: Studies that have been replicated
5. **Methodology**: Clear causal identification preferred

### Example Research Addition
```javascript
{
    title: 'Social Media Use and Mental Health Among Adolescents',
    authors: 'Smith, J., Jones, A., et al.',
    finding: '15% increase in depression rates associated with 2+ hours daily use',
    method: 'Longitudinal cohort study of 2,500 adolescents over 3 years',
    link: 'https://doi.org/10.1000/journal.example.2024.001',
    sliderUpdates: { 'attribution': 15, 'depression': 6000000 },
    confidence: 'high'
}
```

## 🛠️ Technical Guidelines

### Code Style
- **Single file architecture**: Keep everything in the main HTML file
- **Embedded CSS/JS**: No external files for simplicity
- **Comments**: Explain complex calculations
- **Performance**: Consider mobile devices
- **Accessibility**: Use semantic HTML and ARIA labels

### Testing Your Changes
1. **Manual testing**: Try all sliders and scenarios
2. **Cross-browser**: Test in Chrome, Firefox, Safari
3. **Mobile**: Test on actual mobile devices
4. **Performance**: Check with Chrome DevTools
5. **Calculations**: Verify math is correct

### Debug Utilities
The calculator includes debug functions:
```javascript
// Test distribution charts
debugDistributionCharts()

// Test parameter validation  
testParameterValidation()

// Test calculation consistency
testCalculationConsistency()
```

## 📝 Pull Request Process

### Before Submitting
1. **Test thoroughly** on multiple browsers
2. **Check calculations** for accuracy
3. **Update documentation** if needed
4. **Verify research citations** are correct
5. **Consider mobile experience**

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New research data
- [ ] Feature enhancement  
- [ ] Documentation update

## Research (if applicable)
- Study title and authors
- DOI/URL to source
- Key findings relevant to calculator

## Testing
- [ ] Tested in multiple browsers
- [ ] Verified calculations are correct
- [ ] Checked mobile responsiveness
```

### Review Process
1. **Automated checks**: Basic validation
2. **Research review**: For studies and data updates
3. **Technical review**: For code changes
4. **Final approval**: From maintainers

## 🔬 Research Priorities

### High Priority
- **Causal studies**: Natural experiments, RCTs
- **Recent data**: Studies from 2022+
- **Large samples**: N > 1,000
- **Diverse populations**: International, various demographics

### Medium Priority  
- **Replication studies**: Confirming existing findings
- **Meta-analyses**: Synthesis of multiple studies
- **Economic studies**: Cost-benefit analyses
- **Longitudinal data**: Long-term effects

### Low Priority
- **Opinion pieces**: Non-empirical work
- **Small studies**: N < 100
- **Correlational only**: Without causal evidence
- **Non-peer reviewed**: Preprints, blog posts

## 🤝 Community Guidelines

### Communication
- **Be respectful**: Professional, constructive feedback
- **Stay focused**: Keep discussions on-topic
- **Cite sources**: Back claims with evidence
- **Ask questions**: When unsure about anything

### Code of Conduct
- **Inclusive environment**: Welcome all contributors
- **Scientific rigor**: Evidence-based discussions
- **No spam**: Keep contributions meaningful
- **Attribution**: Credit original research appropriately

## 🆘 Getting Help

### Resources
- **GitHub Issues**: Report bugs or ask questions
- **Documentation**: Check docs/ folder
- **Discord**: Join our community for discussions
- **Email**: research@subconscious.ai for complex questions

### Common Questions
- **"How are calculations done?"** → See methodology section
- **"Can I add my own research?"** → Yes! Follow research guidelines
- **"How to test changes?"** → Use `npm run dev` for local testing
- **"What if I find an error?"** → Open an issue with details

---

## 🌟 Recognition

Contributors will be:
- **Listed** in project documentation
- **Credited** for significant research additions
- **Acknowledged** in academic citations
- **Invited** to collaborate on related projects

Thank you for helping make this research more accurate and impactful! 🙏

*Questions? Open an issue or reach out on Discord.* 