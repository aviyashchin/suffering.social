                const scrolled = window.pageYOffset;
                const heroSection = document.getElementById('hero-section');
                if (heroSection && window.animationController) {
                    const opacity = _.clamp(1 - (scrolled / window.innerHeight) * 0.7, 0.3, 1);
                    const translateY = scrolled * 0.3;
                    heroSection.style.opacity = opacity;
                    heroSection.style.transform = `translateY(${translateY}px)`;
                }
            }
            validateParameterInput(input) {
                const value = parseFloat(input.value);
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                const clampedValue = _.clamp(value, min, max);
                if (value !== clampedValue) {
                    input.value = clampedValue;
                    console.warn(`⚠️ Input value clamped: ${value} → ${clampedValue}`);
                }
            }
            updateParameter(param, value) {
                const tooltipId = citationElement.dataset.tooltipId;
                console.log(`🔍 Looking for citation data: ${tooltipId}, study index: ${studyIndex}`);
                const data = researchData[tooltipId];
                if (!data || !data.studies || !data.studies[studyIndex]) {
                    console.error('Citation data not found:', tooltipId, studyIndex);
                    console.log('Available studies for this tooltip:', data ? data.studies?.length : 'No data');
                    return;
                }
                const study = data.studies[studyIndex];
                        tooltip_id: tooltipId
                    });
                }
                const headerTotalEl = document.getElementById('total-amount');
                if (headerTotalEl) {
                    headerTotalEl.textContent = Math.round(results.total).toLocaleString();
                }
            }
            refreshAllDistributionCharts() {
                const params = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
                console.log(`✅ Scenario ${scenarioName} loaded with professional animations and analytics`);
            }
            updateDistributionChart(paramName) {
                console.log(`🔄 ENHANCED: Dramatically updating ${paramName} distribution`);
                return SocialMediaCalculator.prototype.updateDistributionChart.call(this, paramName);
            }
            generateDynamicDistributionPoints(width, height, paramName) {
                console.log(`🎨 ENHANCED: Generating dynamic points for ${paramName}`);
                return SocialMediaCalculator.prototype.generateDynamicDistributionPoints.call(this, width, height, paramName);
            }
            refreshAllDistributionCharts() {
                        tooltips: true,
                        connect: 'lower',
                        theme: 'mortality'
                    },
                    'suicides': {
                        range: { min: 89000, max: 300000 },  // PNAS Twenge et al. 89K to maximum plausible 300K
                        start: 110000,
                        step: 1000,
                        format: (value) => `${Math.round(parseFloat(value)/1000)}K`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'mortality'
                    },
                    'attribution': {
                        range: { min: 5, max: 30 },  // Conservative 5% to maximum with all pathways 30%
                        start: 18,
                        step: 1,
                        format: (value) => `${Math.round(parseFloat(value))}%`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'mortality'
                    },
                    'depression': {
                        range: { min: 3000000, max: 15000000 },  // Conservative clinical to Surgeon General estimates
                        start: 5000000,
                        step: 100000,
                        format: (value) => `${(parseFloat(value)/1000000).toFixed(1)}M`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'mental-health'
                    },
                    'yld': {
                        range: { min: 4.8, max: 8.2 },  // WHO conservative to De Graaf et al. extended duration
                        start: 6.0,
                        step: 0.1,
                        format: (value) => `${parseFloat(value).toFixed(1)} years`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'mental-health'
                    },
                    'qol': {
                        range: { min: 31, max: 47 },  // WHO standard to severe cases with comorbidities
                        start: 35,
                        step: 1,
                        format: (value) => `${Math.round(parseFloat(value))}%`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'mental-health'
                    },
                    'healthcare': {
                        range: { min: 6500, max: 20000 },  // Conservative basic to enhanced social media costs
                        start: 7000,
                        step: 100,
                        format: (value) => `$${Math.round(parseFloat(value)/1000)}K`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'productivity'
                    },
                    'productivity': {
                        range: { min: 4800, max: 10000 },  // BLS baseline to RAND comprehensive analysis
                        start: 6000,
                        step: 100,
                        format: (value) => `$${Math.round(parseFloat(value)/1000)}K`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'productivity'
                    },
                    'duration': {
                        range: { min: 3.0, max: 8.5 },  // Conservative short-term to extended digital wellness treatment
                        start: 4.5,
                        step: 0.1,
                        format: (value) => `${parseFloat(value).toFixed(1)} years`,
                        tooltips: true,
                        connect: 'lower',
                        theme: 'productivity'
                    }
                };
                        tooltips: {
                            to: (value) => config.format(value),
                            from: (value) => Number(value)
                        },
                        format: {
                            to: (value) => value,
                            from: (value) => Number(value)
                        },
                        behaviour: 'tap-drag',
                        animate: true,
                        animationDuration: 300
                    });
                console.log(`✅ Loaded scenario: ${scenarioName} with professional animations`);
            }
            applyScenarioValues(scenario) {
                Object.keys(scenario).forEach(param => {
                const helpModal = document.getElementById('help-modal');
                const helpClose = document.getElementById('help-modal-close');
                if (helpBtn && helpModal) {
                    helpBtn.addEventListener('click', () => {
                        helpModal.classList.add('show');
                    });
                }
                if (helpClose && helpModal) {
                    helpClose.addEventListener('click', () => {
                        helpModal.classList.remove('show');
                    });
                }
                document.addEventListener('click', (e) => {
                    if (helpModal && !helpModal.contains(e.target) && !helpBtn?.contains(e.target)) {
                        helpModal.classList.remove('show');
                    }
                });
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && helpModal?.classList.contains('show')) {
                        helpModal.classList.remove('show');
                    }
                });
            }
            setupInfoButtons() {
                this.setupTippyTooltips();
            }
                const tooltipId = citationElement.dataset.tooltipId;
                const data = researchData[tooltipId];
                if (!data || !data.studies || !data.studies[studyIndex]) {
                    console.error('Citation data not found:', tooltipId, studyIndex);
                    return;
                }
                const study = data.studies[studyIndex];
                        tooltip_id: tooltipId
                    });
                }
                const headerTotalEl = document.getElementById('total-amount');
                if (headerTotalEl) {
                    headerTotalEl.textContent = Math.round(results.total).toLocaleString();
                }
                console.log('✅ Formula displays updated');
            }
            refreshAllDistributionCharts() {
                const params = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
                    const tooltipId = button.dataset.tooltip;
                    const buttonType = button.classList.contains('mortality') ? 'mortality' : 
                                     button.classList.contains('mental-health') ? 'mental-health' : 'productivity';
                    const data = researchData[tooltipId];
                    if (!data) return;
                    const content = this.createTooltipContent(tooltipId, buttonType, data);
                    tippy(button, {
                        content: content,
                        allowHTML: true,
                        animation: 'shift-away'
                    });
                });
                console.log('✅ Tippy.js tooltips initialized');
            }
            createTooltipContent(tooltipId, buttonType, data) {
                if (!data) {
                    return `
                         data-tooltip-id="${tooltipId}"
                         onclick="window.calculator.applyCitationValues(this)">
                        <div class="citation-header">
                            <div class="study-title">${study.title}</div>
                            <div class="confidence-badge confidence-${study.confidence}">${study.confidence} confidence</div>
                        </div>
                        <div class="study-authors">${study.authors}</div>
                        <div class="study-finding ${buttonType}">${study.finding}</div>
                        <div class="study-method">${study.method}</div>
                const causalModal = document.getElementById('causal-modal');
                const causalClose = document.getElementById('causal-modal-close');
                if (causalClose && causalModal) {
                    causalClose.addEventListener('click', () => {
                        causalModal.classList.add('hidden');
                    });
                }
                if (causalModal) {
                    causalModal.addEventListener('click', (e) => {
                        if (e.target === causalModal) {
                            causalModal.classList.add('hidden');
                        }
                    });
                }
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && causalModal && !causalModal.classList.contains('hidden')) {
                        causalModal.classList.add('hidden');
                    }
                });
            }
            setupDistributionCharts() {
                setTimeout(() => {
                if (window.animationController && Math.abs(newValue - (oldValue || 0)) > 0) {
                    window.animationController.animateValueChange(element, newValue, oldValue || 0);
                }
            }
            updateChartsWithAnimation(results) {
                if (window.animationController) {
                    if (window.animationController) {
                    const headerTotalEl = document.getElementById('total-amount');
                    if (runningTotalEl) {
                    if (headerTotalEl) {
                        const newTotal = results.total + runningCost;
                        headerTotalEl.textContent = Math.round(newTotal).toLocaleString();
                    }
                }, 100);
            }
        }
        class PerformanceMonitor {
            constructor() {
                this.metrics = {
                    fcp: null,
                    lcp: null,
                    cls: null,
                    fid: null,
                    ttfb: null
                };
                this.isWebVitalsLoaded = false;
                this.performanceDisplay = null;
                this.initializeMonitoring();
            }
            initializeMonitoring() {
                if (typeof webVitals !== 'undefined') {
                    this.isWebVitalsLoaded = true;
                    this.setupWebVitals();
                } else {
                    setTimeout(() => this.initializeMonitoring(), 100);
                }
            }
            setupWebVitals() {
                webVitals.getFCP((metric) => {
                    this.metrics.fcp = metric.value;
                    this.updateDisplay('fcp', metric.value, 'ms');
                    this.logMetric('FCP', metric.value, 'ms');
                });
                webVitals.getLCP((metric) => {
                    this.metrics.lcp = metric.value;
                    this.updateDisplay('lcp', metric.value, 'ms');
                    this.logMetric('LCP', metric.value, 'ms');
                });
                webVitals.getCLS((metric) => {
                    this.metrics.cls = metric.value;
                    this.updateDisplay('cls', metric.value.toFixed(3), '');
                    this.logMetric('CLS', metric.value.toFixed(3), '');
                });
                webVitals.getFID((metric) => {
                    this.metrics.fid = metric.value;
                    this.updateDisplay('fid', metric.value, 'ms');
                    this.logMetric('FID', metric.value, 'ms');
                });
                webVitals.getTTFB((metric) => {
                    this.metrics.ttfb = metric.value;
                    this.logMetric('TTFB', metric.value, 'ms');
                });
                console.log('✅ Web Vitals performance monitoring active');
                setTimeout(() => {
                    this.createPerformanceSummary();
                }, 3000);
            }
            updateDisplay(metricName, value, unit) {
                const element = document.getElementById(`${metricName}-metric`);
                if (element) {
                    element.textContent = `${value}${unit}`;
                    element.className = this.getPerformanceClass(metricName, value);
                    if (window.animationController) {
                        window.animationController.animate({
                            targets: element,
                            scale: [1, 1.1, 1],
                            duration: 300,
                            easing: 'easeOutQuad'
                        });
                    }
                }
            }
            getPerformanceClass(metricName, value) {
                const thresholds = {
                    fcp: { good: 1800, poor: 3000 },
                    lcp: { good: 2500, poor: 4000 },
                    cls: { good: 0.1, poor: 0.25 },
                    fid: { good: 100, poor: 300 }
                };
                const threshold = thresholds[metricName];
                if (!threshold) return '';
                if (value <= threshold.good) return 'performance-good';
                if (value <= threshold.poor) return 'performance-needs-improvement';
                return 'performance-poor';
            }
            logMetric(name, value, unit) {
                const performance = value <= this.getGoodThreshold(name) ? '🟢' : 
                                  value <= this.getPoorThreshold(name) ? '🟡' : '🔴';
                console.log(`📊 ${performance} ${name}: ${value}${unit}`);
            }
            getGoodThreshold(metricName) {
                const thresholds = { FCP: 1800, LCP: 2500, CLS: 0.1, FID: 100, TTFB: 800 };
                return thresholds[metricName] || 0;
            }
            getPoorThreshold(metricName) {
                const thresholds = { FCP: 3000, LCP: 4000, CLS: 0.25, FID: 300, TTFB: 1800 };
                return thresholds[metricName] || Infinity;
            }
            createPerformanceSummary() {
                    if (window.animationController) {
                        window.animationController.animate({
                            targets: display,
                            opacity: display.classList.contains('show') ? [0, 1] : [1, 0],
                            translateX: display.classList.contains('show') ? [-20, 0] : [0, -20],
                            duration: 300,
                            easing: 'easeOutQuad'
                        });
                    }
                }
            }
            startRealtimeMonitoring() {
                if ('PerformanceObserver' in window) {
                    const longTaskObserver = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.duration > 100) { // Increased threshold to reduce spam
                                console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(1)}ms`);
                            }
                        }
                    });
                    try {
                        longTaskObserver.observe({ entryTypes: ['longtask'] });
                    } catch (e) {
                        console.log('Long task monitoring not supported');
                    }
                }
                if ('memory' in performance) {
                    setInterval(() => {
                        const memInfo = performance.memory;
                        const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576);
                        const totalMB = Math.round(memInfo.totalJSHeapSize / 1048576);
                        if (usedMB > 80) { // Increased threshold to reduce spam
                            console.warn(`⚠️ High memory usage: ${usedMB}MB / ${totalMB}MB`);
                        }
                    }, 30000); // Reduced to every 30 seconds
                }
            }
        }
        function smoothScrollToCalculator() {
            const calculatorStart = document.getElementById('calculator-start');
            if (calculatorStart) {
                calculatorStart.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                if (window.performanceMonitor) {
                    const startTime = performance.now();
                    setTimeout(() => {
                        const scrollTime = performance.now() - startTime;
                        console.log(`📊 Smooth scroll completed in ${scrollTime.toFixed(1)}ms`);
                    }, 1000);
                }
            }
        }
        class AnimationController {
            constructor() {
                this.isAnimeLoaded = false;
                this.animationQueue = [];
                this.checkAnimeJS();
            }
            checkAnimeJS() {
                if (typeof anime !== 'undefined') {
                    this.isAnimeLoaded = true;
                    this.processQueue();
                    console.log('✅ Anime.js animation system ready');
                } else {
                    setTimeout(() => this.checkAnimeJS(), 100);
                }
            }
            processQueue() {
                this.animationQueue.forEach(animation => animation());
                this.animationQueue = [];
            }
            animate(config) {
                if (this.isAnimeLoaded) {
                    return anime(config);
                } else {
                    this.animationQueue.push(() => anime(config));
                    return null;
                }
            }
            initializePageAnimations() {
                document.body.classList.replace('loading', 'loaded');
                this.animate({
                    targets: '#hero-content',
                    opacity: [0, 1],
                    translateY: [40, 0],
                    duration: 1200,
                    easing: 'easeOutCubic',
                    delay: 300
                });
                this.animate({
                    targets: '#scroll-indicator',
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 800,
                    easing: 'easeOutQuad',
                    delay: 1600
                });
                this.animate({
                    targets: '.header-fixed',
                    opacity: [0, 1],
                    translateY: [-20, 0],
                    duration: 600,
                    easing: 'easeOutQuad',
                    delay: 800
                });
                this.animate({
            window.animationController = new AnimationController();
            setTimeout(() => {
                window.animationController.initializePageAnimations();
            }, 100);
            setTimeout(() => {
                window.performanceMonitor = new PerformanceMonitor();
                window.performanceMonitor.startRealtimeMonitoring();
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                        e.preventDefault();
                        window.performanceMonitor.toggleDisplay();
                    }
                });
                console.log('✅ Performance monitoring system active (Ctrl+Shift+P to toggle)');
            }, 200);
            setTimeout(() => {
                try {
                    window.calculator = new SocialMediaCalculatorEnhanced();
                    console.log('✅ Enhanced calculator with Lodash utilities initialized');
                    window.calculatorType = 'enhanced';
                } catch (error) {
                    console.error('❌ Enhanced calculator initialization failed:', error);
                    if (!window.calculator) {
                        try {
                            window.calculator = new SocialMediaCalculator();
                            console.log('✅ Basic calculator initialized as fallback');
                            window.calculatorType = 'basic';
                        } catch (fallbackError) {
                            console.error('❌ All calculator initialization failed:', fallbackError);
                        }
                    }
                }
                window.debugDistributionCharts = function() {
                window.animationController.addHoverAnimations();
            }, 1000);
            if (typeof mermaid !== 'undefined') {
                mermaid.initialize({
                    startOnLoad: true,
                    theme: 'default',
                    securityLevel: 'loose',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 12
                });
            }
            const yearEl = document.getElementById('current-year');
            if (yearEl) yearEl.textContent = new Date().getFullYear();
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrolled = window.pageYOffset;
                        const heroSection = document.getElementById('hero-section');
                        const calculatorStart = document.getElementById('calculator-start');
                        if (heroSection && calculatorStart) {
                            const heroHeight = heroSection.offsetHeight;
                            const scrollProgress = Math.min(scrolled / heroHeight, 1);
                            const opacity = Math.max(0.1, 1 - scrollProgress * 0.8);
                            const translateY = Math.min(scrolled * 0.2, heroHeight * 0.3);
                            heroSection.style.opacity = opacity;
                            heroSection.style.transform = `translateY(${translateY}px)`;
                            if (scrollProgress > 0.8) {
                                calculatorStart.style.transform = 'translateY(0)';
                                calculatorStart.style.zIndex = '10';
                            }
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        });
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.calculator && window.calculator.lastResults) {