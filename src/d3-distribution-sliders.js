/**
 * Professional D3.js Distribution Sliders for Social Media Calculator
 * 
 * Integrates mathematical distributions with calculator parameters
 * Following .cursorrules: readable, complete, modern implementation
 */

import { formatCurrency, formatSliderValue } from './utils/formatters.js';

// ============================================================================
// MATHEMATICAL DISTRIBUTION CLASSES (Accurate Implementations)
// ============================================================================

class MathUtils {
    // Gamma function using Lanczos approximation
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
    
    // Beta function
    static beta(a, b) {
        return this.gamma(a) * this.gamma(b) / this.gamma(a + b);
    }
    
    // Error function approximation
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

class NormalDistribution {
    constructor(mean, std) {
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

class BetaDistribution {
    constructor(alpha, beta, min = 0, max = 1) {
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

class LogNormalDistribution {
    constructor(mu, sigma, scale = 1) {
        this.mu = mu;
        this.sigma = sigma;
        this.scale = scale;
        
        if (sigma <= 0) throw new Error('Sigma must be positive');
        if (scale <= 0) throw new Error('Scale must be positive');
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
// D3.js DISTRIBUTION SLIDER COMPONENT
// ============================================================================

class DistributionSlider {
    constructor(config, calculator) {
        this.config = {
            containerId: config.containerId,
            sliderId: config.sliderId,
            min: config.min,
            max: config.max,
            default: config.default,
            step: config.step,
            format: config.format,
            distributionType: config.distributionType,
            parameter: config.parameter,
            ...config
        };
        
        this.calculator = calculator;
        this.currentValue = this.config.default;
        this.distribution = null;
        this.svg = null;
        this.scales = {};
        this.elements = {};
        
        this.validateConfig();
        this.createDistribution();
        this.render();
    }
    
    validateConfig() {
        const required = ['containerId', 'sliderId', 'min', 'max', 'default', 'format', 'parameter'];
        for (const field of required) {
            if (this.config[field] === undefined) {
                throw new Error(`Required config field missing: ${field}`);
            }
        }
        
        if (this.config.min >= this.config.max) {
            throw new Error('min must be less than max');
        }
        
        if (this.config.default < this.config.min || this.config.default > this.config.max) {
            throw new Error('default must be between min and max');
        }
    }
    
    createDistribution() {
        const value = this.currentValue;
        
        switch (this.config.distributionType) {
            case 'normal':
                const std = (this.config.max - this.config.min) * 0.15;
                this.distribution = new NormalDistribution(value, std);
                break;
                
            case 'beta':
                const normalizedValue = (value - this.config.min) / (this.config.max - this.config.min);
                const concentration = 10;
                const alpha = normalizedValue * concentration + 1;
                const beta = (1 - normalizedValue) * concentration + 1;
                this.distribution = new BetaDistribution(alpha, beta, this.config.min, this.config.max);
                break;
                
            case 'lognormal':
                const mu = Math.log(Math.max(0.1, value));
                const sigma = 0.3;
                this.distribution = new LogNormalDistribution(mu, sigma, 1);
                break;
                
            default:
                throw new Error(`Unknown distribution type: ${this.config.distributionType}`);
        }
    }
    
    generateDistributionData(numPoints = 200) {
        const points = [];
        const { min, max } = this.config;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = min + (max - min) * (i / numPoints);
            const y = this.distribution.pdf(x);
            points.push({ x, y });
        }
        
        const maxY = Math.max(...points.map(p => p.y));
        if (maxY > 0) {
            return points.map(p => ({ x: p.x, y: p.y / maxY }));
        }
        return points;
    }
    
    render() {
        const container = d3.select(`#${this.config.containerId}`);
        const containerRect = container.node().getBoundingClientRect();
        
        const margin = { top: 20, right: 20, bottom: 40, left: 20 };
        const width = containerRect.width - margin.left - margin.right;
        const height = 120;
        
        container.selectAll("*").remove();
        
        this.svg = container
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        
        const g = this.svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        this.scales.x = d3.scaleLinear()
            .domain([this.config.min, this.config.max])
            .range([0, width]);
        
        this.scales.y = d3.scaleLinear()
            .domain([0, 1])
            .range([height - 40, 20]);
        
        this.dimensions = { width, height, margin };
        
        this.renderDistribution(g);
        this.renderSlider(g);
        this.renderAxis(g);
        this.updateStatsDisplay();
    }
    
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
        
        g.selectAll('.distribution-fill, .distribution-path, .confidence-interval, .median-line').remove();
        
        // Get color scheme
        const colors = this.getColorScheme();
        
        g.append("path")
            .datum(data)
            .attr("class", "distribution-fill")
            .attr("d", area)
            .style("fill", colors.fill)
            .style("opacity", 0.3);
        
        g.append("path")
            .datum(data)
            .attr("class", "distribution-path")
            .attr("d", line)
            .style("stroke", colors.stroke)
            .style("stroke-width", 2)
            .style("fill", "none");
        
        // Confidence interval
        const ci = stats.ci95;
        g.append("line")
            .attr("class", "confidence-interval")
            .attr("x1", this.scales.x(ci[0]))
            .attr("x2", this.scales.x(ci[1]))
            .attr("y1", this.scales.y(0.1))
            .attr("y2", this.scales.y(0.1))
            .style("stroke", colors.stroke)
            .style("stroke-dasharray", "3,3")
            .style("stroke-width", 2);
        
        // Median line
        g.append("line")
            .attr("class", "median-line")
            .attr("x1", this.scales.x(stats.median))
            .attr("x2", this.scales.x(stats.median))
            .attr("y1", this.scales.y(0))
            .attr("y2", this.scales.y(0.8))
            .style("stroke", colors.stroke)
            .style("stroke-width", 2);
    }
    
    renderSlider(g) {
        const { width, height } = this.dimensions;
        const colors = this.getColorScheme();
        
        const track = g.append("line")
            .attr("class", "slider-track")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", height - 20)
            .attr("y2", height - 20)
            .style("stroke", "#cbd5e1")
            .style("stroke-width", 4)
            .style("stroke-linecap", "round");
        
        this.elements.handleGroup = g.append("g")
            .attr("class", "slider-handle")
            .attr("transform", `translate(${this.scales.x(this.currentValue)}, ${height - 20})`)
            .style("cursor", "pointer");
        
        this.elements.handleGroup.append("circle")
            .attr("r", 12)
            .attr("cy", 0)
            .style("fill", colors.stroke)
            .style("stroke", "white")
            .style("stroke-width", 3)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
        
        this.elements.handleGroup.append("text")
            .attr("class", "handle-label")
            .attr("y", 4)
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "10px")
            .style("font-weight", "600")
            .style("pointer-events", "none")
            .text(this.config.format(this.currentValue));
        
        this.addInteraction(track);
    }
    
    renderAxis(g) {
        const { width, height } = this.dimensions;
        
        const xAxis = d3.axisBottom(this.scales.x)
            .ticks(6)
            .tickFormat(this.config.format);
        
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#64748b");
    }
    
    getColorScheme() {
        const colorSchemes = {
            // Mortality parameters - Red theme
            vsl: { stroke: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' },
            suicides: { stroke: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' },
            attribution: { stroke: '#dc2626', fill: 'rgba(220, 38, 38, 0.2)' },
            
            // Mental health parameters - Purple theme
            depression: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
            yld: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
            qol: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)' },
            
            // Economic parameters - Green theme
            healthcare: { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.2)' },
            productivity: { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.2)' },
            duration: { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.2)' }
        };
        
        return colorSchemes[this.config.parameter] || { stroke: '#64748b', fill: 'rgba(100, 116, 139, 0.2)' };
    }
    
    addInteraction(track) {
        const self = this;
        
        track.on("click", function(event) {
            event.stopPropagation();
            
            const [mouseX] = d3.pointer(event, this);
            const clampedX = Math.max(0, Math.min(self.dimensions.width, mouseX));
            const newValue = self.scales.x.invert(clampedX);
            
            if (isFinite(newValue) && !isNaN(newValue)) {
                const snappedValue = Math.round(newValue / self.config.step) * self.config.step;
                const clampedValue = Math.max(self.config.min, Math.min(self.config.max, snappedValue));
                self.updateValue(clampedValue);
            }
        });
        
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
                        self.updateValue(clampedValue);
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
            });
        
        this.elements.handleGroup.call(drag);
    }
    
    updateValue(newValue) {
        const clampedValue = Math.max(this.config.min, Math.min(this.config.max, newValue));
        this.currentValue = clampedValue;
        
        // Update display text in parameter header
        const valueDisplay = document.getElementById(`${this.config.parameter}-value`);
        if (valueDisplay) {
            valueDisplay.textContent = formatSliderValue(this.config.parameter, clampedValue);
        }
        
        // Update handle position and label
        this.elements.handleGroup
            .attr("transform", `translate(${this.scales.x(clampedValue)}, ${this.dimensions.height - 20})`);
        
        this.elements.handleGroup.select("text")
            .text(this.config.format(clampedValue));
        
        // Recreate distribution and update visualization
        this.createDistribution();
        this.renderDistribution(this.svg.select('g'));
        this.updateStatsDisplay();
        
        // Update calculator parameters
        if (this.calculator) {
            this.calculator.updateParameter(this.config.parameter, clampedValue);
        }
    }
    
    updateStatsDisplay() {
        const stats = this.distribution.getStats();
        const statsHtml = `Mean: ${this.config.format(stats.mean)} | Median: ${this.config.format(stats.median)} | 95% CI: [${this.config.format(stats.ci95[0])}, ${this.config.format(stats.ci95[1])}]`;
        
        const statsElement = document.getElementById(`${this.config.parameter}-stats`);
        if (statsElement) {
            statsElement.textContent = statsHtml;
        }
    }
    
    reset() {
        this.updateValue(this.config.default);
    }
    
    getValue() {
        return this.currentValue;
    }
}

// ============================================================================
// SLIDER MANAGER FOR CALCULATOR INTEGRATION
// ============================================================================

export class D3SliderManager {
    constructor(calculator) {
        this.calculator = calculator;
        this.sliders = {};
        this.configs = this.getSliderConfigs();
    }
    
    getSliderConfigs() {
        return {
            vsl: {
                containerId: 'vsl-distribution',
                sliderId: 'vsl',
                parameter: 'vsl',
                min: 8,
                max: 20,
                default: 13.7,
                step: 0.1,
                format: (v) => `$${v.toFixed(1)}M`,
                distributionType: 'normal'
            },
            suicides: {
                containerId: 'suicides-distribution',
                sliderId: 'suicides',
                parameter: 'suicides',
                min: 100000,
                max: 300000,
                default: 110000,
                step: 1000,
                format: (v) => `${Math.round(v/1000)}K`,
                distributionType: 'lognormal'
            },
            attribution: {
                containerId: 'attribution-distribution',
                sliderId: 'attribution',
                parameter: 'attribution',
                min: 5,
                max: 30,
                default: 18,
                step: 1,
                format: (v) => `${v.toFixed(0)}%`,
                distributionType: 'beta'
            },
            depression: {
                containerId: 'depression-distribution',
                sliderId: 'depression',
                parameter: 'depression',
                min: 3000000,
                max: 15000000,
                default: 5000000,
                step: 100000,
                format: (v) => `${(v/1000000).toFixed(1)}M`,
                distributionType: 'lognormal'
            },
            yld: {
                containerId: 'yld-distribution',
                sliderId: 'yld',
                parameter: 'yld',
                min: 4,
                max: 8,
                default: 6,
                step: 0.1,
                format: (v) => `${v.toFixed(1)}yr`,
                distributionType: 'normal'
            },
            qol: {
                containerId: 'qol-distribution',
                sliderId: 'qol',
                parameter: 'qol',
                min: 30,
                max: 40,
                default: 35,
                step: 1,
                format: (v) => `${v.toFixed(0)}%`,
                distributionType: 'normal'
            },
            healthcare: {
                containerId: 'healthcare-distribution',
                sliderId: 'healthcare',
                parameter: 'healthcare',
                min: 6500,
                max: 20000,
                default: 7000,
                step: 100,
                format: (v) => `$${(v/1000).toFixed(0)}K`,
                distributionType: 'lognormal'
            },
            productivity: {
                containerId: 'productivity-distribution',
                sliderId: 'productivity',
                parameter: 'productivity',
                min: 6000,
                max: 10000,
                default: 6000,
                step: 100,
                format: (v) => `$${(v/1000).toFixed(0)}K`,
                distributionType: 'normal'
            },
            duration: {
                containerId: 'duration-distribution',
                sliderId: 'duration',
                parameter: 'duration',
                min: 3,
                max: 6,
                default: 4.5,
                step: 0.1,
                format: (v) => `${v.toFixed(1)}yr`,
                distributionType: 'normal'
            }
        };
    }
    
    initialize() {
        console.log('🎚️ Initializing D3 distribution sliders...');
        
        Object.keys(this.configs).forEach(key => {
            try {
                this.sliders[key] = new DistributionSlider(this.configs[key], this.calculator);
                console.log(`✅ Created slider: ${key}`);
            } catch (error) {
                console.error(`❌ Failed to create slider ${key}:`, error);
            }
        });
        
        console.log('🎯 D3 sliders initialized successfully');
    }
    
    updateSlider(parameter, value) {
        const slider = this.sliders[parameter];
        if (slider) {
            slider.updateValue(value);
        }
    }
    
    getSliderValue(parameter) {
        const slider = this.sliders[parameter];
        return slider ? slider.getValue() : null;
    }
    
    resetAll() {
        Object.values(this.sliders).forEach(slider => slider.reset());
    }
    
    // Handle window resize
    handleResize() {
        setTimeout(() => {
            Object.values(this.sliders).forEach(slider => {
                slider.render();
            });
        }, 100);
    }
}

export { NormalDistribution, BetaDistribution, LogNormalDistribution, DistributionSlider }; 