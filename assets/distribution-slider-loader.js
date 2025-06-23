/**
 * Distribution Slider Loader
 * Handles dependency loading, fallbacks, and graceful degradation
 */

class DistributionSliderLoader {
    constructor() {
        this.isLoaded = false;
        this.isLoading = false;
        this.dependencies = {
            d3: {
                url: 'https://d3js.org/d3.v7.min.js',
                check: () => window.d3 && typeof window.d3 === 'object',
                fallback: 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
            }
        };
        this.callbacks = [];
        this.loadAttempts = 0;
        this.maxAttempts = 3;
    }

    /**
     * Load the distribution slider library with dependencies
     * @param {Function} callback - Called when ready or on error
     * @param {Object} options - Loading options
     */
    async load(callback = () => {}, options = {}) {
        console.log('🔄 Distribution slider loader called...');
        
        if (this.isLoaded) {
            console.log('✅ Already loaded, calling callback');
            callback(null, true);
            return;
        }

        if (this.isLoading) {
            console.log('⏳ Already loading, adding callback to queue');
            this.callbacks.push(callback);
            return;
        }

        this.isLoading = true;
        this.callbacks.push(callback);
        this.loadAttempts++;

        console.log(`🚀 Starting load attempt ${this.loadAttempts}/${this.maxAttempts}`);

        try {
            // Load dependencies first
            console.log('📦 Loading dependencies...');
            await this.loadDependencies();
            console.log('✅ Dependencies loaded');
            
            // Load the main library
            console.log('📚 Loading distribution sliders library...');
            await this.loadDistributionSliders();
            console.log('✅ Distribution sliders library loaded');
            
            // Verify everything loaded correctly
            console.log('🔍 Verifying library...');
            
            // Add a small delay before verification to ensure classes are initialized
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (this.verifyLibrary()) {
                console.log('✅ Library verification passed');
                this.isLoaded = true;
                this.notifyCallbacks(null, true);
            } else {
                throw new Error('Library verification failed - required classes not available');
            }
        } catch (error) {
            console.error('❌ Distribution slider loading failed:', error);
            
            if (this.loadAttempts < this.maxAttempts) {
                console.log(`🔄 Retrying... (${this.loadAttempts}/${this.maxAttempts})`);
                this.isLoading = false;
                setTimeout(() => this.load(() => {}, options), 1000);
                return;
            }
            
            this.notifyCallbacks(error, false);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load required dependencies
     */
    async loadDependencies() {
        for (const [name, dep] of Object.entries(this.dependencies)) {
            console.log(`📦 Checking dependency: ${name}`);
            
            if (!dep.check()) {
                console.log(`⬇️ Loading ${name} from primary URL...`);
                try {
                    await this.loadScript(dep.url);
                    console.log(`✅ ${name} loaded from primary URL`);
                } catch (error) {
                    console.warn(`⚠️ Primary URL failed for ${name}, trying fallback...`);
                    await this.loadScript(dep.fallback);
                    console.log(`✅ ${name} loaded from fallback URL`);
                }
                
                // Wait a bit for the script to initialize
                await this.waitForCondition(dep.check, 3000);
                
                if (!dep.check()) {
                    throw new Error(`Failed to load ${name} - not available after loading`);
                }
            } else {
                console.log(`✅ ${name} already available`);
            }
        }
    }

    /**
     * Load the distribution slider library
     */
    async loadDistributionSliders() {
        if (!window.DistributionSlider || !window.DistributionSliderManager) {
            console.log('⬇️ Loading distribution-sliders.js...');
            await this.loadScript('assets/distribution-sliders.js');
            console.log('✅ distribution-sliders.js loaded');
            
            // Wait for classes to be available with more flexible checking
            console.log('⏳ Waiting for distribution slider classes...');
            await this.waitForCondition(() => {
                const hasDistributionSlider = window.DistributionSlider && typeof window.DistributionSlider === 'function';
                const hasManager = window.DistributionSliderManager && typeof window.DistributionSliderManager === 'function';
                const hasNormal = window.NormalDistribution && typeof window.NormalDistribution === 'function';
                const hasBeta = window.BetaDistribution && typeof window.BetaDistribution === 'function';
                const hasLogNormal = window.LogNormalDistribution && typeof window.LogNormalDistribution === 'function';
                
                console.log(`🔍 Class availability check:`, {
                    DistributionSlider: hasDistributionSlider,
                    DistributionSliderManager: hasManager,
                    NormalDistribution: hasNormal,
                    BetaDistribution: hasBeta,
                    LogNormalDistribution: hasLogNormal
                });
                
                return hasDistributionSlider && hasManager && hasNormal && hasBeta && hasLogNormal;
            }, 10000); // Increased timeout
        } else {
            console.log('✅ Distribution slider classes already available');
        }
    }

    /**
     * Wait for a condition to be true
     */
    waitForCondition(condition, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 100;
            
            const check = () => {
                try {
                    if (condition()) {
                        resolve();
                        return;
                    }
                } catch (error) {
                    // Ignore errors during checking
                }
                
                if (Date.now() - startTime > timeout) {
                    reject(new Error('Condition timeout'));
                    return;
                }
                
                setTimeout(check, checkInterval);
            };
            
            check();
        });
    }

    /**
     * Load a script dynamically
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log(`✅ Script loaded: ${url}`);
                // Add a longer delay to ensure script initialization
                setTimeout(resolve, 200); // Increased from 50ms
            };
            
            script.onerror = (error) => {
                console.error(`❌ Script failed to load: ${url}`, error);
                reject(new Error(`Failed to load ${url}`));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Verify the library loaded correctly
     */
    verifyLibrary() {
        console.log('🔍 Starting library verification...');
        
        try {
            const checks = [
                { name: 'D3', check: () => window.d3 && typeof window.d3 === 'object' },
                { name: 'DistributionSlider', check: () => window.DistributionSlider && typeof window.DistributionSlider === 'function' },
                { name: 'DistributionSliderManager', check: () => window.DistributionSliderManager && typeof window.DistributionSliderManager === 'function' },
                { name: 'NormalDistribution', check: () => window.NormalDistribution && typeof window.NormalDistribution === 'function' },
                { name: 'BetaDistribution', check: () => window.BetaDistribution && typeof window.BetaDistribution === 'function' },
                { name: 'LogNormalDistribution', check: () => window.LogNormalDistribution && typeof window.LogNormalDistribution === 'function' }
            ];
            
            let allPassed = true;
            const results = {};
            
            for (const { name, check } of checks) {
                try {
                    const passed = check();
                    results[name] = passed;
                    if (!passed) {
                        console.error(`❌ Verification failed: ${name} not available`);
                        console.error(`   window.${name}:`, window[name]);
                        console.error(`   typeof window.${name}:`, typeof window[name]);
                        allPassed = false;
                    } else {
                        console.log(`✅ Verification passed: ${name} available`);
                    }
                } catch (error) {
                    console.error(`❌ Verification error for ${name}:`, error);
                    results[name] = false;
                    allPassed = false;
                }
            }
            
            console.log('📊 Verification summary:', results);
            
            if (!allPassed) {
                console.error('❌ Library verification failed - not all required classes available');
                return false;
            }
            
            // Try creating a test distribution to ensure math functions work
            console.log('🧮 Testing mathematical functions...');
            try {
                const testDist = new window.NormalDistribution(0, 1);
                const testPdf = testDist.pdf(0);
                console.log(`📊 Normal distribution PDF(0) = ${testPdf}`);
                
                if (!isFinite(testPdf) || testPdf <= 0) {
                    console.error('❌ Math verification failed: Normal distribution PDF test failed');
                    console.error(`   Expected positive finite number, got: ${testPdf}`);
                    return false;
                }
                console.log('✅ Math verification passed');
            } catch (error) {
                console.error('❌ Math verification failed:', error);
                console.error('   Error creating or testing NormalDistribution');
                return false;
            }
            
            console.log('✅ All library verification checks passed');
            return true;
            
        } catch (error) {
            console.error('❌ Library verification error:', error);
            return false;
        }
    }

    /**
     * Notify all waiting callbacks
     */
    notifyCallbacks(error, success) {
        console.log(`📢 Notifying ${this.callbacks.length} callbacks: ${success ? 'success' : 'failure'}`);
        
        this.callbacks.forEach((callback, index) => {
            try {
                callback(error, success);
                console.log(`✅ Callback ${index + 1} notified successfully`);
            } catch (err) {
                console.error(`❌ Callback ${index + 1} error:`, err);
            }
        });
        this.callbacks = [];
    }

    /**
     * Check if distribution sliders are available
     */
    isAvailable() {
        return this.isLoaded && this.verifyLibrary();
    }

    /**
     * Get loading status
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            isLoading: this.isLoading,
            loadAttempts: this.loadAttempts,
            isAvailable: this.isAvailable()
        };
    }
}

// Global instance
window.distributionSliderLoader = new DistributionSliderLoader();

// Enhanced auto-load logic
function initializeLoader() {
    console.log('🎯 Initializing distribution slider loader...');
    
    if (!window.distributionSliderLoader.isLoading && !window.distributionSliderLoader.isLoaded) {
        console.log('🚀 Starting auto-load...');
        window.distributionSliderLoader.load((error, success) => {
            if (success) {
                console.log('✅ Auto-load successful');
                // Dispatch event for other components
                document.dispatchEvent(new CustomEvent('distributionSlidersReady'));
            } else {
                console.error('❌ Auto-load failed:', error);
                // Dispatch event for fallback handling
                document.dispatchEvent(new CustomEvent('distributionSlidersFailed', { detail: error }));
            }
        });
    }
}

// Auto-load on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoader);
} else {
    // DOM already loaded
    setTimeout(initializeLoader, 100);
} 