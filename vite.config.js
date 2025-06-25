import { defineConfig } from 'vite';
import { resolve } from 'path';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },

  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      
      // Optimize bundle splitting
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['chart.js', 'tippy.js', 'nouislider', 'anime.js'],
          
          // Core calculator functionality
          calculator: [
            'src/components/Calculator/Calculator.js',
            'src/components/Calculator/ParameterSliders.js',
            'src/components/Calculator/FormulaDisplay.js'
          ],
          
          // Chart visualizations
          charts: [
            'src/components/Charts/TimelineChart.js',
            'src/components/Charts/PieChart.js',
            'src/components/Charts/DistributionChart.js'
          ],
          
          // Research and citation system
          research: [
            'src/components/Research/CitationSystem.js',
            'src/components/Research/ResearchData.js',
            'src/components/Research/Tooltips.js'
          ],
          
          // UI components
          ui: [
            'src/components/UI/Header.js',
            'src/components/UI/HeroSection.js',
            'src/components/UI/Modal.js',
            'src/components/UI/ShareButtons.js'
          ]
        }
      }
    },
    
    // Performance optimizations
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // CSS processing
  css: {
    postcss: {
      plugins: [
        autoprefixer,
        cssnano({
          preset: 'default'
        })
      ]
    }
  },

  // Development optimizations
  optimizeDeps: {
    include: [
      'chart.js',
      'tippy.js', 
      'nouislider',
      'anime.js',
      'lodash'
    ]
  },

  // Plugin configuration
  plugins: [
    // Add plugins as needed
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  }
}); 