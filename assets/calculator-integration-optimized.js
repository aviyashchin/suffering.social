/**
 * Optimized Calculator Integration
 * Removes redundancy and improves performance
 */

class OptimizedCalculatorIntegration {
    constructor() {
        this.useDistributionSliders = false;
        this.distributionSliderManager = null;
        this.fallbackSliders = new Map();
        this.isInitialized = false;
        
        // Simplified slider configurations
        this.sliderConfigs = {
            'vsl-slider': { min: 8, max: 20, default: 13.7, format: (v) => `$${v}M` },
            'suicides-slider': { min: 100000, max: 300000, default: 110000, format: (v) => `${Math.round(v/1000)}K` },
            'attribution-slider': { min: 5, max: 30, default: 18, format: (v) => `${v}%` },
            'depression-slider': { min: 3000000, max: 15000000, default: 5000000, format: (v) => `${Math.round(v/1000000)}M` },
            'yld-slider': { min: 4, max: 8, default: 6, format: (v) => `${v} years` },
            'qol-slider': { min: 30, max: 40, default: 35, format: (v) => `${v}%` },
            'healthcare-slider': { min: 6500, max: 20000, default: 7000, format: (v) => `$${Math.round(v/1000)}K` },
            'productivity-slider': { min: 6000, max: 10000, default: 6000, format: (v) => `$${Math.round(v/1000)}K` },
            'duration-slider': { min: 3, max: 6, default: 4.5, format: (v) => `${v} years` }
        };
        
        this.updateCallback = null;
    }

    async initialize(updateCallback) {
        if (this.isInitialized) return;
        
        this.updateCallback = updateCallback;
        
        // Try lightweight distribution sliders first
        if (window.LightweightDistributionSliderManager) {
            await this.initializeLightweightSliders();
        } else {
            this.initializeFallbackSliders();
        }
        
        this.setupSliderSynchronization();
        this.isInitialized = true;
        
        console.log('✅ Optimized calculator integration initialized');
    }

    async initializeLightweightSliders() {
        try {
            this.distributionSliderManager = new LightweightDistributionSliderManager();
            
            // Create containers and sliders
            await this.createSliderContainers();
            await this.createLightweightSliders();
            
            this.useDistributionSliders = true;
            document.body.classList.add('has-distribution-sliders');
            
            console.log('✅ Lightweight distribution sliders initialized');
        } catch (error) {
            console.warn('⚠️ Lightweight sliders failed, using fallback:', error);
            this.initializeFallbackSliders();
        }
    }

    async createSliderContainers() {
        for (const sliderId of Object.keys(this.sliderConfigs)) {
            const containerId = sliderId.replace('-slider', '-slider-container');
            let container = document.getElementById(containerId);
            
            if (!container) {
                const originalSlider = document.getElementById(sliderId);
                if (originalSlider) {
                    container = document.createElement('div');
                    container.id = containerId;
                    container.className = 'distribution-slider-container';
                    
                    // Insert after the original slider's container
                    const sliderContainer = originalSlider.closest('.slider-container');
                    if (sliderContainer) {
                        sliderContainer.parentNode.insertBefore(container, sliderContainer.nextSibling);
                    }
                }
            }
        }
    }

    async createLightweightSliders() {
        // Measure slider widths first
        const sliderWidths = this.measureSliderWidths();
        
        for (const [sliderId, config] of Object.entries(this.sliderConfigs)) {
            const containerId = sliderId.replace('-slider', '-slider-container');
            const container = document.getElementById(containerId);
            
            if (container) {
                const sliderConfig = {
                    ...config,
                    containerId,
                    sliderId: sliderId.replace('-slider', '-distribution'),
                    width: sliderWidths[sliderId] || 400,
                    height: 60, // Reduced height for better performance
                    onChange: (value) => {
                        this.handleSliderChange(sliderId, value);
                    },
                    onUpdate: (value) => {
                        this.handleSliderUpdate(sliderId, value);
                    }
                };
                
                try {
                    this.distributionSliderManager.create(sliderConfig);
                    console.log(`✅ Created lightweight slider: ${sliderId}`);
                } catch (error) {
                    console.error(`❌ Failed to create slider ${sliderId}:`, error);
                }
            }
        }
    }

    measureSliderWidths() {
        const widths = {};
        
        for (const sliderId of Object.keys(this.sliderConfigs)) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                const rect = slider.getBoundingClientRect();
                widths[sliderId] = rect.width > 0 ? rect.width : 400;
            }
        }
        
        return widths;
    }

    initializeFallbackSliders() {
        for (const sliderId of Object.keys(this.sliderConfigs)) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.handleSliderChange(sliderId, parseFloat(e.target.value));
                });
                
                this.fallbackSliders.set(sliderId, slider);
            }
        }
        
        console.log('✅ Fallback sliders initialized');
    }

    setupSliderSynchronization() {
        // Add event listeners to original sliders to update distribution sliders
        for (const sliderId of Object.keys(this.sliderConfigs)) {
            const originalSlider = document.getElementById(sliderId);
            if (originalSlider) {
                originalSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    
                    if (this.useDistributionSliders) {
                        const distributionSliderId = sliderId.replace('-slider', '-distribution');
                        const distributionSlider = this.distributionSliderManager?.get(distributionSliderId);
                        if (distributionSlider) {
                            distributionSlider.setValue(value, false); // Don't trigger change to avoid loop
                        }
                    }
                });
            }
        }
    }

    handleSliderChange(sliderId, value) {
        // Update the original slider
        const originalSlider = document.getElementById(sliderId);
        if (originalSlider && parseFloat(originalSlider.value) !== value) {
            originalSlider.value = value;
            
            // Trigger input event on original slider to update displays
            originalSlider.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Call the main update callback
        if (this.updateCallback) {
            this.updateCallback();
        }
    }

    handleSliderUpdate(sliderId, value) {
        // Update displays during dragging (debounced)
        this.debouncedUpdate = this.debouncedUpdate || this.debounce(() => {
            if (this.updateCallback) {
                this.updateCallback();
            }
        }, 100);
        
        this.debouncedUpdate();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Get current slider values
    getSliderValues() {
        const values = {};
        
        if (this.useDistributionSliders && this.distributionSliderManager) {
            const distributionValues = this.distributionSliderManager.getAllValues();
            
            // Convert distribution slider IDs back to original slider IDs
            for (const [distId, value] of Object.entries(distributionValues)) {
                const originalId = distId.replace('-distribution', '-slider');
                values[originalId] = value;
            }
        } else {
            // Get values from fallback sliders
            for (const [sliderId, slider] of this.fallbackSliders) {
                values[sliderId] = parseFloat(slider.value);
            }
        }
        
        return values;
    }

    // Set slider values
    setSliderValues(values) {
        if (this.useDistributionSliders && this.distributionSliderManager) {
            const distributionValues = {};
            
            // Convert original slider IDs to distribution slider IDs
            for (const [originalId, value] of Object.entries(values)) {
                const distId = originalId.replace('-slider', '-distribution');
                distributionValues[distId] = value;
            }
            
            this.distributionSliderManager.setAllValues(distributionValues);
        }
        
        // Also update original sliders
        for (const [sliderId, value] of Object.entries(values)) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.value = value;
            }
        }
    }

    // Cleanup
    destroy() {
        if (this.distributionSliderManager) {
            this.distributionSliderManager.destroyAll();
        }
        
        this.fallbackSliders.clear();
        this.isInitialized = false;
    }
}

// Global instance
window.optimizedCalculatorIntegration = new OptimizedCalculatorIntegration(); 