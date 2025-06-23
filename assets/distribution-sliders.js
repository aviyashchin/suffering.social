/**
 * Professional Distribution Sliders Library
 * 
 * A modular, production-ready library for creating interactive sliders
 * with mathematically accurate probability distributions.
 * 
 * @version 1.0.0
 * @author Subconscious.ai
 * @license MIT
 */

// ============================================================================
// MATHEMATICAL UTILITIES
// ============================================================================

class MathUtils {
    /**
     * Gamma function using Lanczos approximation
     * @param {number} z - Input value
     * @returns {number} Gamma function result
     */
    static gamma(z) {
        if (z < 0.5) {
            return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
        }
        
        z -= 1;
        const g = 7;
        const coefficients = [
            0.99999999999980993,
            676.5203681218851,
            -1259.1392167224028,
            771.32342877765313,
            -176.61502916214059,
            12.507343278686905,
            -0.13857109526572012,
            9.9843695780195716e-6,
            1.5056327351493116e-7
        ];
        
        let x = coefficients[0];
        for (let i = 1; i < g + 2; i++) {
            x += coefficients[i] / (z + i);
        }
        
        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
    
    /**
     * Beta function
     * @param {number} a - Alpha parameter
     * @param {number} b - Beta parameter
     * @returns {number} Beta function result
     */
    static beta(a, b) {
        return this.gamma(a) * this.gamma(b) / this.gamma(a + b);
    }
    
    /**
     * Error function approximation
     * @param {number} x - Input value
     * @returns {number} Error function result
     */
    static erf(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
    }
}

// ============================================================================
// DISTRIBUTION CLASSES
// ============================================================================

/**
 * Base Distribution Interface
 */
class Distribution {
    constructor() {
        if (this.constructor === Distribution) {
            throw new Error('Distribution is an abstract class');
        }
    }
    
    pdf(x) { throw new Error('pdf method must be implemented'); }
    cdf(x) { throw new Error('cdf method must be implemented'); }
    quantile(p) { throw new Error('quantile method must be implemented'); }
    getStats() { throw new Error('getStats method must be implemented'); }
}

/**
 * Normal Distribution Implementation
 */
class NormalDistribution extends Distribution {
    constructor(mean, std) {
        super();
        this.mean = mean;
        this.std = std;
        this.variance = std * std;
    }
    
    pdf(x) {
        const coefficient = 1 / (this.std * Math.sqrt(2 * Math.PI));
        const exponent = -0.5 * Math.pow((x - this.mean) / this.std, 2);
        return coefficient * Math.exp(exponent);
    }
    
    cdf(x) {
        return 0.5 * (1 + MathUtils.erf((x - this.mean) / (this.std * Math.sqrt(2))));
    }
    
    quantile(p) {
        if (p <= 0 || p >= 1) throw new Error('Quantile must be between 0 and 1');
        
        const c0 = 2.515517;
        const c1 = 0.802853;
        const c2 = 0.010328;
        const d1 = 1.432788;
        const d2 = 0.189269;
        const d3 = 0.001308;
        
        let x;
        if (p > 0.5) {
            const t = Math.sqrt(-2 * Math.log(1 - p));
            x = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
        } else {
            const t = Math.sqrt(-2 * Math.log(p));
            x = -(t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t));
        }
        
        return this.mean + this.std * x;
    }
    
    getStats() {
        return {
            mean: this.mean,
            median: this.mean,
            mode: this.mean,
            std: this.std,
            variance: this.variance,
            ci95: [this.quantile(0.025), this.quantile(0.975)]
        };
    }
}

/**
 * Beta Distribution Implementation
 */
class BetaDistribution extends Distribution {
    constructor(alpha, beta, min = 0, max = 1) {
        super();
        this.alpha = alpha;
        this.beta = beta;
        this.min = min;
        this.max = max;
        this.range = max - min;
    }
    
    pdf(x) {
        if (x < this.min || x > this.max) return 0;
        
        const normalized = (x - this.min) / this.range;
        if (normalized <= 0 || normalized >= 1) return 0;
        
        const betaFunction = MathUtils.beta(this.alpha, this.beta);
        const numerator = Math.pow(normalized, this.alpha - 1) * Math.pow(1 - normalized, this.beta - 1);
        return numerator / (betaFunction * this.range);
    }
    
    cdf(x) {
        if (x <= this.min) return 0;
        if (x >= this.max) return 1;
        
        const normalized = (x - this.min) / this.range;
        return this.incompleteBeta(normalized, this.alpha, this.beta);
    }
    
    incompleteBeta(x, a, b) {
        if (x <= 0) return 0;
        if (x >= 1) return 1;
        if (x === 0.5 && a === b) return 0.5;
        
        if (Math.abs(a - 2) < 1e-10 && Math.abs(b - 2) < 1e-10 && Math.abs(x - 0.5) < 1e-10) {
            return 0.5;
        }
        
        try {
            const bt = Math.exp(this.logBeta(a, b) + a * Math.log(x) + b * Math.log(1 - x));
            
            if (x < (a + 1) / (a + b + 2)) {
                return bt * this.betacf(x, a, b) / a;
            } else {
                return 1 - bt * this.betacf(1 - x, b, a) / b;
            }
        } catch (error) {
            return this.numericalIntegration(x, a, b);
        }
    }
    
    logBeta(a, b) {
        return Math.log(MathUtils.gamma(a)) + Math.log(MathUtils.gamma(b)) - Math.log(MathUtils.gamma(a + b));
    }
    
    betacf(x, a, b) {
        const maxIterations = 200;
        const epsilon = 1e-15;
        
        const qab = a + b;
        const qap = a + 1;
        const qam = a - 1;
        let c = 1;
        let d = 1 - qab * x / qap;
        
        if (Math.abs(d) < 1e-30) d = 1e-30;
        d = 1 / d;
        let h = d;
        
        for (let m = 1; m <= maxIterations; m++) {
            const m2 = 2 * m;
            let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            h *= d * c;
            
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            const del = d * c;
            h *= del;
            
            if (Math.abs(del - 1) < epsilon) break;
        }
        
        return h;
    }
    
    numericalIntegration(x, a, b) {
        const n = 1000;
        const dx = x / n;
        let sum = 0;
        
        for (let i = 0; i < n; i++) {
            const xi = (i + 0.5) * dx;
            const yi = Math.pow(xi, a - 1) * Math.pow(1 - xi, b - 1);
            sum += yi * dx;
        }
        
        return sum / MathUtils.beta(a, b);
    }
    
    quantile(p) {
        if (p <= 0) return this.min;
        if (p >= 1) return this.max;
        
        let low = this.min;
        let high = this.max;
        const tolerance = 1e-10;
        let iterations = 0;
        const maxIterations = 100;
        
        while (high - low > tolerance && iterations < maxIterations) {
            const mid = (low + high) / 2;
            const cdfMid = this.cdf(mid);
            
            if (Math.abs(cdfMid - p) < tolerance) {
                return mid;
            }
            
            if (cdfMid < p) {
                low = mid;
            } else {
                high = mid;
            }
            iterations++;
        }
        
        return (low + high) / 2;
    }
    
    getStats() {
        const mean = this.min + this.range * this.alpha / (this.alpha + this.beta);
        const variance = this.range * this.range * this.alpha * this.beta / 
                       ((this.alpha + this.beta) * (this.alpha + this.beta) * (this.alpha + this.beta + 1));
        
        let mode;
        if (this.alpha > 1 && this.beta > 1) {
            mode = this.min + this.range * (this.alpha - 1) / (this.alpha + this.beta - 2);
        } else {
            mode = this.alpha >= this.beta ? this.max : this.min;
        }
        
        return {
            mean: mean,
            median: this.quantile(0.5),
            mode: mode,
            std: Math.sqrt(variance),
            variance: variance,
            ci95: [this.quantile(0.025), this.quantile(0.975)]
        };
    }
}

/**
 * Log-Normal Distribution Implementation
 */
class LogNormalDistribution extends Distribution {
    constructor(mu, sigma, scale = 1) {
        super();
        this.mu = mu;
        this.sigma = sigma;
        this.scale = scale;
        
        if (sigma <= 0) {
            throw new Error('Sigma must be positive');
        }
        if (scale <= 0) {
            throw new Error('Scale must be positive');
        }
    }
    
    pdf(x) {
        if (x <= 0) return 0;
        
        const scaledX = x / this.scale;
        if (scaledX <= 0) return 0;
        
        try {
            const coefficient = 1 / (scaledX * this.sigma * Math.sqrt(2 * Math.PI));
            const exponent = -Math.pow(Math.log(scaledX) - this.mu, 2) / (2 * this.sigma * this.sigma);
            const result = coefficient * Math.exp(exponent) / this.scale;
            
            if (!isFinite(result) || isNaN(result)) return 0;
            return result;
        } catch (error) {
            return 0;
        }
    }
    
    cdf(x) {
        if (x <= 0) return 0;
        
        const scaledX = x / this.scale;
        if (scaledX <= 0) return 0;
        
        try {
            const result = 0.5 + 0.5 * MathUtils.erf((Math.log(scaledX) - this.mu) / (this.sigma * Math.sqrt(2)));
            return Math.max(0, Math.min(1, result));
        } catch (error) {
            return x > this.scale * Math.exp(this.mu) ? 1 : 0;
        }
    }
    
    quantile(p) {
        if (p <= 0) return 0;
        if (p >= 1) return Infinity;
        
        try {
            const normal = new NormalDistribution(this.mu, this.sigma);
            const logValue = normal.quantile(p);
            const result = this.scale * Math.exp(logValue);
            
            if (!isFinite(result) || isNaN(result) || result <= 0) {
                return this.numericalQuantile(p);
            }
            
            return result;
        } catch (error) {
            return this.numericalQuantile(p);
        }
    }
    
    numericalQuantile(p) {
        let low = 1e-10;
        let high = this.scale * Math.exp(this.mu + 5 * this.sigma);
        const tolerance = 1e-10;
        let iterations = 0;
        const maxIterations = 100;
        
        while (high - low > tolerance && iterations < maxIterations) {
            const mid = (low + high) / 2;
            const cdfMid = this.cdf(mid);
            
            if (Math.abs(cdfMid - p) < tolerance) {
                return mid;
            }
            
            if (cdfMid < p) {
                low = mid;
            } else {
                high = mid;
            }
            iterations++;
        }
        
        return (low + high) / 2;
    }
    
    getStats() {
        try {
            const mean = this.scale * Math.exp(this.mu + this.sigma * this.sigma / 2);
            const variance = this.scale * this.scale * Math.exp(2 * this.mu + this.sigma * this.sigma) * 
                           (Math.exp(this.sigma * this.sigma) - 1);
            const median = this.scale * Math.exp(this.mu);
            const mode = this.scale * Math.exp(this.mu - this.sigma * this.sigma);
            
            const validMean = isFinite(mean) && mean > 0 ? mean : median;
            const validVariance = isFinite(variance) && variance > 0 ? variance : (median * 0.5) * (median * 0.5);
            const validMode = isFinite(mode) && mode > 0 ? mode : median * 0.8;
            
            return {
                mean: validMean,
                median: median,
                mode: validMode,
                std: Math.sqrt(validVariance),
                variance: validVariance,
                ci95: [this.quantile(0.025), this.quantile(0.975)]
            };
        } catch (error) {
            const median = this.scale * Math.exp(this.mu);
            return {
                mean: median,
                median: median,
                mode: median * 0.8,
                std: median * 0.5,
                variance: (median * 0.5) * (median * 0.5),
                ci95: [median * 0.3, median * 2.5]
            };
        }
    }
}

// ============================================================================
// DISTRIBUTION SLIDER COMPONENT
// ============================================================================

/**
 * Professional Distribution Slider Component
 * 
 * @class DistributionSlider
 * @example
 * const slider = new DistributionSlider({
 *   containerId: 'my-container',
 *   min: 0,
 *   max: 100,
 *   default: 50,
 *   distributionType: 'normal',
 *   onChange: (value) => console.log('New value:', value)
 * });
 */
class DistributionSlider {
    /**
     * Create a distribution slider
     * @param {Object} config - Configuration object
     * @param {string} config.containerId - DOM container ID
     * @param {string} [config.sliderId] - Unique slider ID (auto-generated if not provided)
     * @param {number} config.min - Minimum value
     * @param {number} config.max - Maximum value
     * @param {number} config.default - Default value
     * @param {number} [config.step=0.1] - Step size for value snapping
     * @param {Function} [config.format] - Value formatting function
     * @param {string} [config.distributionType='normal'] - Distribution type ('normal', 'beta', 'lognormal')
     * @param {Object} [config.distributionParams] - Custom distribution parameters
     * @param {Function} [config.onChange] - Change callback function
     * @param {Function} [config.onUpdate] - Update callback function (called during drag)
     * @param {boolean} [config.showStats=true] - Show statistics display
     * @param {boolean} [config.showConfidenceInterval=true] - Show confidence interval
     * @param {string} [config.theme='default'] - Color theme
     */
    constructor(config) {
        this.config = this.validateAndNormalizeConfig(config);
        this.currentValue = this.config.default;
        this.distribution = null;
        this.svg = null;
        this.scales = {};
        this.elements = {};
        this.isInitialized = false;
        this.renderAttempts = 0;
        this.maxRenderAttempts = 5;
        
        // Check if container exists and has dimensions
        const container = document.getElementById(this.config.containerId);
        if (container) {
            console.log(`✅ Container ${this.config.containerId} found`);
            
            // Ensure container has minimum dimensions and is visible
            const rect = container.getBoundingClientRect();
            console.log(`📐 Container ${this.config.containerId} initial dimensions: ${rect.width}x${rect.height}`);
            
            if (rect.width === 0) {
                container.style.display = 'block';
                container.style.width = '100%';
                container.style.minWidth = '400px';
                console.log(`🔧 Set container ${this.config.containerId} width to 100%`);
            }
            if (rect.height === 0) {
                container.style.height = `${this.config.height}px`;
                container.style.minHeight = `${this.config.height}px`;
                console.log(`🔧 Set container ${this.config.containerId} height to ${this.config.height}px`);
            }
            
            // Ensure container is visible
            if (container.style.display === 'none') {
                container.style.display = 'block';
                console.log(`👁️ Made container ${this.config.containerId} visible`);
            }
        } else {
            console.error(`❌ Container ${this.config.containerId} not found!`);
            // Don't throw here, we'll try to render later
        }
        
        this.createDistribution();
        this.tryRender();
    }
    
    /**
     * Validate and normalize configuration
     * @param {Object} config - Raw configuration
     * @returns {Object} Normalized configuration
     * @private
     */
    validateAndNormalizeConfig(config) {
        // Required fields
        const required = ['containerId', 'min', 'max', 'default'];
        for (const field of required) {
            if (config[field] === undefined) {
                throw new Error(`Required config field missing: ${field}`);
            }
        }
        
        // Validation
        if (config.min >= config.max) {
            throw new Error('min must be less than max');
        }
        
        if (config.default < config.min || config.default > config.max) {
            throw new Error('default must be between min and max');
        }
        
        // Normalize with defaults
        return {
            containerId: config.containerId,
            sliderId: config.sliderId || `slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            min: config.min,
            max: config.max,
            default: config.default,
            step: config.step || Math.abs(config.max - config.min) / 1000,
            format: config.format || ((v) => v.toFixed(2)),
            distributionType: config.distributionType || 'normal',
            distributionParams: config.distributionParams || {},
            onChange: config.onChange || (() => {}),
            onUpdate: config.onUpdate || (() => {}),
            showStats: config.showStats !== false,
            showConfidenceInterval: config.showConfidenceInterval !== false,
            theme: config.theme || 'default',
            width: config.width || null,
            height: config.height || 80
        };
    }
    
    /**
     * Create distribution based on current value and type
     * @private
     */
    createDistribution() {
        const value = this.currentValue;
        
        switch (this.config.distributionType) {
            case 'normal':
                const std = (this.config.max - this.config.min) * 0.15;
                this.distribution = new NormalDistribution(value, std);
                break;
                
            case 'beta':
                const normalizedValue = (value - this.config.min) / (this.config.max - this.config.min);
                const concentration = this.config.distributionParams.concentration || 10;
                const alpha = normalizedValue * concentration + 1;
                const beta = (1 - normalizedValue) * concentration + 1;
                this.distribution = new BetaDistribution(alpha, beta, this.config.min, this.config.max);
                break;
                
            case 'lognormal':
                const mu = Math.log(Math.max(0.1, value));
                const sigma = this.config.distributionParams.sigma || 0.3;
                this.distribution = new LogNormalDistribution(mu, sigma, 1);
                break;
                
            default:
                throw new Error(`Unknown distribution type: ${this.config.distributionType}`);
        }
    }
    
    /**
     * Generate distribution data points for visualization
     * @param {number} [numPoints=200] - Number of points to generate
     * @returns {Array} Array of {x, y} points
     * @private
     */
    generateDistributionData(numPoints = 200) {
        const points = [];
        const { min, max } = this.config;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = min + (max - min) * (i / numPoints);
            const y = this.distribution.pdf(x);
            points.push({ x, y });
        }
        
        // Normalize to [0, 1] for display
        const maxY = Math.max(...points.map(p => p.y));
        if (maxY > 0) {
            return points.map(p => ({ x: p.x, y: p.y / maxY }));
        }
        return points;
    }
    
    /**
     * Try to render with retries if container isn't ready
     * @private
     */
    tryRender() {
        try {
            this.render();
            this.isInitialized = true;
            console.log(`✅ Distribution slider ${this.config.sliderId} rendered successfully`);
        } catch (error) {
            this.renderAttempts++;
            console.warn(`⚠️ Render attempt ${this.renderAttempts}/${this.maxRenderAttempts} failed for ${this.config.containerId}:`, error.message);
            
            if (this.renderAttempts < this.maxRenderAttempts) {
                // Try again after a short delay
                setTimeout(() => {
                    console.log(`🔄 Retrying render for ${this.config.containerId}...`);
                    this.tryRender();
                }, 500 * this.renderAttempts); // Increasing delay
            } else {
                console.error(`❌ Failed to render ${this.config.containerId} after ${this.maxRenderAttempts} attempts`);
                // Create a placeholder
                this.createPlaceholder();
            }
        }
    }
    
    /**
     * Create a placeholder when rendering fails
     * @private
     */
    createPlaceholder() {
        const container = document.getElementById(this.config.containerId);
        if (container) {
            container.innerHTML = `
                <div style="
                    padding: 20px; 
                    text-align: center; 
                    color: #666; 
                    border: 2px dashed #ccc; 
                    border-radius: 8px;
                    background: #f9f9f9;
                ">
                    <div style="font-weight: bold; margin-bottom: 10px;">Distribution Slider</div>
                    <div style="font-size: 14px;">${this.config.sliderId}</div>
                    <div style="font-size: 12px; margin-top: 10px;">
                        Value: <span style="font-weight: bold;">${this.config.format(this.currentValue)}</span>
                    </div>
                    <div style="font-size: 11px; color: #999; margin-top: 5px;">
                        Fallback mode - interactive features unavailable
                    </div>
                </div>
            `;
            this.isInitialized = true;
            console.log(`📋 Created placeholder for ${this.config.containerId}`);
        }
    }
    
    /**
     * Render the complete slider
     * @public
     */
    render() {
        console.log(`🎨 Starting render for ${this.config.containerId}...`);
        
        const container = d3.select(`#${this.config.containerId}`);
        if (container.empty()) {
            const error = `Container with ID '${this.config.containerId}' not found`;
            console.error(`❌ ${error}`);
            throw new Error(error);
        }
        
        const containerNode = container.node();
        if (!containerNode) {
            const error = `Container node is null for '${this.config.containerId}'`;
            console.error(`❌ ${error}`);
            throw new Error(error);
        }
        
        // Ensure container is visible and has dimensions
        const containerRect = containerNode.getBoundingClientRect();
        console.log(`📐 Container ${this.config.containerId} render dimensions: ${containerRect.width}x${containerRect.height}`);
        
        if (containerRect.width === 0) {
            console.log(`🔧 Container has zero width, setting display and width...`);
            containerNode.style.display = 'block';
            containerNode.style.width = '100%';
            containerNode.style.minWidth = '400px';
            
            // Re-check dimensions after style changes
            const newRect = containerNode.getBoundingClientRect();
            console.log(`📐 Container ${this.config.containerId} after width fix: ${newRect.width}x${newRect.height}`);
        }
        
        const margin = { top: 10, right: 10, bottom: 20, left: 10 };
        let width;
        
        // Use explicit width from config if provided (for slider synchronization)
        if (this.config.width && this.config.width > 0) {
            width = this.config.width;
            console.log(`📏 Using configured width: ${width}px`);
        } else {
            // Fallback to container width
            width = containerRect.width - margin.left - margin.right;
            if (width <= 0) {
                width = 400; // Default width
                console.log(`⚠️ Using fallback width: ${width}px`);
            } else {
                console.log(`📏 Using container width: ${width}px`);
            }
        }
        
        const height = this.config.height;
        console.log(`📏 Render dimensions: ${width}x${height}`);
        
        try {
            // Clear existing content
            container.selectAll("*").remove();
            console.log(`🧹 Cleared existing content from ${this.config.containerId}`);
            
            // Create SVG
            this.svg = container
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
            console.log(`📊 Created SVG: ${width + margin.left + margin.right}x${height + margin.top + margin.bottom}`);
            
            const g = this.svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            
            // Create scales
            this.scales.x = d3.scaleLinear()
                .domain([this.config.min, this.config.max])
                .range([0, width]);
            
            this.scales.y = d3.scaleLinear()
                .domain([0, 1])
                .range([height - 15, 5]);
            
            console.log(`📊 Created scales: x[${this.config.min}, ${this.config.max}] -> [0, ${width}]`);
            
            // Store dimensions
            this.dimensions = { width, height, margin };
            
            // Render components
            console.log(`🎨 Rendering distribution...`);
            this.renderDistribution(g);
            
            console.log(`🎨 Rendering slider...`);
            this.renderSlider(g);
            
            console.log(`🎨 Rendering axis...`);
            this.renderAxis(g);
            
            // Render stats if enabled
            if (this.config.showStats) {
                console.log(`🎨 Rendering stats...`);
                this.renderStatsDisplay();
            }
            
            console.log(`✅ Render complete for ${this.config.containerId}`);
            
        } catch (error) {
            console.error(`❌ Error during render for ${this.config.containerId}:`, error);
            throw error;
        }
    }
    
    /**
     * Render distribution visualization
     * @param {Object} g - D3 group element
     * @private
     */
    renderDistribution(g) {
        const data = this.generateDistributionData();
        const stats = this.distribution.getStats();
        
        const line = d3.line()
            .x(d => this.scales.x(d.x))
            .y(d => this.scales.y(d.y))
            .curve(d3.curveCardinal);
        
        const area = d3.area()
            .x(d => this.scales.x(d.x))
            .y0(this.scales.y(0))
            .y1(d => this.scales.y(d.y))
            .curve(d3.curveCardinal);
        
        // Remove existing distribution elements
        g.selectAll('.distribution-fill, .distribution-path, .confidence-interval, .median-line').remove();
        
        // Draw distribution fill
        g.append("path")
            .datum(data)
            .attr("class", "distribution-fill")
            .attr("d", area)
            .style("fill", this.getThemeColor('fill'))
            .style("opacity", 0.2);
        
        // Draw distribution line
        g.append("path")
            .datum(data)
            .attr("class", "distribution-path")
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", this.getThemeColor('stroke'))
            .style("stroke-width", 3)
            .style("opacity", 0.8);
        
        // Draw confidence interval if enabled
        if (this.config.showConfidenceInterval) {
            const ci = stats.ci95;
            g.append("line")
                .attr("class", "confidence-interval")
                .attr("x1", this.scales.x(ci[0]))
                .attr("x2", this.scales.x(ci[1]))
                .attr("y1", this.scales.y(0.05))
                .attr("y2", this.scales.y(0.05))
                .style("stroke", this.getThemeColor('stroke'))
                .style("stroke-dasharray", "3,3")
                .style("stroke-width", 2)
                .style("opacity", 0.6);
            
            // Draw median line
            g.append("line")
                .attr("class", "median-line")
                .attr("x1", this.scales.x(stats.median))
                .attr("x2", this.scales.x(stats.median))
                .attr("y1", this.scales.y(0))
                .attr("y2", this.scales.y(0.8))
                .style("stroke", this.getThemeColor('accent'))
                .style("stroke-width", 2)
                .style("opacity", 0.8);
        }
    }
    
    /**
     * Render slider track and handle
     * @param {Object} g - D3 group element
     * @private
     */
    renderSlider(g) {
        const { width, height } = this.dimensions;
        
        // Draw slider track
        const track = g.append("line")
            .attr("class", "slider-track")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", height - 10)
            .attr("y2", height - 10)
            .style("stroke", "#cbd5e1")
            .style("stroke-width", 4)
            .style("stroke-linecap", "round");
        
        // Create slider handle group
        this.elements.handleGroup = g.append("g")
            .attr("class", "slider-handle")
            .attr("transform", `translate(${this.scales.x(this.currentValue)}, ${height - 10})`)
            .style("cursor", "pointer");
        
        // Handle circle
        this.elements.handleGroup.append("circle")
            .attr("r", 8)
            .attr("cy", 0)
            .style("fill", this.getThemeColor('handle'))
            .style("stroke", "white")
            .style("stroke-width", 3)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        
        // Handle label
        this.elements.handleGroup.append("text")
            .attr("class", "handle-label")
            .attr("y", 3)
            .style("font-size", "10px")
            .style("font-weight", "600")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("pointer-events", "none")
            .text(this.config.format(this.currentValue));
        
        // Add interaction
        this.addInteraction(track);
    }
    
    /**
     * Render axis
     * @param {Object} g - D3 group element
     * @private
     */
    renderAxis(g) {
        const { width, height } = this.dimensions;
        
        const xAxis = d3.axisBottom(this.scales.x)
            .ticks(6)
            .tickFormat(this.config.format);
        
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "10px")
            .style("fill", "#64748b");
    }
    
    /**
     * Render statistics display
     * @private
     */
    renderStatsDisplay() {
        const container = d3.select(`#${this.config.containerId}`);
        const stats = this.distribution.getStats();
        
        // Remove existing stats
        container.select('.stats-display').remove();
        
        const statsDiv = container
            .append("div")
            .attr("class", "stats-display")
            .style("background", "#f8fafc")
            .style("border", "1px solid #e2e8f0")
            .style("border-radius", "8px")
            .style("padding", "12px")
            .style("margin-top", "12px")
            .style("font-size", "12px")
            .style("color", "#64748b")
            .style("font-family", "'SF Mono', Monaco, monospace");
        
        const statsHtml = `
            Mean: ${this.config.format(stats.mean)} | 
            Median: ${this.config.format(stats.median)} | 
            95% CI: [${this.config.format(stats.ci95[0])}, ${this.config.format(stats.ci95[1])}]
        `;
        
        statsDiv.html(statsHtml);
    }
    
    /**
     * Add interaction handlers
     * @param {Object} track - D3 track element
     * @private
     */
    addInteraction(track) {
        const self = this;
        
        // Click on track to move handle
        track.on("click", function(event) {
            event.stopPropagation();
            
            const [mouseX] = d3.pointer(event, this);
            const clampedX = Math.max(0, Math.min(self.dimensions.width, mouseX));
            const newValue = self.scales.x.invert(clampedX);
            
            if (isFinite(newValue) && !isNaN(newValue)) {
                const snappedValue = Math.round(newValue / self.config.step) * self.config.step;
                const clampedValue = Math.max(self.config.min, Math.min(self.config.max, snappedValue));
                self.updateValue(clampedValue, true);
            }
        });
        
        // Drag behavior
        let isDragging = false;
        
        const drag = d3.drag()
            .on("start", function(event) {
                isDragging = true;
                event.sourceEvent.stopPropagation();
            })
            .on("drag", function(event) {
                if (!isDragging) return;
                
                try {
                    const newX = Math.max(0, Math.min(self.dimensions.width, event.x));
                    const newValue = self.scales.x.invert(newX);
                    
                    if (isFinite(newValue) && !isNaN(newValue)) {
                        const snappedValue = Math.round(newValue / self.config.step) * self.config.step;
                        const clampedValue = Math.max(self.config.min, Math.min(self.config.max, snappedValue));
                        self.updateValue(clampedValue, false);
                    }
                } catch (error) {
                    console.warn('Drag error:', error);
                }
            })
            .on("end", function(event) {
                isDragging = false;
                if (event.sourceEvent) {
                    event.sourceEvent.stopPropagation();
                }
                // Trigger final onChange
                self.config.onChange(self.currentValue, self.getOutput());
            });
        
        this.elements.handleGroup.call(drag);
    }
    
    /**
     * Update slider value
     * @param {number} newValue - New value
     * @param {boolean} [triggerChange=false] - Whether to trigger onChange callback
     * @private
     */
    updateValue(newValue, triggerChange = false) {
        const clampedValue = Math.max(this.config.min, Math.min(this.config.max, newValue));
        const oldValue = this.currentValue;
        this.currentValue = clampedValue;
        
        // Update handle position and label
        if (this.elements.handleGroup) {
            this.elements.handleGroup
                .attr("transform", `translate(${this.scales.x(clampedValue)}, ${this.dimensions.height - 10})`);
            
            this.elements.handleGroup.select("text")
                .text(this.config.format(clampedValue));
        }
        
        // Recreate distribution and update visualization
        this.createDistribution();
        if (this.svg) {
            this.renderDistribution(this.svg.select('g'));
        }
        
        // Update stats display
        if (this.config.showStats) {
            this.renderStatsDisplay();
        }
        
        // Trigger callbacks
        if (triggerChange) {
            this.config.onChange(clampedValue, this.getOutput());
        } else {
            this.config.onUpdate(clampedValue, this.getOutput());
        }
    }
    
    /**
     * Get theme color
     * @param {string} type - Color type ('fill', 'stroke', 'handle', 'accent')
     * @returns {string} Color value
     * @private
     */
    getThemeColor(type) {
        const themes = {
            default: {
                fill: '#3b82f6',
                stroke: '#3b82f6',
                handle: '#3b82f6',
                accent: '#1d4ed8'
            },
            red: {
                fill: '#ef4444',
                stroke: '#ef4444',
                handle: '#ef4444',
                accent: '#dc2626'
            },
            purple: {
                fill: '#8b5cf6',
                stroke: '#8b5cf6',
                handle: '#8b5cf6',
                accent: '#7c3aed'
            },
            cyan: {
                fill: '#06b6d4',
                stroke: '#06b6d4',
                handle: '#06b6d4',
                accent: '#0891b2'
            }
        };
        
        return themes[this.config.theme]?.[type] || themes.default[type];
    }
    
    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================
    
    /**
     * Get current value
     * @returns {number} Current slider value
     * @public
     */
    getValue() {
        return this.currentValue;
    }
    
    /**
     * Set value programmatically
     * @param {number} value - New value
     * @param {boolean} [triggerChange=true] - Whether to trigger onChange callback
     * @public
     */
    setValue(value, triggerChange = true) {
        this.updateValue(value, triggerChange);
    }
    
    /**
     * Reset to default value
     * @public
     */
    reset() {
        this.setValue(this.config.default);
    }
    
    /**
     * Get distribution statistics
     * @returns {Object} Statistics object
     * @public
     */
    getStats() {
        return this.distribution.getStats();
    }
    
    /**
     * Get complete output data
     * @returns {Object} Complete slider state and statistics
     * @public
     */
    getOutput() {
        return {
            id: this.config.sliderId,
            value: this.currentValue,
            formattedValue: this.config.format(this.currentValue),
            stats: this.getStats(),
            config: {
                min: this.config.min,
                max: this.config.max,
                distributionType: this.config.distributionType
            }
        };
    }
    
    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     * @public
     */
    updateConfig(newConfig) {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...newConfig };
        
        // Re-validate critical parameters
        if (this.config.min >= this.config.max) {
            this.config = oldConfig;
            throw new Error('min must be less than max');
        }
        
        // Clamp current value to new range
        this.currentValue = Math.max(this.config.min, Math.min(this.config.max, this.currentValue));
        
        // Re-render if needed
        if (newConfig.distributionType || newConfig.min || newConfig.max || newConfig.theme) {
            this.createDistribution();
            this.render();
        }
    }
    
    /**
     * Destroy slider and clean up
     * @public
     */
    destroy() {
        const container = d3.select(`#${this.config.containerId}`);
        container.selectAll("*").remove();
        
        // Clear references
        this.svg = null;
        this.scales = {};
        this.elements = {};
        this.distribution = null;
    }
    
    /**
     * Get library version
     * @returns {string} Version string
     * @static
     */
    static getVersion() {
        return '1.0.0';
    }
}

// ============================================================================
// SLIDER MANAGER
// ============================================================================

/**
 * Distribution Slider Manager
 * Manages multiple sliders and provides batch operations
 */
class DistributionSliderManager {
    constructor() {
        this.sliders = new Map();
    }
    
    /**
     * Create and register a new slider
     * @param {Object} config - Slider configuration
     * @returns {DistributionSlider} Created slider instance
     */
    create(config) {
        const slider = new DistributionSlider(config);
        this.sliders.set(slider.config.sliderId, slider);
        return slider;
    }
    
    /**
     * Get slider by ID
     * @param {string} id - Slider ID
     * @returns {DistributionSlider|null} Slider instance or null
     */
    get(id) {
        return this.sliders.get(id) || null;
    }
    
    /**
     * Remove slider by ID
     * @param {string} id - Slider ID
     * @returns {boolean} True if removed, false if not found
     */
    remove(id) {
        const slider = this.sliders.get(id);
        if (slider) {
            slider.destroy();
            return this.sliders.delete(id);
        }
        return false;
    }
    
    /**
     * Get all slider values
     * @returns {Object} Object with slider IDs as keys and values as values
     */
    getAllValues() {
        const values = {};
        for (const [id, slider] of this.sliders) {
            values[id] = slider.getValue();
        }
        return values;
    }
    
    /**
     * Set multiple slider values
     * @param {Object} values - Object with slider IDs as keys and values as values
     */
    setAllValues(values) {
        for (const [id, value] of Object.entries(values)) {
            const slider = this.sliders.get(id);
            if (slider) {
                slider.setValue(value);
            }
        }
    }
    
    /**
     * Reset all sliders to default values
     */
    resetAll() {
        for (const slider of this.sliders.values()) {
            slider.reset();
        }
    }
    
    /**
     * Get complete output from all sliders
     * @returns {Object} Complete state of all sliders
     */
    getAllOutput() {
        const output = {};
        for (const [id, slider] of this.sliders) {
            output[id] = slider.getOutput();
        }
        return output;
    }
    
    /**
     * Destroy all sliders
     */
    destroyAll() {
        for (const slider of this.sliders.values()) {
            slider.destroy();
        }
        this.sliders.clear();
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DistributionSlider,
        DistributionSliderManager,
        NormalDistribution,
        BetaDistribution,
        LogNormalDistribution,
        MathUtils
    };
}

// Export for browser global
if (typeof window !== 'undefined') {
    window.DistributionSlider = DistributionSlider;
    window.DistributionSliderManager = DistributionSliderManager;
    window.NormalDistribution = NormalDistribution;
    window.BetaDistribution = BetaDistribution;
    window.LogNormalDistribution = LogNormalDistribution;
    window.MathUtils = MathUtils;
    window.DistributionSliderLibrary = {
        DistributionSlider,
        DistributionSliderManager,
        NormalDistribution,
        BetaDistribution,
        LogNormalDistribution,
        MathUtils
    };
    
    console.log('✅ Distribution slider library exported to global scope');
    console.log('📊 Available classes:', {
        DistributionSlider: !!window.DistributionSlider,
        DistributionSliderManager: !!window.DistributionSliderManager,
        NormalDistribution: !!window.NormalDistribution,
        BetaDistribution: !!window.BetaDistribution,
        LogNormalDistribution: !!window.LogNormalDistribution,
        MathUtils: !!window.MathUtils
    });
} 