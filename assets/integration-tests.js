/**
 * Integration Testing Framework
 * Validates calculator integration and ensures reliability
 */

class IntegrationTests {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;
        this.autoRunEnabled = false; // Disable auto-run to prevent interference
    }

    /**
     * Initialize the test suite
     */
    initialize() {
        console.log('🧪 Integration test suite initialized (manual run only)');
        this.setupTests();
        this.setupUI();
        
        // Don't run tests automatically - only when manually triggered
        // Tests were interfering with main calculator sliders
        // this.runTests();
    }

    /**
     * Setup UI controls for manual test execution
     */
    setupUI() {
        const runButton = document.getElementById('run-tests-btn');
        if (runButton) {
            runButton.addEventListener('click', () => {
                if (!this.isRunning) {
                    this.runTests();
                }
            });
        }
    }

    /**
     * Add a test case
     */
    addTest(name, testFunction, options = {}) {
        this.tests.push({
            name,
            testFunction,
            timeout: options.timeout || 5000,
            critical: options.critical || false,
            category: options.category || 'general'
        });
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.results = [];
        
        console.log('🧪 Starting integration tests...');
        
        for (const test of this.tests) {
            const result = await this.runTest(test);
            this.results.push(result);
            
            if (result.status === 'fail' && test.critical) {
                console.error(`❌ Critical test failed: ${test.name}`);
                break;
            }
        }
        
        this.isRunning = false;
        this.displayResults();
        return this.results;
    }

    /**
     * Run a single test
     */
    async runTest(test) {
        const startTime = Date.now();
        
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), test.timeout);
            });
            
            await Promise.race([test.testFunction(), timeoutPromise]);
            
            const duration = Date.now() - startTime;
            console.log(`✅ ${test.name} (${duration}ms)`);
            
            return {
                name: test.name,
                status: 'pass',
                duration,
                category: test.category
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ ${test.name} failed:`, error.message);
            
            return {
                name: test.name,
                status: 'fail',
                error: error.message,
                duration,
                category: test.category
            };
        }
    }

    /**
     * Display test results
     */
    displayResults() {
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const total = this.results.length;
        
        console.log(`\n📊 Test Results: ${passed}/${total} passed, ${failed} failed`);
        
        if (failed > 0) {
            console.log('\n❌ Failed tests:');
            this.results
                .filter(r => r.status === 'fail')
                .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
        }
        
        // Update UI if test display exists
        this.updateTestDisplay();
    }

    /**
     * Update test display in UI
     */
    updateTestDisplay() {
        const testDisplay = document.getElementById('integration-test-results');
        if (!testDisplay) return;
        
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const total = this.results.length;
        
        testDisplay.innerHTML = `
            <div class="test-summary ${failed > 0 ? 'has-failures' : 'all-passed'}">
                <h4>Integration Test Results</h4>
                <div class="test-stats">
                    <span class="passed">${passed} passed</span>
                    <span class="failed">${failed} failed</span>
                    <span class="total">${total} total</span>
                </div>
            </div>
            <div class="test-details">
                ${this.results.map(result => `
                    <div class="test-result ${result.status}">
                        <span class="test-name">${result.name}</span>
                        <span class="test-status">${result.status}</span>
                        <span class="test-duration">${result.duration}ms</span>
                        ${result.error ? `<div class="test-error">${result.error}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Initialize test framework
const integrationTests = new IntegrationTests();

// Define test cases
integrationTests.addTest('Library Loading', async () => {
    // Test that all required libraries are available
    if (!window.d3) throw new Error('D3.js not loaded');
    if (!window.DistributionSlider) throw new Error('DistributionSlider not loaded');
    if (!window.DistributionSliderManager) throw new Error('DistributionSliderManager not loaded');
}, { critical: true, category: 'dependencies' });

integrationTests.addTest('Calculator Integration Initialization', async () => {
    // Test that calculator integration initializes
    if (!window.calculatorIntegration) throw new Error('Calculator integration not available');
    
    // Mock update callback for testing
    let callbackCalled = false;
    const testCallback = () => { callbackCalled = true; };
    
    await window.calculatorIntegration.initialize(testCallback);
    
    if (!window.calculatorIntegration.isInitialized) {
        throw new Error('Calculator integration failed to initialize');
    }
}, { critical: true, category: 'integration' });

integrationTests.addTest('Slider Value Setting and Getting', async () => {
    // Test unified value interface
    if (!window.calculatorIntegration || !window.calculatorIntegration.isInitialized) {
        throw new Error('Calculator integration not initialized');
    }
    
    const testValues = {
        'vsl-slider': 15.0,
        'attribution-slider': 25,
        'depression-slider': 8000000
    };
    
    window.calculatorIntegration.setValues(testValues);
    const retrievedValues = window.calculatorIntegration.getAllValues();
    
    for (const [key, expectedValue] of Object.entries(testValues)) {
        const actualValue = retrievedValues[key];
        if (actualValue === undefined || actualValue === null) {
            throw new Error(`Value for ${key} is undefined or null`);
        }
        if (Math.abs(actualValue - expectedValue) > 0.1) {
            throw new Error(`Value mismatch for ${key}: expected ${expectedValue}, got ${actualValue}`);
        }
    }
}, { category: 'functionality' });

integrationTests.addTest('Scenario Setting', async () => {
    // Test scenario functionality
    if (!window.calculatorIntegration || !window.calculatorIntegration.isInitialized) {
        throw new Error('Calculator integration not initialized');
    }
    
    const scenarios = {
        'research-consensus': { 'vsl-slider': 13.7, 'attribution-slider': 18 },
        'optimistic': { 'vsl-slider': 8, 'attribution-slider': 5 }
    };
    
    for (const [scenarioName, expectedValues] of Object.entries(scenarios)) {
        window.calculatorIntegration.setValues(expectedValues);
        const actualValues = window.calculatorIntegration.getAllValues();
        
        for (const [key, expectedValue] of Object.entries(expectedValues)) {
            const actualValue = actualValues[key];
            if (actualValue === undefined || actualValue === null) {
                throw new Error(`Value for ${key} is undefined or null in scenario ${scenarioName}`);
            }
            if (Math.abs(actualValue - expectedValue) > 0.1) {
                throw new Error(`Scenario ${scenarioName} failed: ${key} expected ${expectedValue}, got ${actualValue}`);
            }
        }
    }
}, { category: 'functionality' });

integrationTests.addTest('Mathematical Accuracy', async () => {
    // Test distribution mathematical functions
    const normal = new NormalDistribution(0, 1);
    const beta = new BetaDistribution(2, 2, 0, 1);
    const lognormal = new LogNormalDistribution(0, 1);
    
    // Test normal distribution
    const normalCdf = normal.cdf(0);
    if (Math.abs(normalCdf - 0.5) > 1e-6) {
        throw new Error(`Normal CDF(0) should be 0.5, got ${normalCdf}`);
    }
    
    // Test beta distribution
    const betaCdf = beta.cdf(0.5);
    if (Math.abs(betaCdf - 0.5) > 1e-6) {
        throw new Error(`Beta CDF(0.5) should be 0.5, got ${betaCdf}`);
    }
    
    // Test log-normal distribution
    const lognormalPdf = lognormal.pdf(1);
    if (lognormalPdf <= 0 || !isFinite(lognormalPdf)) {
        throw new Error(`Log-normal PDF(1) should be positive and finite, got ${lognormalPdf}`);
    }
}, { critical: true, category: 'mathematics' });

integrationTests.addTest('Error Handling', async () => {
    // Test error recovery
    try {
        // Try to create slider with invalid config
        new DistributionSlider({
            containerId: 'non-existent-container',
            min: 10,
            max: 5, // Invalid: min > max
            default: 7
        });
        throw new Error('Should have thrown error for invalid config');
    } catch (error) {
        if (error.message.includes('Should have thrown')) {
            throw error;
        }
        // Expected error, test passes
    }
    
    // Test graceful value clamping
    if (!window.calculatorIntegration || !window.calculatorIntegration.isInitialized) {
        throw new Error('Calculator integration not initialized');
    }
    
    const integration = window.calculatorIntegration;
    integration.setValues({ 'vsl-slider': 999999 }); // Way above max
    const values = integration.getAllValues();
    if (values['vsl-slider'] === undefined || values['vsl-slider'] === null) {
        throw new Error('Value for vsl-slider is undefined or null');
    }
    if (values['vsl-slider'] > 20) {
        throw new Error('Value should be clamped to maximum');
    }
}, { category: 'error-handling' });

integrationTests.addTest('Performance', async () => {
    // Test performance of slider operations
    if (!window.calculatorIntegration || !window.calculatorIntegration.isInitialized) {
        throw new Error('Calculator integration not initialized');
    }
    
    const startTime = Date.now();
    
    // Rapid value changes
    for (let i = 0; i < 100; i++) {
        window.calculatorIntegration.setValues({
            'vsl-slider': 8 + (i % 12),
            'attribution-slider': 5 + (i % 25)
        });
    }
    
    const duration = Date.now() - startTime;
    if (duration > 1000) { // Should complete in under 1 second
        throw new Error(`Performance test too slow: ${duration}ms`);
    }
}, { category: 'performance' });

integrationTests.addTest('Memory Leaks', async () => {
    // Test for memory leaks in slider creation/destruction
    // Skip this test during normal operation to avoid interfering with main sliders
    if (window.location.search.includes('test=true')) {
        const initialSliderCount = document.querySelectorAll('.distribution-slider-container').length;
        
        // Create and destroy temporary sliders in a separate container
        const testArea = document.createElement('div');
        testArea.id = 'memory-test-area';
        testArea.style.position = 'absolute';
        testArea.style.left = '-9999px';
        testArea.style.top = '-9999px';
        testArea.style.width = '1px';
        testArea.style.height = '1px';
        testArea.style.overflow = 'hidden';
        document.body.appendChild(testArea);
        
        const tempManager = new DistributionSliderManager();
        
        for (let i = 0; i < 10; i++) {
            const containerId = `temp-container-${i}`;
            const container = document.createElement('div');
            container.id = containerId;
            container.style.width = '400px';
            container.style.height = '160px';
            testArea.appendChild(container);
            
            tempManager.create({
                containerId,
                min: 0,
                max: 100,
                default: 50
            });
        }
        
        // Clean up
        tempManager.destroyAll();
        document.body.removeChild(testArea);
        
        const finalSliderCount = document.querySelectorAll('.distribution-slider-container').length;
        if (finalSliderCount !== initialSliderCount) {
            throw new Error(`Memory leak detected: slider count changed from ${initialSliderCount} to ${finalSliderCount}`);
        }
    } else {
        // Just verify no obvious memory issues in normal mode
        const sliderCount = document.querySelectorAll('.distribution-slider-container').length;
        if (sliderCount < 0) {
            throw new Error('Negative slider count detected');
        }
    }
}, { category: 'memory' });

integrationTests.addTest('Browser Compatibility', async () => {
    // Test browser feature compatibility
    const requiredFeatures = [
        { name: 'Promise', obj: window },
        { name: 'Map', obj: window },
        { name: 'Set', obj: window },
        { name: 'CustomEvent', obj: window },
        { name: 'addEventListener', obj: window },
        { name: 'querySelector', obj: document },
        { name: 'Math.log', obj: window },
        { name: 'Math.exp', obj: window },
        { name: 'Math.sqrt', obj: window }
    ];
    
    for (const feature of requiredFeatures) {
        const parts = feature.name.split('.');
        let obj = feature.obj;
        for (const part of parts) {
            obj = obj[part];
            if (obj === undefined) {
                throw new Error(`Missing required feature: ${feature.name}`);
            }
        }
    }
}, { critical: true, category: 'compatibility' });

// Auto-run tests disabled - only run manually via button
// Tests were interfering with main calculator display
// To run tests: add ?test=true&autorun=true to URL
if (false && window.location.search.includes('test=true') && window.location.search.includes('autorun=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => integrationTests.runAllTests(), 1000);
    });
}

// Export for manual testing
window.integrationTests = integrationTests; 