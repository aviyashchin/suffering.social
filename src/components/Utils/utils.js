        class CalculatorUtils {
            static formatLargeNumber(value) {
                if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
                if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
                return value.toFixed(0);
            }
            static debounce(func, delay) {
                let timeoutId;
                return (...args) => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => func.apply(this, args), delay);
                };
            }
            static throttle(func, delay) {
                let inThrottle;
                return (...args) => {
                    if (!inThrottle) {
                        func.apply(this, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, delay);
                    }
                };
            }
        }
        class UIHelpers {
            static updateElementSafely(elementId, newContent, isHTML = false) {
                const element = document.getElementById(elementId);
                if (!element) {
                    console.warn(`Element ${elementId} not found`);
                    return false;
                }
                if (isHTML) {
                    element.innerHTML = newContent;
                } else {
                    element.textContent = newContent;
                }
                return true;
            }
            static addLoadingState(element) {
                if (element) {
                    element.classList.add('updating');
                    element.style.opacity = '0.7';
                }
            }
            static removeLoadingState(element) {
                if (element) {
                    element.classList.remove('updating');
                    element.style.opacity = '1';
                }
            }
            static animateValue(element, fromValue, toValue, duration = 300) {
                if (!element || !window.requestAnimationFrame) {
                    element.textContent = toValue;
                    return;
                }
                const startTime = performance.now();
                const startValue = parseFloat(fromValue) || 0;
                const endValue = parseFloat(toValue) || 0;
                const valueRange = endValue - startValue;
                function animate(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
                    const currentValue = startValue + (valueRange * easeOutProgress);
                    element.textContent = CalculatorUtils.formatLargeNumber(currentValue);
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                }
                requestAnimationFrame(animate);
            }
            static getElementDimensions(element) {
                if (!element) return { width: 0, height: 0 };
                const rect = element.getBoundingClientRect();
                return { width: rect.width, height: rect.height };
            }
        }
        class MobileOptimizations {
            static isMobile() {
                return window.innerWidth <= 768;
            }
            static isTablet() {
                return window.innerWidth > 768 && window.innerWidth <= 1024;
            }
            static getOptimalContainerWidth() {
                if (this.isMobile()) return '100%';
                if (this.isTablet()) return '95%';
                return '90%';
            }
            static getOptimalPadding() {
                if (this.isMobile()) return '1rem';
                if (this.isTablet()) return '1.5rem';
                return '2rem';
            }
            static shouldReduceAnimations() {
                return this.isMobile() || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            }
            static optimizeForTouch() {
                const buttons = document.querySelectorAll('button, .btn');
                buttons.forEach(btn => {
                    if (this.isMobile()) {
                        btn.style.minHeight = '44px';
                        btn.style.minWidth = '44px';
                    }
                });
            }
        }
        class VariableMapper {
            static semanticNames = {
                'vsl': 'valueOfStatisticalLife',
                'suicides': 'excessDeaths', 
                'attribution': 'attributionRate',
                'depression': 'affectedPopulation',
                'yld': 'disabilityDuration', 
                'qol': 'qualityImpact',
                'healthcare': 'healthcareCost',
                'productivity': 'productivityLoss',
                'duration': 'treatmentDuration'
            };
            static getSemanticName(shortName) {
                return this.semanticNames[shortName] || shortName;
            }
            static getAllSemanticNames() {
                return this.semanticNames;
            }
        }
                this.debouncedUpdateDisplays = _.debounce(() => this.updateAllDisplays(), 500);
                this.debouncedUpdateCharts = _.debounce((results) => this.updateChartsWithAnimation(results), 800);
                this.throttledScrollHandler = _.throttle(this.handleScroll.bind(this), 50); // 20fps for better performance
                this.init();
            }
            init() {
                try {
                    this.initializeUtilities();
                    this.optimizeForDevice();
                    this.setupSliders();
                    this.setupScenarioButtons();
                    this.setupHelpModal();
                    this.setupInfoButtons();
                    this.setupCommunityCalculator();
                    this.setupShareButtons();
                    this.setupGDPComparisons();
                    this.setupSocialProof();
                    this.setupCausalModal();
                    this.setupDistributionCharts();
                    this.setupCharts();
                    this.startRunningCounter();
                    this.updateAllDisplays();
                    this.startSocialProofAnimations();
                    this.setupEnhancedEventListeners();
                    console.log('✅ Enhanced Calculator with utilities and mobile optimization initialized');
                } catch (error) {
                    console.error('❌ Enhanced Calculator init failed:', error);
                    throw error; // Re-throw to trigger fallback
                }
            }
            initializeUtilities() {
                this.utils = CalculatorUtils;
                this.ui = UIHelpers;
                this.mobile = MobileOptimizations;
                this.variables = VariableMapper;
                window.calcUtils = this.utils;
                window.uiHelpers = this.ui;
                window.mobileHelpers = this.mobile;
                console.log('🛠️ Calculator utilities initialized');
            }
            optimizeForDevice() {
                if (this.mobile.isMobile()) {
                    console.log('📱 Optimizing for mobile device');
                    this.mobile.optimizeForTouch();
                    document.body.classList.add('mobile-optimized');
                } else if (this.mobile.isTablet()) {
                    console.log('📱 Optimizing for tablet device');  
                    document.body.classList.add('tablet-optimized');
                } else {
                    console.log('🖥️ Desktop interface active');
                    document.body.classList.add('desktop-optimized');
                }
                const containers = document.querySelectorAll('.container');
                containers.forEach(container => {
                    container.style.maxWidth = this.mobile.getOptimalContainerWidth();
                    container.style.padding = this.mobile.getOptimalPadding();
                });
            }
            setupEnhancedEventListeners() {
                window.addEventListener('scroll', this.throttledScrollHandler);
                window.addEventListener('resize', _.debounce(() => {
                document.addEventListener('input', _.debounce((e) => {
                    this.debouncedUpdateDisplays();
                }
            }
            findClosestScenario() {
                    { id: 'total-cost', value: this.formatCurrency(results.total), delay: 0 },
                    { id: 'total-amount', value: Math.round(results.total).toLocaleString(), delay: 50 },
                    { id: 'hero-total-cost', value: this.formatCurrency(results.total), delay: 100 },
                    { id: 'gdp-percentage', value: `${gdpPercentage}%`, delay: 150 }
                ];
                _.forEach(updates, (update, index) => {
                    setTimeout(() => {
                        if (update.id === 'gdp-percentage') {
                            UIHelpers.updateElementSafely(update.id, update.value);
                        } else {
                            this.animateValueUpdate(update.id, update.value, results.total, oldResults.total);
                        }
                    }, update.delay);
                });
                this.debouncedUpdateCharts(results);
                this.updateFormulaDisplays(results);
                this.refreshAllDistributionCharts();
                if (window.performanceMonitor) {
                    const updateTime = performance.now();
                    console.log(`📊 Display update completed in ${updateTime.toFixed(1)}ms`);
                }
            }
                this.debouncedUpdateDisplays();
                this.updateDistributionInfo();
                const mortalityFormula = `${Math.round(this.parameters.suicides/1000)}K × ${this.parameters.attribution}% × $${this.parameters.vsl}M = ${this.formatCurrency(results.mortality)}`;
                const mortalityResultEl = document.getElementById('mortality-result');
                if (mortalityResultEl) {
                    mortalityResultEl.textContent = mortalityFormula;
                }
                const mentalFormula = `${(this.parameters.depression/1000000).toFixed(1)}M × ${this.parameters.yld} × ${this.parameters.qol}% × $${Math.round(this.parameters.vsl * 1000000 / 75 / 1000)}K = ${this.formatCurrency(results.mental)}`;
                const mentalResultEl = document.getElementById('mental-result');
                if (mentalResultEl) {
                    mentalResultEl.textContent = mentalFormula;
                }
                const productivityFormula = `${(this.parameters.depression/1000000).toFixed(1)}M × ($${Math.round(this.parameters.healthcare/1000)}K + $${Math.round(this.parameters.productivity/1000)}K) × ${this.parameters.duration} = ${this.formatCurrency(results.productivity)}`;
                const productivityResultEl = document.getElementById('healthcare-result');
                if (productivityResultEl) {
                    productivityResultEl.textContent = productivityFormula;
                }
                const totalCostEl = document.getElementById('total-cost');
                if (totalCostEl) {
                    totalCostEl.textContent = this.formatCurrency(results.total);
                }
                const heroTotalEl = document.getElementById('hero-total-cost');
                if (heroTotalEl) {
                    heroTotalEl.textContent = this.formatCurrency(results.total);
                }
                this.debouncedUpdateDisplays();
                this.updateDistributionInfo();
            formatCurrency(amount) {
                const safeAmount = _.isNumber(amount) ? amount : 0;
                if (safeAmount >= 1000000000000) {
                    return `$${_.round(safeAmount / 1000000000000, 2)}T`;
                } else if (safeAmount >= 1000000000) {
                    return `$${_.round(safeAmount / 1000000000, 1)}B`;
                } else if (safeAmount >= 1000000) {
                    return `$${_.round(safeAmount / 1000000, 1)}M`;
                } else {
                    return `$${_.round(safeAmount, 0).toLocaleString()}`;
                }
            }
            getThemeColors(paramName) {
                const themeMap = {
                    'vsl': { fill: '#dc2626', stroke: '#b91c1c' },
                    'suicides': { fill: '#dc2626', stroke: '#b91c1c' },
                    'attribution': { fill: '#dc2626', stroke: '#b91c1c' },
                    'depression': { fill: '#8b5cf6', stroke: '#7c3aed' },
                    'yld': { fill: '#8b5cf6', stroke: '#7c3aed' },
                    'qol': { fill: '#8b5cf6', stroke: '#7c3aed' },
                    'healthcare': { fill: '#16a34a', stroke: '#15803d' },
                    'productivity': { fill: '#16a34a', stroke: '#15803d' },
                    'duration': { fill: '#16a34a', stroke: '#15803d' }
                };
                return themeMap[paramName] || { fill: '#3b82f6', stroke: '#2563eb' };
            }
            generateCachedDistributionPoints(width, height, paramName) {
                return this.generateDynamicDistributionPoints(width, height, paramName);
            }
            getVisualImportance(paramName) {
                return 1.0; // No visual weighting in basic calculator
            }
            updateDisplay(param, value) {
                const display = document.getElementById(`${param}-value`);
                if (!display) return;
                const formatters = {
                    vsl: v => `$${_.round(v, 1)}M`,
                    suicides: v => `${_.round(v/1000)}K`,
                    attribution: v => `${_.round(v)}%`,
                    depression: v => `${_.round(v/1000000, 1)}M`,
                    yld: v => `${_.round(v, 1)} years`,
                    qol: v => `${_.round(v)}%`,
                    healthcare: v => `$${_.round(v/1000)}K`,
                    productivity: v => `$${_.round(v/1000)}K`,
                    duration: v => `${_.round(v, 1)} years`
                };
                const formatter = formatters[param];
                display.textContent = formatter ? formatter(value) : _.round(value, 2);
            }
            animateValueUpdate(elementId, newText, newValue, oldValue) {
                return SocialMediaCalculator.prototype.animateValueUpdate.call(this, elementId, newText, newValue, oldValue);
            }
            updateChartsWithAnimation(results) {
                return SocialMediaCalculator.prototype.updateChartsWithAnimation.call(this, results);
            }
        }
                const mortalityFormula = `${Math.round(this.parameters.suicides/1000)}K × ${this.parameters.attribution}% × $${this.parameters.vsl}M = ${this.formatCurrency(results.mortality)}`;
                const mortalityResultEl = document.getElementById('mortality-result');
                if (mortalityResultEl) {
                    mortalityResultEl.textContent = mortalityFormula;
                }
                const mentalFormula = `${(this.parameters.depression/1000000).toFixed(1)}M × ${this.parameters.yld} × ${this.parameters.qol}% × $${Math.round(this.parameters.vsl * 1000000 / 75 / 1000)}K = ${this.formatCurrency(results.mental)}`;
                const mentalResultEl = document.getElementById('mental-result');
                if (mentalResultEl) {
                    mentalResultEl.textContent = mentalFormula;
                }
                const productivityFormula = `${(this.parameters.depression/1000000).toFixed(1)}M × ($${Math.round(this.parameters.healthcare/1000)}K + $${Math.round(this.parameters.productivity/1000)}K) × ${this.parameters.duration} = ${this.formatCurrency(results.productivity)}`;
                const productivityResultEl = document.getElementById('healthcare-result');
                if (productivityResultEl) {
                    productivityResultEl.textContent = productivityFormula;
                }
                const totalCostEl = document.getElementById('total-cost');
                if (totalCostEl) {
                    totalCostEl.textContent = this.formatCurrency(results.total);
                }
                const heroTotalEl = document.getElementById('hero-total-cost');
                if (heroTotalEl) {
                    heroTotalEl.textContent = this.formatCurrency(results.total);
                }
                        <div><strong>Total Economic Impact:</strong><br>${this.formatCurrency(localTotalCost)}</div>
                        <div><strong>Per Person Cost:</strong><br>${this.formatCurrency(perCapitaCost)}</div>
                        <div><strong>Estimated Depression Cases:</strong><br>${localDepression.toLocaleString()} people</div>
                        <div><strong>Estimated Deaths (15 years):</strong><br>${localSuicides.toLocaleString()} people</div>
                    </div>
                `;
                resultsDiv.classList.remove('hidden');
            }
            setupShareButtons() {
                const shareButtons = ['share-twitter', 'share-linkedin', 'share-facebook'];
                shareButtons.forEach(btnId => {
                    const btn = document.getElementById(btnId);
                    if (btn) {
                        btn.addEventListener('click', () => {
                            this.shareResults(btnId.replace('share-', ''));
                        });
                    }
                });
            }
            shareResults(platform) {
                const totalCost = this.formatCurrency(results.total);
                const messages = {
                    twitter: `Social media's hidden cost to society: ${totalCost}. Calculate your community's impact: https://suffering.social`,
                    linkedin: `Research shows social media's total economic impact reaches ${totalCost}. Explore: https://suffering.social`,
                    facebook: `Social media's impact costs ${totalCost}. See the analysis: https://suffering.social`
                };
                const urls = {
                    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`,
                    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://suffering.social')}`,
                    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://suffering.social')}`
                };
                window.open(urls[platform], '_blank', 'width=600,height=400');
                this.socialProofData.totalShares++;
                this.socialProofData.dailyShares++;
                this.updateSocialProofDisplays();
            }
            setupGDPComparisons() {
                const generateBtn = document.getElementById('generate-new-comparisons');
                if (generateBtn) {
                    generateBtn.addEventListener('click', () => {
                        console.log('🎲 Generate New Comparisons clicked');
                        this.updateGDPComparisons();
                        this.updateViralComparisons();
                    });
                    console.log('✅ Generate New Comparisons button connected');
                } else {
                    console.error('❌ Generate New Comparisons button not found');
                }
                this.updateGDPComparisons();
                this.updateViralComparisons();
            }
            updateGDPComparisons() {
                if (!this.gdpComparisons || !Array.isArray(this.gdpComparisons) || this.gdpComparisons.length === 0) {
                    console.warn('⚠️ GDP comparisons not available, skipping update');
                    return;
                }
                const comparison = this.gdpComparisons[Math.floor(Math.random() * this.gdpComparisons.length)];
                const container = document.getElementById('dynamic-comparison-container');
                if (container && comparison) {
                    container.innerHTML = `
                        <span class="text-6xl mr-4">${comparison.emoji}</span>
                        <span>${comparison.text}</span>
                    `;
                }
            }
            updateViralComparisons() {
                const comparisonsDiv = document.getElementById('viral-comparisons-grid');
                if (!comparisonsDiv) return;
                if (!this.viralComparisons || !Array.isArray(this.viralComparisons) || this.viralComparisons.length === 0) {
                    console.warn('⚠️ Viral comparisons not available, skipping update');
                    return;
                }
                const shuffled = [...this.viralComparisons].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 4);
                comparisonsDiv.innerHTML = selected.map(comparison => 
                    `<div class="p-3 bg-white/10 rounded-lg border border-white/20">${comparison}</div>`
                ).join('');
            }
            setupSocialProof() {
                this.updateSocialProofDisplays();
                this.generateActivityFeed();
                setInterval(() => {
                    this.generateActivityFeed();
                }, 30000);
            }
            updateSocialProofDisplays() {
                const elements = {
                    'total-calculations': this.socialProofData.totalCalculations.toLocaleString(),
                    'total-shares': this.socialProofData.totalShares.toLocaleString(),
                    'avg-result': `$${this.socialProofData.avgResult}T`,
                    'daily-calculations': `↗️ +${this.socialProofData.dailyCalculations} today`,
                    'daily-shares': `↗️ +${this.socialProofData.dailyShares} today`
                };
                Object.entries(elements).forEach(([id, value]) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = value;
                });
            }
            generateActivityFeed() {
                const activities = [
                }, 50); // Subtle debounce delay
            }
            getExpandedDistributionRange(paramName, currentValue) {
                const expansionConfigs = {
                    'vsl': {
                        minExpansion: 0.4, maxExpansion: 2.2,  // $3M to $30M range
                        distributionCenter: 0.45  // Current value at ~45% of range
                    },
                    'suicides': {
                        minExpansion: 0.3, maxExpansion: 2.5,  // 30K to 750K range  
                        distributionCenter: 0.35
                    },
                    'attribution': {
                        minExpansion: 0.2, maxExpansion: 3.0,  // 1% to 90% range
                        distributionCenter: 0.3
                    },
                    'depression': {
                        minExpansion: 0.5, maxExpansion: 2.0,  // 1.5M to 30M range
                        distributionCenter: 0.4
                    },
                    'yld': {
                        minExpansion: 0.5, maxExpansion: 2.5,  // 2 to 20 years range
                        distributionCenter: 0.4
                    },
                    'qol': {
                        minExpansion: 0.4, maxExpansion: 2.0,  // 12% to 80% range
                        distributionCenter: 0.5
                    },
                    'healthcare': {
                        minExpansion: 0.3, maxExpansion: 3.0,  // $2K to $60K range
                        distributionCenter: 0.35
                    },
                    'productivity': {
                        minExpansion: 0.5, maxExpansion: 2.5,  // $3K to $25K range
                        distributionCenter: 0.4
                    },
                    'duration': {
                        minExpansion: 0.3, maxExpansion: 2.8,  // 1 to 17 years range
                        distributionCenter: 0.35
                    }
                };
                const config = expansionConfigs[paramName] || { minExpansion: 0.5, maxExpansion: 2.0, distributionCenter: 0.5 };
                const rangeBelow = currentValue / config.distributionCenter * config.minExpansion;
                const rangeAbove = currentValue / (1 - config.distributionCenter) * (config.maxExpansion - 1);
                const min = Math.max(0, currentValue - rangeBelow);
                const max = currentValue + rangeAbove;
                return { min, max };
            }
            generateDynamicDistributionPoints(width, height, paramName) {
                const points = [];
                const numPoints = 120; // More points for smoother curves
                    const mortalityFormula = `${Math.round(this.parameters.suicides/1000)}K × ${this.parameters.attribution}% × $${this.parameters.vsl}M = ${this.formatCurrency(results.mortality)}`;
                    this.animateValueUpdate('mortality-result', mortalityFormula, results.mortality, oldResults.mortality);
                    const mortalityFormulaEl = document.getElementById('mortality-formula-result');
                    if (mortalityFormulaEl) {
                        mortalityFormulaEl.textContent = mortalityFormula;
                    }
                }, 100);
                setTimeout(() => {
                    const mentalFormula = `${(this.parameters.depression/1000000).toFixed(1)}M × ${this.parameters.yld} × ${this.parameters.qol}% × $${Math.round(this.parameters.vsl * 1000000 / 75 / 1000)}K = ${this.formatCurrency(results.mental)}`;
                    this.animateValueUpdate('mental-result', mentalFormula, results.mental, oldResults.mental);
                    const mentalFormulaEl = document.getElementById('mental-formula-result');
                    if (mentalFormulaEl) {
                        mentalFormulaEl.textContent = mentalFormula;
                    }
                }, 200);
                setTimeout(() => {
                    const productivityFormula = `${(this.parameters.depression/1000000).toFixed(1)}M × ($${Math.round(this.parameters.healthcare/1000)}K + $${Math.round(this.parameters.productivity/1000)}K) × ${this.parameters.duration} = ${this.formatCurrency(results.productivity)}`;
                    this.animateValueUpdate('healthcare-result', productivityFormula, results.productivity, oldResults.productivity);
                    const productivityFormulaEl = document.getElementById('productivity-formula-result');
                    if (productivityFormulaEl) {
                        productivityFormulaEl.textContent = productivityFormula;
                    }
                }, 300);
                const finalEq = document.getElementById('final-equation');
                if (finalEq) {
                    setTimeout(() => {
                        const newText = `Total Cost = ${this.formatCurrency(results.mortality)} + ${this.formatCurrency(results.mental)} + ${this.formatCurrency(results.productivity)} = ${this.formatCurrency(results.total)}`;
                        this.animateValueUpdate('final-equation', newText, results.total, oldResults.total);
                    }, 400);
                }
                this.updateChartsWithAnimation(results);
                this.refreshAllDistributionCharts();
                this.socialProofData.avgResult = (results.total / 1000000000000).toFixed(1);
                const avgEl = document.getElementById('avg-result');
                if (avgEl) {
                    setTimeout(() => {
                        this.animateValueUpdate('avg-result', `$${this.socialProofData.avgResult}T`, 
                            parseFloat(this.socialProofData.avgResult), oldResults.avgResult || 0);
                    }, 500);
                }
                oldResults.gdpPercentage = parseFloat(gdpPercentage);
                oldResults.avgResult = parseFloat(this.socialProofData.avgResult);
            }
            animateValueUpdate(elementId, newText, newValue, oldValue) {
                const element = document.getElementById(elementId);
                if (!element) return;
                element.textContent = newText;
            formatCurrency(amount) {
                if (amount >= 1000000000000) {
                    return `$${(amount / 1000000000000).toFixed(2)}T`;
                } else if (amount >= 1000000000) {
                    return `$${(amount / 1000000000).toFixed(1)}B`;
                } else if (amount >= 1000000) {
                    return `$${(amount / 1000000).toFixed(1)}M`;
                } else {
                    return `$${amount.toFixed(0)}`;
                }
            }
            setupCharts() {
                        runningTotalEl.textContent = this.formatCurrency(runningCost);
                    }
            }, 50); // Shorter debounce for indicator only
        };
        window.addEventListener('load', () => {