/**
 * Calculator Integration Adapter
 * Provides seamless integration between existing calculator and distribution sliders
 */

class CalculatorIntegration {
    constructor() {
        this.sliders = new Map();
        this.useDistributionSliders = false;
        this.fallbackSliders = new Map();
        this.isInitialized = false;
        this.updateCallback = null;
        
        // Configuration mapping for existing sliders
        this.sliderConfigs = {
            'vsl-slider': {
                containerId: 'vsl-slider-container',
                min: 8,
                max: 20,
                default: 13.7,
                distributionType: 'normal',
                format: (v) => `$${v.toFixed(1)}M`,
                theme: 'red',
                step: 0.1
            },
            'suicides-slider': {
                containerId: 'suicides-slider-container', 
                min: 100000,
                max: 300000,
                default: 110000,
                distributionType: 'normal',
                format: (v) => `${(v/1000).toFixed(0)}K`,
                theme: 'red',
                step: 1000
            },
            'attribution-slider': {
                containerId: 'attribution-slider-container',
                min: 5,
                max: 30,
                default: 18,
                distributionType: 'beta',
                distributionParams: { concentration: 8 },
                format: (v) => `${v.toFixed(0)}%`,
                theme: 'purple',
                step: 1
            },
            'depression-slider': {
                containerId: 'depression-slider-container',
                min: 3000000,
                max: 15000000,
                default: 5000000,
                distributionType: 'lognormal',
                format: (v) => {
                    if (v >= 1000000) return `${(v/1000000).toFixed(1)}M`;
                    return `${(v/1000).toFixed(0)}K`;
                },
                theme: 'cyan',
                step: 100000
            },
            'yld-slider': {
                containerId: 'yld-slider-container',
                min: 4,
                max: 8,
                default: 6,
                distributionType: 'normal',
                format: (v) => `${v.toFixed(1)} years`,
                theme: 'purple',
                step: 0.1
            },
            'qol-slider': {
                containerId: 'qol-slider-container',
                min: 30,
                max: 40,
                default: 35,
                distributionType: 'beta',
                distributionParams: { concentration: 10 },
                format: (v) => `${v.toFixed(0)}%`,
                theme: 'purple',
                step: 1
            },
            'healthcare-slider': {
                containerId: 'healthcare-slider-container',
                min: 6500,
                max: 20000,
                default: 7000,
                distributionType: 'normal',
                format: (v) => `$${v.toLocaleString()}`,
                theme: 'cyan',
                step: 100
            },
            'productivity-slider': {
                containerId: 'productivity-slider-container',
                min: 6000,
                max: 10000,
                default: 6000,
                distributionType: 'normal',
                format: (v) => `$${v.toLocaleString()}`,
                theme: 'cyan',
                step: 100
            },
            'duration-slider': {
                containerId: 'duration-slider-container',
                min: 3,
                max: 6,
                default: 4.5,
                distributionType: 'normal',
                format: (v) => `${v.toFixed(1)} years`,
                theme: 'cyan',
                step: 0.1
            }
        };
    }

    /**
     * Initialize the integration system
     */
    async initialize(updateCallback) {
        if (this.isInitialized) {
            console.log('✅ Calculator integration already initialized');
            return;
        }
        
        console.log('🚀 Initializing calculator integration...');
        this.updateCallback = updateCallback;
        
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            console.log('⏳ Waiting for DOM to be ready...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Try to use distribution sliders first
        try {
            console.log('🎛️ Attempting to initialize distribution sliders...');
            await this.initializeDistributionSliders();
            this.useDistributionSliders = true;
            console.log('✅ Distribution sliders initialized successfully');
            
            // Add class to body to enable CSS hiding of original sliders
            document.body.classList.add('has-distribution-sliders');
            console.log('✅ Added has-distribution-sliders class to body');
            
            // Set up synchronization between original and distribution sliders
            this.setupSliderSynchronization();
            
        } catch (error) {
            console.warn('⚠️ Distribution sliders failed, using fallback:', error);
            this.initializeFallbackSliders();
            this.useDistributionSliders = false;
        }
        
        this.isInitialized = true;
        console.log(`✅ Calculator integration initialized (using ${this.useDistributionSliders ? 'distribution' : 'fallback'} sliders)`);
        
        // Update UI features display
        this.updateFeaturesDisplay();
        
        // Add a final safety check after everything is initialized
        setTimeout(() => {
            this.ensureLayoutIntegrity();
        }, 2000);
    }

    /**
     * Initialize distribution sliders
     */
    async initializeDistributionSliders() {
        console.log('📚 Starting distribution slider initialization...');
        
        return new Promise((resolve, reject) => {
            // Listen for loader events
            const handleReady = () => {
                console.log('📡 Received distributionSlidersReady event');
                document.removeEventListener('distributionSlidersReady', handleReady);
                document.removeEventListener('distributionSlidersFailed', handleFailed);
                this.createDistributionSliders().then(resolve).catch(reject);
            };
            
            const handleFailed = (event) => {
                console.error('📡 Received distributionSlidersFailed event:', event.detail);
                document.removeEventListener('distributionSlidersReady', handleReady);
                document.removeEventListener('distributionSlidersFailed', handleFailed);
                reject(event.detail || new Error('Distribution slider loading failed'));
            };
            
            document.addEventListener('distributionSlidersReady', handleReady);
            document.addEventListener('distributionSlidersFailed', handleFailed);
            
            // Check if already loaded
            if (window.distributionSliderLoader && window.distributionSliderLoader.isAvailable()) {
                console.log('📚 Distribution sliders already available');
                handleReady();
            } else {
                console.log('⏳ Waiting for distribution sliders to load...');
                // Force load if not already loading
                if (window.distributionSliderLoader && !window.distributionSliderLoader.isLoading) {
                    window.distributionSliderLoader.load((error, success) => {
                        if (success) {
                            handleReady();
                        } else {
                            handleFailed({ detail: error });
                        }
                    });
                }
            }
        });
    }

    /**
     * Create distribution sliders after library is loaded
     */
    async createDistributionSliders() {
        // console.log('🎯 Creating distribution sliders...');
        
        try {
            this.distributionSliderManager = new DistributionSliderManager();
            // console.log('✅ Distribution slider manager created');
            
            // Create containers if they don't exist
            await this.createSliderContainers();
            // console.log('✅ Slider containers created/verified');
            
            // Wait a small moment for DOM to be fully rendered
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Pre-measure all slider widths before creating any distribution sliders
            // console.log('📏 Pre-measuring all slider widths...');
            const sliderWidths = {};
            for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
                const originalSlider = document.getElementById(sliderId);
                let sliderWidth = 400; // default fallback
                
                if (originalSlider) {
                    const sliderRect = originalSlider.getBoundingClientRect();
                    if (sliderRect.width > 0) {
                        sliderWidth = sliderRect.width;
                        // console.log(`📏 Pre-measured ${sliderId} width: ${sliderWidth}px`);
                    } else {
                        // Try to get the slider container width
                        const sliderContainer = originalSlider.closest('.slider-container');
                        if (sliderContainer) {
                            const containerRect = sliderContainer.getBoundingClientRect();
                            if (containerRect.width > 0) {
                                sliderWidth = Math.max(200, containerRect.width - 40); // Account for padding
                                // console.log(`📏 Pre-measured ${sliderId} container width: ${sliderWidth}px`);
                            }
                        }
                    }
                }
                sliderWidths[sliderId] = sliderWidth;
            }
            
            // Initialize each slider with pre-measured width
            // console.log('🎛️ Initializing individual sliders with pre-measured widths...');
            let successCount = 0;
            let failCount = 0;
            
            for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
                try {
                    // console.log(`🎯 Processing slider: ${sliderId}`);
                    
                    const container = document.getElementById(config.containerId);
                    if (!container) {
                        console.error(`❌ Container ${config.containerId} not found for ${sliderId}`);
                        failCount++;
                        continue;
                    }
                    
                    // Check container dimensions
                    const rect = container.getBoundingClientRect();
                    // console.log(`📐 Container ${config.containerId} dimensions: ${rect.width}x${rect.height}`);
                    
                    if (rect.width === 0 || rect.height === 0) {
                        // console.warn(`⚠️ Container ${config.containerId} has zero dimensions, making it visible...`);
                        container.style.display = 'block';
                        container.style.minHeight = '100px';
                        container.style.width = '100%';
                    }
                    
                    // Force container visibility with JavaScript styling to override any CSS issues
                    // console.log(`🔧 Forcing visibility for ${config.containerId}...`);
                    
                    // Force styling via JavaScript to override any CSS issues
                    container.style.display = 'block';
                    container.style.visibility = 'visible';
                    container.style.opacity = '1';
                    container.style.width = '100%';
                    container.style.height = '100px';
                    container.style.minHeight = '100px';
                    container.style.maxHeight = 'none';
                    container.style.overflow = 'visible';
                    container.style.position = 'relative';
                    container.style.background = '#f8fafc';
                    container.style.border = '1px solid #e2e8f0';
                    container.style.margin = '0.5rem 0';
                    container.style.padding = '0.75rem';
                    container.style.borderRadius = '8px';
                    container.style.boxSizing = 'border-box';
                    
                    // Force parent containers to be visible too
                    let parent = container.parentElement;
                    while (parent && parent !== document.body) {
                        parent.style.display = 'block';
                        parent.style.visibility = 'visible';
                        parent.style.opacity = '1';
                        parent = parent.parentElement;
                    }
                    
                    console.log(`✅ Forced styling applied to ${config.containerId}`);
                    
                    // Use pre-measured width for this slider
                    const sliderWidth = sliderWidths[sliderId];
                    console.log(`📏 Using pre-measured width for ${sliderId}: ${sliderWidth}px`);
                    
                    const sliderConfig = {
                        ...config,
                        sliderId,
                        width: sliderWidth, // Set the distribution slider width to match original
                        onChange: (value, output) => {
                            // console.log(`🎛️ Slider ${sliderId} changed to ${value}`);
                            this.handleSliderChange(sliderId, value, output);
                        },
                        onUpdate: (value) => {
                            this.handleSliderUpdate(sliderId, value);
                        }
                    };
                    
                    console.log(`🚀 Creating distribution slider for ${sliderId}...`);
                    const slider = this.distributionSliderManager.create(sliderConfig);
                    
                    if (slider) {
                        this.sliders.set(sliderId, slider);
                        console.log(`✅ Distribution slider ${sliderId} created successfully`);
                        successCount++;
                    } else {
                        console.error(`❌ Failed to create slider ${sliderId}: slider is null`);
                        failCount++;
                    }
                    
                } catch (error) {
                    console.error(`❌ Failed to create slider ${sliderId}:`, error);
                    console.error('Error stack:', error.stack);
                    failCount++;
                }
            }
            
            console.log(`📊 Slider creation summary: ${successCount} successful, ${failCount} failed`);
            
            if (successCount === 0) {
                throw new Error('No distribution sliders were created successfully');
            }
            
            if (failCount > 0) {
                console.warn(`⚠️ Some sliders failed to create (${failCount}/${successCount + failCount})`);
            }
            
        } catch (error) {
            console.error('❌ Failed to create distribution sliders:', error);
            throw error;
        }
    }

    /**
     * Create slider containers in existing slider locations
     */
    async createSliderContainers() {
        console.log('🔧 Creating/verifying slider containers...');
        
        for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
            console.log(`📋 Processing container for ${sliderId}...`);
            
            const existingSlider = document.getElementById(sliderId);
            let existingContainer = document.getElementById(config.containerId);
            
            console.log(`📋 ${sliderId}: slider=${!!existingSlider}, container=${!!existingContainer}`);
            
            if (!existingContainer) {
                if (existingSlider) {
                    console.log(`📦 Creating new container for ${sliderId}`);
                    
                    // Create container
                    const container = document.createElement('div');
                    container.id = config.containerId;
                    container.className = 'distribution-slider-container';
                    container.style.display = 'block';
                    container.style.minHeight = '100px';
                    container.style.width = '100%';
                    container.style.margin = '1rem 0';
                    container.style.padding = '1rem';
                    container.style.background = '#f8fafc';
                    container.style.borderRadius = '8px';
                    container.style.border = '1px solid #e2e8f0';
                    
                    // Find the best place to insert the container
                    const sliderContainer = existingSlider.closest('.slider-container');
                    if (sliderContainer) {
                        // Insert after the slider container
                        sliderContainer.parentNode.insertBefore(container, sliderContainer.nextSibling);
                        console.log(`✅ Container ${config.containerId} created after slider container`);
                    } else {
                        // Insert after the slider element
                        existingSlider.parentNode.insertBefore(container, existingSlider.nextSibling);
                        console.log(`✅ Container ${config.containerId} created after slider element`);
                    }
                    
                    existingContainer = container;
                } else {
                    console.error(`❌ Cannot create container for ${sliderId}: original slider not found`);
                    
                    // Try to find a parent container to create the container in
                    const parentContainer = document.querySelector(`.parameter-group`);
                    if (parentContainer) {
                        console.log(`🔍 Found parent container for ${sliderId}, creating container there`);
                        const container = document.createElement('div');
                        container.id = config.containerId;
                        container.className = 'distribution-slider-container';
                        container.style.display = 'block';
                        container.style.minHeight = '140px';
                        container.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">Distribution slider for ${sliderId}</div>`;
                        parentContainer.appendChild(container);
                        existingContainer = container;
                        console.log(`✅ Created fallback container for ${sliderId}`);
                    }
                }
            } else {
                console.log(`📦 Container ${config.containerId} already exists`);
                // Ensure container is visible and has proper styling
                existingContainer.style.display = 'block';
                if (!existingContainer.style.minHeight) {
                    existingContainer.style.minHeight = '100px';
                }
            }
            
            // Keep both original and distribution sliders visible
            if (existingContainer && existingSlider) {
                const sliderContainer = existingSlider.closest('.slider-container');
                if (sliderContainer) {
                    sliderContainer.style.display = 'block';
                    console.log(`👁️ Keeping original slider container visible for ${sliderId}`);
                } else {
                    existingSlider.style.display = 'block';
                    console.log(`👁️ Keeping original slider element visible for ${sliderId}`);
                }
            }
        }
        
        console.log('✅ Container creation/verification complete');
    }

    /**
     * Initialize fallback sliders (existing HTML sliders)
     */
    initializeFallbackSliders() {
        for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
            const existingSlider = document.getElementById(sliderId);
            if (existingSlider) {
                // Show existing slider
                existingSlider.style.display = '';
                
                // Add event listeners
                existingSlider.addEventListener('input', (e) => {
                    this.handleSliderChange(sliderId, parseFloat(e.target.value));
                });
                
                this.fallbackSliders.set(sliderId, existingSlider);
            }
        }
    }

    /**
     * Set up synchronization between original sliders and distribution sliders
     */
    setupSliderSynchronization() {
        console.log('🔗 Setting up slider synchronization...');
        
        for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
            const originalSlider = document.getElementById(sliderId);
            
            if (originalSlider) {
                console.log(`🔗 Setting up sync for ${sliderId}`);
                
                // Add event listener to original slider
                originalSlider.addEventListener('input', (e) => {
                    const newValue = parseFloat(e.target.value);
                    // console.log(`🔗 Original slider ${sliderId} changed to ${newValue}, syncing distribution slider...`);
                    
                    // Update the distribution slider if it exists
                    if (this.useDistributionSliders && this.sliders.has(sliderId)) {
                        const distributionSlider = this.sliders.get(sliderId);
                        if (distributionSlider && distributionSlider.setValue) {
                            // Set value without triggering change event to avoid infinite loop
                            distributionSlider.setValue(newValue, false);
                            // console.log(`✅ Distribution slider ${sliderId} synced to ${newValue}`);
                        }
                    }
                    
                    // Update displays and trigger calculations
                    this.updateSliderDisplay(sliderId, newValue);
                    
                    // Trigger main calculation update
                    if (this.updateCallback) {
                        this.updateCallback(sliderId, newValue);
                    }
                });
                
                console.log(`✅ Synchronization set up for ${sliderId}`);
            } else {
                console.warn(`⚠️ Original slider ${sliderId} not found for synchronization`);
            }
        }
        
        console.log('✅ Slider synchronization setup complete');
    }

    /**
     * Handle slider changes (unified interface)
     */
    handleSliderChange(sliderId, value, output = null) {
        // Sync the original slider if this change came from a distribution slider
        if (this.useDistributionSliders) {
            const originalSlider = document.getElementById(sliderId);
            if (originalSlider && parseFloat(originalSlider.value) !== value) {
                // console.log(`🔗 Syncing original slider ${sliderId} to ${value}`);
                originalSlider.value = value;
            }
        }
        
        // Update any connected displays
        this.updateSliderDisplay(sliderId, value);
        
        // Trigger main calculation update
        if (this.updateCallback) {
            this.updateCallback(sliderId, value, output);
        }
        
        // Emit custom event for other listeners
        this.emitSliderEvent('sliderChange', { sliderId, value, output });
    }

    /**
     * Handle real-time slider updates
     */
    handleSliderUpdate(sliderId, value) {
        this.updateSliderDisplay(sliderId, value);
        this.emitSliderEvent('sliderUpdate', { sliderId, value });
    }

    /**
     * Update slider display elements
     */
    updateSliderDisplay(sliderId, value) {
        const config = this.sliderConfigs[sliderId];
        if (!config) return;

        // Update value display
        const valueDisplay = document.getElementById(`${sliderId.replace('-slider', '')}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = config.format(value);
        }

        // Update any formula displays
        this.updateFormulaDisplays();
    }

    /**
     * Update formula displays with current values
     */
    updateFormulaDisplays() {
        const values = this.getAllValues();
        
        // Update mortality formula
        if (values['vsl-slider'] && values['suicides-slider'] && values['attribution-slider']) {
            const mortalityResult = values['suicides-slider'] * (values['attribution-slider'] / 100) * values['vsl-slider'];
            const mortalityDisplay = document.getElementById('mortality-formula-result');
            if (mortalityDisplay) {
                mortalityDisplay.textContent = 
                    `${(values['suicides-slider']/1000).toFixed(0)}K × ${values['attribution-slider'].toFixed(0)}% × $${values['vsl-slider'].toFixed(1)}M = $${(mortalityResult/1e9).toFixed(1)}B`;
            }
        }

        // Update mental health formula
        if (values['depression-slider'] && values['yld-slider'] && values['qol-slider'] && values['vsl-slider']) {
            const mentalResult = values['depression-slider'] * values['yld-slider'] * (values['qol-slider'] / 100) * (values['vsl-slider'] * 1000000 / 75);
            const mentalDisplay = document.getElementById('mental-formula-result');
            if (mentalDisplay) {
                mentalDisplay.textContent = 
                    `${(values['depression-slider']/1000000).toFixed(1)}M × ${values['yld-slider'].toFixed(1)} × ${values['qol-slider'].toFixed(0)}% × $${((values['vsl-slider'] * 1000000 / 75)/1000).toFixed(0)}K = $${(mentalResult/1e12).toFixed(2)}T`;
            }
        }

        // Update healthcare formula
        if (values['depression-slider'] && values['healthcare-slider'] && values['productivity-slider'] && values['duration-slider']) {
            const healthcareResult = values['depression-slider'] * (values['healthcare-slider'] + values['productivity-slider']) * values['duration-slider'];
            const healthcareDisplay = document.getElementById('healthcare-formula-result');
            if (healthcareDisplay) {
                healthcareDisplay.textContent = 
                    `${(values['depression-slider']/1000000).toFixed(1)}M × ($${(values['healthcare-slider']/1000).toFixed(0)}K + $${(values['productivity-slider']/1000).toFixed(0)}K) × ${values['duration-slider'].toFixed(1)}yr = $${(healthcareResult/1e9).toFixed(0)}B`;
            }
        }
    }

    /**
     * Emit custom events
     */
    emitSliderEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Get all slider values (unified interface)
     */
    getAllValues() {
        const values = {};
        
        if (this.useDistributionSliders && this.distributionSliderManager) {
            return this.distributionSliderManager.getAllValues();
        } else {
            // Get values from fallback sliders
            for (const [sliderId, slider] of this.fallbackSliders) {
                values[sliderId] = parseFloat(slider.value);
            }
        }
        
        return values;
    }

    /**
     * Set slider values (unified interface)
     */
    setValues(values) {
        if (this.useDistributionSliders && this.distributionSliderManager) {
            this.distributionSliderManager.setAllValues(values);
        } else {
            // Set values on fallback sliders
            for (const [sliderId, value] of Object.entries(values)) {
                const slider = this.fallbackSliders.get(sliderId);
                if (slider) {
                    slider.value = value;
                    this.handleSliderChange(sliderId, value);
                }
            }
        }
    }

    /**
     * Reset all sliders
     */
    resetAll() {
        if (this.useDistributionSliders && this.distributionSliderManager) {
            this.distributionSliderManager.resetAll();
        } else {
            for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
                const slider = this.fallbackSliders.get(sliderId);
                if (slider) {
                    slider.value = config.default;
                    this.handleSliderChange(sliderId, config.default);
                }
            }
        }
    }

    /**
     * Get uncertainty information (only available with distribution sliders)
     */
    getUncertaintyAnalysis() {
        if (this.useDistributionSliders && this.distributionSliderManager) {
            const output = this.distributionSliderManager.getAllOutput();
            const analysis = {};
            
            for (const [sliderId, sliderOutput] of Object.entries(output)) {
                analysis[sliderId] = {
                    mean: sliderOutput.stats.mean,
                    median: sliderOutput.stats.median,
                    ci95: sliderOutput.stats.ci95,
                    std: sliderOutput.stats.std
                };
            }
            
            return analysis;
        }
        
        return null; // Not available with fallback sliders
    }

    /**
     * Check if distribution sliders are being used
     */
    isUsingDistributionSliders() {
        return this.useDistributionSliders;
    }

    /**
     * Get feature availability
     */
    getFeatures() {
        return {
            distributionVisualization: this.useDistributionSliders,
            uncertaintyAnalysis: this.useDistributionSliders,
            confidenceIntervals: this.useDistributionSliders,
            statisticalDisplays: this.useDistributionSliders,
            basicSliders: true
        };
    }

    /**
     * Ensure layout integrity - force all critical elements to be visible
     */
    ensureLayoutIntegrity() {
        console.log('🔧 Running layout integrity check...');
        
        // Force main grid container to be visible
        const mainGrid = document.querySelector('.flex.flex-col.lg\\:grid.lg\\:grid-cols-3');
        if (mainGrid) {
            mainGrid.style.display = 'grid';
            mainGrid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            console.log('🔧 Fixed main grid layout');
        }
        
        // Force all enhanced-card elements to be visible
        const enhancedCards = document.querySelectorAll('.enhanced-card');
        enhancedCards.forEach((card, index) => {
            card.style.display = 'block';
            card.style.visibility = 'visible';
            card.style.opacity = '1';
            console.log(`🔧 Fixed enhanced-card ${index + 1}`);
        });
        
        // Force enhanced features to be visible
        const enhancedFeatures = document.querySelectorAll('.enhanced-features');
        enhancedFeatures.forEach(element => {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        });
        
        // Force RHS column specifically
        const rhsColumn = document.querySelector('.enhanced-card:last-child');
        if (rhsColumn) {
            rhsColumn.style.display = 'block';
            rhsColumn.style.visibility = 'visible';
            rhsColumn.style.opacity = '1';
            rhsColumn.style.position = 'relative';
            rhsColumn.style.zIndex = '1';
            console.log('🔧 Fixed RHS column specifically');
        }
        
        console.log('✅ Layout integrity check complete');
    }

    /**
     * Update features display in UI
     */
    updateFeaturesDisplay() {
        console.log('🎨 Updating features display...');
        
        const features = this.getFeatures();
        
        // Update integration status
        const statusElement = document.getElementById('integration-status');
        if (statusElement) {
            if (this.useDistributionSliders) {
                statusElement.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mb-8';
                statusElement.innerHTML = `
                    <h4 class="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        ✨ Enhanced Calculator Active
                    </h4>
                    <div class="text-sm text-green-700">
                        You're using distribution sliders with mathematical uncertainty visualization.
                    </div>
                `;
            } else {
                statusElement.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8';
                statusElement.innerHTML = `
                    <h4 class="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        ⚠️ Basic Calculator Mode
                    </h4>
                    <div class="text-sm text-yellow-700">
                        Using fallback sliders. Distribution features unavailable.
                    </div>
                `;
            }
        }
        
        // Update feature list
        const featureListElement = document.getElementById('feature-list');
        if (featureListElement) {
            const featureItems = [
                { key: 'distributionVisualization', label: 'Distribution Curves' },
                { key: 'uncertaintyAnalysis', label: 'Uncertainty Analysis' },
                { key: 'confidenceIntervals', label: 'Confidence Intervals' },
                { key: 'statisticalDisplays', label: 'Statistical Displays' }
            ];
            
            featureListElement.innerHTML = featureItems.map(item => 
                `<div class="flex items-center gap-2">
                    <span class="${features[item.key] ? 'text-green-600' : 'text-gray-400'}">${features[item.key] ? '✓' : '✗'}</span>
                    <span class="${features[item.key] ? 'text-green-600' : 'text-gray-400'}">${item.label}</span>
                </div>`
            ).join('');
        }
        
        // Always show enhanced features - they contain important UI elements
        const enhancedFeatures = document.querySelectorAll('.enhanced-features');
        enhancedFeatures.forEach(element => {
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            console.log(`🎨 Enhanced features forced to be visible`);
        });
        
        // Set up a persistent watcher to keep enhanced features visible
        const keepEnhancedFeaturesVisible = () => {
            const features = document.querySelectorAll('.enhanced-features');
            features.forEach(element => {
                if (element.style.display === 'none' || element.style.visibility === 'hidden' || element.style.opacity === '0') {
                    element.style.display = 'block';
                    element.style.visibility = 'visible';
                    element.style.opacity = '1';
                    console.log(`🔧 Fixed hidden enhanced features`);
                }
            });
        };
        
        // Run the watcher every 100ms for the first 5 seconds to catch any interference
        const watcherInterval = setInterval(keepEnhancedFeaturesVisible, 100);
        setTimeout(() => {
            clearInterval(watcherInterval);
            console.log(`🛡️ Enhanced features protection disabled after 5 seconds`);
        }, 5000);
        
        console.log('✅ Features display updated');
    }

}

// Global instance
window.calculatorIntegration = new CalculatorIntegration(); 