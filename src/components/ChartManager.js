/**
 * ChartManager Component
 * Manages Chart.js charts for results visualization
 */
export class ChartManager {
    constructor() {
        this.charts = new Map();
    }
    
    async initialize() {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.initializeBreakdownChart();
            this.initializeTimelineChart();
        }
        console.log('✅ Chart manager initialized');
    }
    
    initializeBreakdownChart() {
        const canvas = document.getElementById('breakdown-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Mortality', 'Mental Health', 'Healthcare'],
                    datasets: [{
                        data: [271, 1900, 293],
                        backgroundColor: ['#ef4444', '#8b5cf6', '#10b981']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            this.charts.set('breakdown', chart);
        }
    }
    
    initializeTimelineChart() {
        const canvas = document.getElementById('timeline-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['2009', '2012', '2015', '2018', '2021', '2024'],
                    datasets: [{
                        label: 'Annual Cost (Billions)',
                        data: [0, 800, 1600, 2400, 2800, 3200],
                        borderColor: '#3b82f6',
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            this.charts.set('timeline', chart);
        }
    }
    
    updateCharts(results) {
        const breakdownChart = this.charts.get('breakdown');
        if (breakdownChart && results) {
            breakdownChart.data.datasets[0].data = [
                Math.round(results.mortality / 1e9),
                Math.round(results.mental / 1e9),
                Math.round(results.productivity / 1e9)
            ];
            breakdownChart.update();
        }
    }
    
    handleResize() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
} 