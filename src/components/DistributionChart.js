/**
 * DistributionChart Component
 * Renders beautiful smooth uncertainty distributions using D3.js
 * Shows research-backed parameter uncertainty with elegant curves
 */
export class DistributionChart {
    constructor(container, parameter) {
        this.container = container;
        this.parameter = parameter;
        this.currentValue = 0;
        this.svg = null;
        this.scales = {};
        this.dimensions = {};
        
        // Distribution configurations for each parameter
        this.distributions = {
            vsl: { type: 'normal', range: { min: 7.2, max: 14.0 }, mean: 13.7, std: 1.5 },
            suicides: { type: 'skewed', range: { min: 89000, max: 300000 }, mean: 110000, std: 35000 },
            attribution: { type: 'normal', range: { min: 5, max: 30 }, mean: 18, std: 4 },
            depression: { type: 'skewed', range: { min: 3000000, max: 15000000 }, mean: 5000000, std: 2000000 },
            yld: { type: 'normal', range: { min: 4.8, max: 8.2 }, mean: 6.0, std: 0.8 },
            qol: { type: 'normal', range: { min: 31, max: 47 }, mean: 35, std: 4 },
            healthcare: { type: 'skewed', range: { min: 6500, max: 20000 }, mean: 7000, std: 2500 },
            productivity: { type: 'skewed', range: { min: 4800, max: 10000 }, mean: 6000, std: 1500 },
            duration: { type: 'normal', range: { min: 3.0, max: 8.5 }, mean: 4.5, std: 1.2 }
        };
        
        // Color schemes by parameter group
        this.colorSchemes = {
            mortality: { stroke: '#dc2626', fill: 'rgba(220, 38, 38, 0.1)' },
            'mental-health': { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.1)' },
            healthcare: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)' }
        };
    }
    
    async initialize(value) {
        this.currentValue = value;
        this.setupDimensions();
        this.createSVG();
        this.setupScales();
        this.render();
        console.log(`✅ Distribution chart initialized for ${this.parameter}`);
    }
    
    setupDimensions() {
        const containerRect = this.container.getBoundingClientRect();
        this.dimensions = {
            width: Math.max(280, containerRect.width || 300),
            height: 95,
            margin: { top: 10, right: 15, bottom: 25, left: 15 }
        };
        
        this.dimensions.innerWidth = this.dimensions.width - this.dimensions.margin.left - this.dimensions.margin.right;
        this.dimensions.innerHeight = this.dimensions.height - this.dimensions.margin.top - this.dimensions.margin.bottom;
    }
    
    createSVG() {
        // Clear existing content
        d3.select(this.container).selectAll('*').remove();
        
        this.svg = d3.select(this.container)
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .style('background', 'transparent');
            
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.dimensions.margin.left}, ${this.dimensions.margin.top})`);
    }
    
    setupScales() {
        const dist = this.distributions[this.parameter];
        
        this.scales.x = d3.scaleLinear()
            .domain([dist.range.min, dist.range.max])
            .range([0, this.dimensions.innerWidth]);
            
        this.scales.y = d3.scaleLinear()
            .domain([0, 1])
            .range([this.dimensions.innerHeight, 0]);
    }
    
    generateDistributionData() {
        const dist = this.distributions[this.parameter];
        const points = [];
        const numPoints = 50;
        
        for (let i = 0; i <= numPoints; i++) {
            const x = dist.range.min + (dist.range.max - dist.range.min) * (i / numPoints);
            let y;
            
            if (dist.type === 'normal') {
                // Normal distribution
                const variance = dist.std * dist.std;
                const exponent = -0.5 * Math.pow((x - dist.mean) / dist.std, 2);
                y = Math.exp(exponent) / (dist.std * Math.sqrt(2 * Math.PI));
            } else {
                // Skewed distribution (log-normal-ish)
                const logX = Math.log(Math.max(x, 1));
                const logMean = Math.log(dist.mean);
                const logStd = 0.5;
                const variance = logStd * logStd;
                const exponent = -0.5 * Math.pow((logX - logMean) / logStd, 2);
                y = Math.exp(exponent) / (x * logStd * Math.sqrt(2 * Math.PI));
            }
            
            points.push({ x, y });
        }
        
        // Normalize to 0-1 range
        const maxY = Math.max(...points.map(p => p.y));
        return points.map(p => ({ x: p.x, y: p.y / maxY }));
    }
    
    render() {
        const data = this.generateDistributionData();
        const colorScheme = this.getColorScheme();
        
        // Create line and area generators
        const line = d3.line()
            .x(d => this.scales.x(d.x))
            .y(d => this.scales.y(d.y))
            .curve(d3.curveCardinal.tension(0.3));
            
        const area = d3.area()
            .x(d => this.scales.x(d.x))
            .y0(this.scales.y(0))
            .y1(d => this.scales.y(d.y))
            .curve(d3.curveCardinal.tension(0.3));
        
        // Clear existing paths
        this.chartGroup.selectAll('.distribution-fill, .distribution-path, .current-value-line').remove();
        
        // Draw filled area under curve
        this.chartGroup.append('path')
            .datum(data)
            .attr('class', 'distribution-fill')
            .attr('d', area)
            .style('fill', colorScheme.fill)
            .style('opacity', 0.6);
        
        // Draw curve line
        this.chartGroup.append('path')
            .datum(data)
            .attr('class', 'distribution-path')
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke', colorScheme.stroke)
            .style('stroke-width', 2.5)
            .style('opacity', 0.9);
        
        // Draw current value indicator
        this.drawCurrentValueIndicator();
        
        // Update statistics display
        this.updateStatsDisplay();
    }
    
    drawCurrentValueIndicator() {
        const colorScheme = this.getColorScheme();
        const dist = this.distributions[this.parameter];
        
        // Remove existing indicators
        this.chartGroup.selectAll('.current-value-line, .current-value-dot, .mean-line, .mean-dot').remove();
        
        // Always draw mean line (the actual research mean of the distribution)
        const meanX = this.scales.x(dist.mean);
        this.chartGroup.append('line')
            .attr('class', 'mean-line')
            .attr('x1', meanX)
            .attr('x2', meanX)
            .attr('y1', 0)
            .attr('y2', this.dimensions.innerHeight)
            .style('stroke', '#ef4444')
            .style('stroke-width', 2.5)
            .style('stroke-dasharray', '4,4')
            .style('opacity', 0.9);
        
        // Draw mean dot at the top
        this.chartGroup.append('circle')
            .attr('class', 'mean-dot')
            .attr('cx', meanX)
            .attr('cy', 3)
            .attr('r', 4)
            .style('fill', '#ef4444')
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);
        
        // Draw current value indicator only if it's significantly different from mean
        const threshold = (dist.range.max - dist.range.min) * 0.03; // 3% threshold
        if (Math.abs(this.currentValue - dist.mean) > threshold) {
            const currentX = this.scales.x(this.currentValue);
            this.chartGroup.append('line')
                .attr('class', 'current-value-line')
                .attr('x1', currentX)
                .attr('x2', currentX)
                .attr('y1', 0)
                .attr('y2', this.dimensions.innerHeight)
                .style('stroke', '#3b82f6')
                .style('stroke-width', 2)
                .style('stroke-dasharray', '2,2')
                .style('opacity', 0.7);
            
            this.chartGroup.append('circle')
                .attr('class', 'current-value-dot')
                .attr('cx', currentX)
                .attr('cy', 3)
                .attr('r', 3)
                .style('fill', '#3b82f6')
                .style('stroke', '#ffffff')
                .style('stroke-width', 1.5);
        }
    }
    
    updateCurrentValue(value) {
        this.currentValue = value;
        this.drawCurrentValueIndicator();
        this.updateStatsDisplay();
    }
    
    updateStatsDisplay() {
        const dist = this.distributions[this.parameter];
        const statsElement = this.container.parentElement.querySelector('.distribution-stats');
        
        if (statsElement) {
            // Calculate confidence intervals (approximate)
            const ciLower = dist.mean - 1.96 * dist.std;
            const ciUpper = dist.mean + 1.96 * dist.std;
            
            const formatValue = (value) => {
                if (this.parameter === 'vsl') {
                    return `$${value.toFixed(1)}M`;
                } else if (this.parameter === 'suicides' || this.parameter === 'depression') {
                    if (value >= 1000000) {
                        return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                        return `${Math.round(value / 1000)}K`;
                    }
                    return Math.round(value).toLocaleString();
                } else if (this.parameter === 'attribution' || this.parameter === 'qol') {
                    return `${Math.round(value)}%`;
                } else if (this.parameter === 'healthcare' || this.parameter === 'productivity') {
                    return `$${(value / 1000).toFixed(1)}K`;
                } else {
                    return `${value.toFixed(1)}yr`;
                }
            };
            
            const statsText = `Mean: ${formatValue(dist.mean)} | 95% CI: [${formatValue(Math.max(dist.range.min, ciLower))}, ${formatValue(Math.min(dist.range.max, ciUpper))}]`;
            statsElement.textContent = statsText;
        }
    }
    
    getColorScheme() {
        // Determine parameter group based on container's parent
        const parameterGroup = this.container.closest('.parameter-group');
        if (parameterGroup) {
            const group = parameterGroup.getAttribute('data-group');
            if (this.colorSchemes[group]) {
                return this.colorSchemes[group];
            }
        }
        
        // Default color scheme
        return { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)' };
    }
    
    // Handle window resize
    handleResize() {
        this.setupDimensions();
        this.createSVG();
        this.setupScales();
        this.render();
    }
} 