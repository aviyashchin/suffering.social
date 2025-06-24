/**
 * Lightweight Distribution Slider using Canvas instead of D3.js + SVG
 * Optimized for Windows performance
 */

class LightweightDistributionSlider {
    constructor(config) {
        this.config = this.validateConfig(config);
        this.currentValue = this.config.default;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        this.animationFrame = null;
        
        this.init();
    }

    validateConfig(config) {
        return {
            containerId: config.containerId,
            sliderId: config.sliderId || `slider-${Date.now()}`,
            min: config.min || 0,
            max: config.max || 100,
            default: config.default || 50,
            step: config.step || 0.1,
            format: config.format || ((v) => v.toString()),
            distributionType: config.distributionType || 'normal',
            onChange: config.onChange || (() => {}),
            onUpdate: config.onUpdate || (() => {}),
            width: config.width || 400,
            height: config.height || 80,
            theme: config.theme || 'default'
        };
    }

    init() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`Container ${this.config.containerId} not found`);
            return;
        }

        this.createCanvas(container);
        this.createSlider(container);
        this.render();
        this.isInitialized = true;
    }

    createCanvas(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = `${this.config.height}px`;
        this.canvas.style.display = 'block';
        this.canvas.style.border = '1px solid #e2e8f0';
        this.canvas.style.borderRadius = '4px';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Enable high DPI rendering
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        container.appendChild(this.canvas);
    }

    createSlider(container) {
        const sliderContainer = document.createElement('div');
        sliderContainer.style.marginTop = '8px';
        
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.min = this.config.min;
        this.slider.max = this.config.max;
        this.slider.step = this.config.step;
        this.slider.value = this.config.default;
        this.slider.style.width = '100%';
        this.slider.style.height = '4px';
        this.slider.style.background = '#e2e8f0';
        this.slider.style.outline = 'none';
        this.slider.style.borderRadius = '2px';
        
        // Add event listeners
        this.slider.addEventListener('input', (e) => {
            this.currentValue = parseFloat(e.target.value);
            this.render();
            this.config.onUpdate(this.currentValue);
        });
        
        this.slider.addEventListener('change', (e) => {
            this.currentValue = parseFloat(e.target.value);
            this.config.onChange(this.currentValue);
        });
        
        sliderContainer.appendChild(this.slider);
        container.appendChild(sliderContainer);
    }

    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set up drawing context
        const width = this.config.width;
        const height = this.config.height;
        const margin = 20;
        const chartWidth = width - 2 * margin;
        const chartHeight = height - 2 * margin;
        
        // Generate distribution curve data
        const points = this.generateDistributionPoints(chartWidth);
        
        // Draw distribution curve
        this.drawDistributionCurve(points, margin, chartHeight);
        
        // Draw current value indicator
        this.drawValueIndicator(margin, chartWidth, chartHeight);
        
        // Draw confidence interval
        this.drawConfidenceInterval(margin, chartWidth, chartHeight);
    }

    generateDistributionPoints(width) {
        const points = [];
        const numPoints = Math.min(width, 200); // Limit points for performance
        
        for (let i = 0; i <= numPoints; i++) {
            const x = (i / numPoints) * (this.config.max - this.config.min) + this.config.min;
            const y = this.calculateDistributionValue(x);
            points.push({ x: i * (width / numPoints), y });
        }
        
        return points;
    }

    calculateDistributionValue(x) {
        // Simple normal distribution approximation
        const mean = this.currentValue;
        const std = (this.config.max - this.config.min) / 6; // 99.7% within range
        
        const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
        const exponent = -0.5 * Math.pow((x - mean) / std, 2);
        
        return coefficient * Math.exp(exponent);
    }

    drawDistributionCurve(points, margin, chartHeight) {
        if (points.length === 0) return;
        
        // Find max value for scaling
        const maxY = Math.max(...points.map(p => p.y));
        
        // Draw curve
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.getThemeColor('curve');
        this.ctx.lineWidth = 2;
        
        points.forEach((point, index) => {
            const x = margin + point.x;
            const y = margin + chartHeight - (point.y / maxY) * chartHeight * 0.8;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Fill area under curve
        this.ctx.beginPath();
        this.ctx.fillStyle = this.getThemeColor('fill');
        
        points.forEach((point, index) => {
            const x = margin + point.x;
            const y = margin + chartHeight - (point.y / maxY) * chartHeight * 0.8;
            
            if (index === 0) {
                this.ctx.moveTo(x, margin + chartHeight);
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.lineTo(margin + points[points.length - 1].x, margin + chartHeight);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawValueIndicator(margin, chartWidth, chartHeight) {
        const valuePosition = ((this.currentValue - this.config.min) / (this.config.max - this.config.min)) * chartWidth;
        const x = margin + valuePosition;
        
        // Draw vertical line
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.getThemeColor('indicator');
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(x, margin);
        this.ctx.lineTo(x, margin + chartHeight);
        this.ctx.stroke();
        
        // Draw value label
        this.ctx.fillStyle = this.getThemeColor('text');
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.config.format(this.currentValue), x, margin - 5);
    }

    drawConfidenceInterval(margin, chartWidth, chartHeight) {
        // Simple 95% confidence interval
        const mean = this.currentValue;
        const std = (this.config.max - this.config.min) / 6;
        const ci95Low = Math.max(this.config.min, mean - 1.96 * std);
        const ci95High = Math.min(this.config.max, mean + 1.96 * std);
        
        const lowPos = ((ci95Low - this.config.min) / (this.config.max - this.config.min)) * chartWidth;
        const highPos = ((ci95High - this.config.min) / (this.config.max - this.config.min)) * chartWidth;
        
        // Draw confidence interval rectangle
        this.ctx.fillStyle = this.getThemeColor('confidence');
        this.ctx.fillRect(
            margin + lowPos,
            margin + chartHeight * 0.9,
            highPos - lowPos,
            chartHeight * 0.1
        );
        
        // Draw labels
        this.ctx.fillStyle = this.getThemeColor('text');
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('95% CI', margin, margin + chartHeight + 15);
    }

    getThemeColor(type) {
        const themes = {
            default: {
                curve: '#3b82f6',
                fill: 'rgba(59, 130, 246, 0.1)',
                indicator: '#ef4444',
                confidence: 'rgba(34, 197, 94, 0.3)',
                text: '#374151'
            }
        };
        
        return themes[this.config.theme]?.[type] || themes.default[type];
    }

    setValue(value, triggerChange = true) {
        this.currentValue = Math.max(this.config.min, Math.min(this.config.max, value));
        this.slider.value = this.currentValue;
        this.render();
        
        if (triggerChange) {
            this.config.onChange(this.currentValue);
        }
    }

    getValue() {
        return this.currentValue;
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        if (this.slider && this.slider.parentNode) {
            this.slider.parentNode.removeChild(this.slider);
        }
    }
}

/**
 * Lightweight Distribution Slider Manager
 */
class LightweightDistributionSliderManager {
    constructor() {
        this.sliders = new Map();
    }

    create(config) {
        const slider = new LightweightDistributionSlider(config);
        this.sliders.set(config.sliderId, slider);
        return slider;
    }

    get(id) {
        return this.sliders.get(id);
    }

    remove(id) {
        const slider = this.sliders.get(id);
        if (slider) {
            slider.destroy();
            this.sliders.delete(id);
        }
    }

    getAllValues() {
        const values = {};
        for (const [id, slider] of this.sliders) {
            values[id] = slider.getValue();
        }
        return values;
    }

    setAllValues(values) {
        for (const [id, value] of Object.entries(values)) {
            const slider = this.sliders.get(id);
            if (slider) {
                slider.setValue(value, false);
            }
        }
    }

    destroyAll() {
        for (const [id, slider] of this.sliders) {
            slider.destroy();
        }
        this.sliders.clear();
    }
}

// Export for global use
window.LightweightDistributionSlider = LightweightDistributionSlider;
window.LightweightDistributionSliderManager = LightweightDistributionSliderManager; 