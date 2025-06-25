                this.charts = {};
                this.startTime = Date.now();
                    console.log('🔄 Window resized, updating charts...');
                    this.updateChartsWithAnimation(this.lastResults);
                }, 250));
                    console.log(`📊 Updated distribution chart for ${paramKey}`);
                });
                console.log('🔄 [Enhanced] Forcing complete update...');
                console.log('🔄 FORCE REFRESHING all distribution charts with DRAMATIC reshaping...');
                params.forEach(param => {
                console.log('✅ All distribution charts DRAMATICALLY reshaped!');
            }
            debugDistributionSystem() {
                console.log('🔧 DISTRIBUTION DEBUG SYSTEM');
                console.log('🔄 ENHANCED: Force refreshing all distribution charts...');
                return SocialMediaCalculator.prototype.refreshAllDistributionCharts.call(this);
            }
            updateCurrentValueIndicatorWithExpandedRange(paramName) {
                console.log(`🔴 ENHANCED: Updating red line for ${paramName}`);
                const currentValueDiv = document.getElementById(`${paramName}-current`);
                if (!currentValueDiv) {
                    console.warn(`⚠️ Red line indicator ${paramName}-current not found`);
                    return;
                }
                this.charts = {};
                this.startTime = Date.now();
                this.init();
            }
            init() {
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
                console.log('✅ Enhanced Calculator initialized');
            }
            setupSliders() {
                    console.log(`📊 Updated distribution chart for ${paramKey}`);
                });
                console.log('🔄 [Basic] Forcing complete update...');
                this.updateAllDisplays();
                this.updateDistributionInfo();
                console.log('🔄 [Basic] Refreshing all distribution charts...');
                params.forEach(param => {
                    this.updateDistributionChart(param);
                });
                console.log('✅ [Basic] All distribution charts refreshed');
            }
            getResearchDataStatic() {
                    console.log('🎨 Setting up distribution charts...');
                    const params = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
                    params.forEach(param => {
                        console.log(`📊 Creating distribution chart for ${param}...`);
                        this.createDistributionChart(param);
                    });
                    this.updateDistributionInfo();
                    params.forEach(param => {
                        this.updateDistributionChart(param);
                    });
                    console.log('✅ Distribution charts setup complete');
                }, 200);
            }
            createDistributionChart(paramName) {
                const svg = document.getElementById(`${paramName}-svg`);
                if (!svg) {
                    console.warn(`⚠️ SVG element ${paramName}-svg not found`);
                    return;
                }
                const container = svg.parentElement;
                const containerWidth = container.getBoundingClientRect().width || 400;
                const width = Math.max(300, containerWidth);
                const height = 100;
                svg.setAttribute('width', width);
                svg.setAttribute('height', height);
                svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
                svg.style.width = '100%';
                svg.style.height = '100px';
                svg.style.display = 'block';
                const themeColors = this.getThemeColors(paramName);
                const points = this.generateCachedDistributionPoints(width, height, paramName);
                if (points.length === 0) {
                    console.warn(`⚠️ No distribution points generated for ${paramName}`);
                    return;
                }
                const pathData = this.createSimplePath(points, width, height);
                svg.innerHTML = '';
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                gradient.setAttribute('id', `gradient-${paramName}`);
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '0%');
                gradient.setAttribute('y2', '100%');
                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop1.setAttribute('offset', '0%');
                stop1.setAttribute('stop-color', themeColors.fill);
                stop1.setAttribute('stop-opacity', '0.15');
                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '100%');
                stop2.setAttribute('stop-color', themeColors.fill);
                stop2.setAttribute('stop-opacity', '0.02');
                gradient.appendChild(stop1);
                gradient.appendChild(stop2);
                defs.appendChild(gradient);
                svg.appendChild(defs);
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', `url(#gradient-${paramName})`);
                path.setAttribute('stroke', themeColors.stroke);
                path.setAttribute('stroke-width', '1.5');
                path.setAttribute('opacity', '0');
                svg.appendChild(path);
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: path,
                        opacity: [0, 1],
                        duration: 200,
                        easing: 'easeOutQuart'
                    });
                }
                this.updateCurrentValueIndicator(paramName);
                this.addDistributionInteractivity(container, paramName);
                console.log(`${paramName} distribution chart initialized`);
            }
            addDistributionInteractivity(container, paramName) {
                container.setAttribute('role', 'img');
                container.setAttribute('aria-label', 
                    `Uncertainty distribution for ${paramName} showing range of likely values`);
                if (typeof tippy !== 'undefined') {
                    const config = {
                const timelineChart = document.getElementById('timeline-chart');
                const pieChart = document.getElementById('pie-chart');
                    if (timelineChart) window.animationController.showLoadingState(timelineChart);
                    if (pieChart) window.animationController.showLoadingState(pieChart);
                }
                setTimeout(() => {
                    this.updateCharts(results);
                        if (timelineChart) window.animationController.hideLoadingState(timelineChart);
                        if (pieChart) window.animationController.hideLoadingState(pieChart);
                    }
                }, 300);
            }
                const timelineCtx = document.getElementById('timeline-chart');
                if (timelineCtx && typeof Chart !== 'undefined') {
                    this.charts.timeline = new Chart(timelineCtx, {
                        type: 'line',
                        data: {
                            labels: ['2009', '2012', '2015', '2018', '2021', '2024'],
                            datasets: [
                                {
                                    label: '☠️ Death Costs',
                                    data: [0, 27, 87, 166, 271, 271],
                                    borderColor: '#ef4444',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    tension: 0.4,
                                    borderWidth: 2,
                                    fill: false
                                },
                                {
                                    label: '😞 Disability Costs',
                                    data: [0, 115, 371, 706, 1152, 1920],
                                    borderColor: '#8b5cf6',
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    tension: 0.4,
                                    borderWidth: 2,
                                    fill: false
                                },
                                {
                                    label: '💸 Productivity Costs',
                                    data: [0, 18, 58, 111, 181, 293],
                                    borderColor: '#10b981',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    tension: 0.4,
                                    borderWidth: 2,
                                    fill: false
                                },
                                {
                                    label: 'Total Cost',
                                    data: [0, 160, 516, 983, 1604, 2484],
                                    borderColor: '#1f2937',
                                    backgroundColor: 'rgba(31, 41, 55, 0.1)',
                                    tension: 0.4,
                                    borderWidth: 3,
                                    borderDash: [5, 5],
                                    fill: false
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { 
                                    display: true,
                                    position: 'bottom',
                                    labels: {
                                        usePointStyle: true,
                                        padding: 10,
                                        font: { size: 11 }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function(value) {
                                            return '$' + value + 'B';
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                const pieCtx = document.getElementById('pie-chart');
                if (pieCtx && typeof Chart !== 'undefined') {
                    this.charts.pie = new Chart(pieCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['☠️ Death', '😞 Disability', '💸 Lost Productivity'],
                            datasets: [{
                                data: [271, 1920, 293],
                                backgroundColor: ['#ef4444', '#8b5cf6', '#10b981'],
                                borderWidth: 2,
                                borderColor: '#ffffff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { 
                                    position: 'bottom',
                                    labels: {
                                        usePointStyle: true,
                                        padding: 15
                                    }
                                }
                            }
                        }
                    });
                }
            }
            updateCharts(results) {
                if (this.charts.pie) {
                    this.charts.pie.data.datasets[0].data = [
                        results.mortality / 1000000000,
                        results.mental / 1000000000,
                        results.productivity / 1000000000
                    ];
                    this.charts.pie.update();
                }
                if (this.charts.timeline) {
                    const progressionFactors = [0, 0.06, 0.18, 0.35, 0.65, 1.0]; // 2009-2024 adoption curve
                    const mortalityProgression = progressionFactors.map(factor => 
                        Math.round((results.mortality / 1000000000) * factor)
                    );
                    const mentalProgression = progressionFactors.map(factor => 
                        Math.round((results.mental / 1000000000) * factor)
                    );
                    const productivityProgression = progressionFactors.map(factor => 
                        Math.round((results.productivity / 1000000000) * factor)
                    );
                    const totalProgression = progressionFactors.map((factor, index) => 
                        mortalityProgression[index] + mentalProgression[index] + productivityProgression[index]
                    );
                    this.charts.timeline.data.datasets[0].data = mortalityProgression;
                    this.charts.timeline.data.datasets[1].data = mentalProgression;
                    this.charts.timeline.data.datasets[2].data = productivityProgression;
                    this.charts.timeline.data.datasets[3].data = totalProgression;
                    this.charts.timeline.update();
                }
            }
            startRunningCounter() {
                setInterval(() => {
            animateChartUpdate(chartElement) {
                this.animate({
                    targets: chartElement,
                    opacity: [0.7, 1],
                    scale: [0.98, 1],
                    duration: 400,
                    easing: 'easeOutQuad'
                });
            }
            showLoadingState(element) {
                this.animate({
                    targets: element,
                    opacity: [1, 0.6],
                    scale: [1, 0.98],
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            }
            hideLoadingState(element) {
                this.animate({
                    targets: element,
                    opacity: [0.6, 1],
                    scale: [0.98, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
            addHoverAnimations() {
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.addEventListener('mouseenter', () => {
                        this.animate({
                            targets: btn,
                            translateY: -0.5,
                            scale: 1.005,
                            duration: 200,
                            easing: 'easeOutQuad'
                        });
                    });
                    btn.addEventListener('mouseleave', () => {
                        this.animate({
                            targets: btn,
                            translateY: 0,
                            scale: 1,
                            duration: 200,
                            easing: 'easeOutQuad'
                        });
                    });
                });
                document.querySelectorAll('.card').forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        this.animate({
                            targets: card,
                            translateY: -1,
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                            duration: 300,
                            easing: 'easeOutQuad'
                        });
                    });
                    card.addEventListener('mouseleave', () => {
                        this.animate({
                            targets: card,
                            translateY: 0,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            duration: 300,
                            easing: 'easeOutQuad'
                        });
                    });
                });
            }
        }
        Object.getOwnPropertyNames(SocialMediaCalculator.prototype).forEach(name => {
            if (name !== 'constructor' && !SocialMediaCalculatorEnhanced.prototype.hasOwnProperty(name)) {
                SocialMediaCalculatorEnhanced.prototype[name] = SocialMediaCalculator.prototype[name];
            }
        });
        SocialMediaCalculatorEnhanced.prototype.updateDistributionChart = function(paramName) {
            SocialMediaCalculator.prototype.updateDistributionChart.call(this, paramName);
            clearTimeout(this.distributionUpdateTimeouts?.[paramName]);
            this.distributionUpdateTimeouts = this.distributionUpdateTimeouts || {};
            this.distributionUpdateTimeouts[paramName] = setTimeout(() => {
                this.updateCurrentValueIndicatorWithExpandedRange(paramName);
                    console.log('🔧 Debug: FORCING DRAMATIC REFRESH of all distribution charts...');
                    if (window.calculator && window.calculator.refreshAllDistributionCharts) {
                        window.calculator.refreshAllDistributionCharts();
                        return 'All charts forcefully reshaped! Watch the curves change.';
                    } else {
                        console.error('❌ Calculator or refresh method not available');
                        return 'Error: Calculator not available';
                    }
                };
                window.debugSingleChart = function(paramName) {
                    console.log(`🔧 Debug: DRAMATICALLY reshaping chart for ${paramName}...`);
                    if (window.calculator && window.calculator.updateDistributionChart) {
                        window.calculator.updateDistributionChart(paramName);
                console.log('  debugSingleChart(paramName) - Refresh specific chart');
                console.log('  debugDistributionSystem() - Full system diagnostic');
                    console.log('🔄 Window resized, updating charts only...');
                    window.calculator.updateChartsWithAnimation(window.calculator.lastResults);
                    const currentWidth = window.innerWidth;
                    if (!window.lastResizeWidth || Math.abs(currentWidth - window.lastResizeWidth) > 100) {
                        console.log('📊 Significant width change, updating distribution charts...');
                        const params = ['vsl', 'suicides', 'attribution', 'depression', 'yld', 'qol', 'healthcare', 'productivity', 'duration'];
                        params.slice(0, 3).forEach(param => {
                            if (window.calculator.createDistributionChart) {
                                window.calculator.createDistributionChart(param);
                            }
                        });
                        setTimeout(() => {
                            params.slice(3, 6).forEach(param => {
                                if (window.calculator.createDistributionChart) {
                                    window.calculator.createDistributionChart(param);
                                }
                            });
                        }, 50);
                        setTimeout(() => {
                            params.slice(6).forEach(param => {
                                if (window.calculator.createDistributionChart) {
                                    window.calculator.createDistributionChart(param);
                                }
                            });
                        }, 100);
                        window.lastResizeWidth = currentWidth;
                    }
                }
            }, 500); // Increased delay to reduce frequency
        });