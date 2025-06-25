#!/usr/bin/env node

/**
 * HTML Extraction Script for Social Media Calculator Modularization
 * 
 * This script analyzes the massive HTML file and extracts components,
 * styles, and JavaScript into a proper modular architecture.
 */

import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';

const INPUT_FILE = 'social_media_cost_calculatorv4.html';
const OUTPUT_DIR = 'src';

class HTMLExtractor {
  constructor() {
    this.dom = null;
    this.document = null;
    this.extractedComponents = new Map();
    this.extractedStyles = new Map();
    this.extractedScripts = new Map();
  }

  async initialize() {
    console.log('🚀 Starting HTML extraction process...');
    
    try {
      const htmlContent = await fs.readFile(INPUT_FILE, 'utf-8');
      this.dom = new JSDOM(htmlContent);
      this.document = this.dom.window.document;
      
      console.log(`📊 Analyzing ${htmlContent.length} characters of HTML...`);
      console.log(`📋 Found ${this.document.querySelectorAll('*').length} DOM elements`);
      
    } catch (error) {
      console.error('❌ Failed to load HTML file:', error.message);
      process.exit(1);
    }
  }

  /**
   * Extract and analyze CSS styles from <style> tags
   */
  async extractStyles() {
    console.log('\n🎨 Extracting CSS styles...');
    
    const styleTags = this.document.querySelectorAll('style');
    let totalCSSLines = 0;
    
    for (let i = 0; i < styleTags.length; i++) {
      const styleTag = styleTags[i];
      const cssContent = styleTag.textContent;
      const lines = cssContent.split('\n').length;
      totalCSSLines += lines;
      
      console.log(`📄 Style block ${i + 1}: ${lines} lines`);
      
      // Analyze CSS classes and organize by component
      const componentMap = this.categorizeCSS(cssContent);
      
      for (const [component, css] of componentMap) {
        if (!this.extractedStyles.has(component)) {
          this.extractedStyles.set(component, []);
        }
        this.extractedStyles.get(component).push(css);
      }
    }
    
    console.log(`📊 Total CSS: ${totalCSSLines} lines across ${styleTags.length} style blocks`);
    return this.extractedStyles;
  }

  /**
   * Categorize CSS rules by component
   */
  categorizeCSS(cssContent) {
    const componentMap = new Map([
      ['main', []],
      ['header', []],
      ['calculator', []],
      ['charts', []],
      ['modal', []],
      ['mobile', []],
      ['animations', []]
    ]);

    // Define patterns to match CSS to components
    const patterns = {
      'header': [/header/, /nav/, /fixed-.*/, /top-/, /\.logo/],
      'calculator': [/calculator/, /parameter/, /slider/, /btn/, /scenario/],
      'charts': [/chart/, /canvas/, /svg/, /distribution/, /timeline/],
      'modal': [/modal/, /overlay/, /popup/, /tooltip/],
      'mobile': [/@media.*max-width/, /mobile/, /touch/],
      'animations': [/@keyframes/, /animation/, /transition/, /transform/]
    };

    const lines = cssContent.split('\n');
    let currentComponent = 'main';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('/*')) continue;

      // Check which component this CSS belongs to
      for (const [component, regexes] of Object.entries(patterns)) {
        if (regexes.some(regex => regex.test(trimmedLine))) {
          currentComponent = component;
          break;
        }
      }

      componentMap.get(currentComponent).push(line);
    }

    return componentMap;
  }

  /**
   * Extract JavaScript code from <script> tags
   */
  async extractJavaScript() {
    console.log('\n⚙️ Extracting JavaScript...');
    
    const scriptTags = this.document.querySelectorAll('script:not([src])');
    let totalJSLines = 0;
    
    for (let i = 0; i < scriptTags.length; i++) {
      const scriptTag = scriptTags[i];
      const jsContent = scriptTag.textContent;
      const lines = jsContent.split('\n').length;
      totalJSLines += lines;
      
      console.log(`📄 Script block ${i + 1}: ${lines} lines`);
      
      // Analyze JavaScript and organize by component
      const componentMap = this.categorizeJavaScript(jsContent);
      
      for (const [component, js] of componentMap) {
        if (!this.extractedScripts.has(component)) {
          this.extractedScripts.set(component, []);
        }
        this.extractedScripts.get(component).push(js);
      }
    }
    
    console.log(`📊 Total JavaScript: ${totalJSLines} lines across ${scriptTags.length} script blocks`);
    return this.extractedScripts;
  }

  /**
   * Categorize JavaScript code by component
   */
  categorizeJavaScript(jsContent) {
    const componentMap = new Map([
      ['utils', []],
      ['calculator', []],
      ['charts', []],
      ['ui', []],
      ['research', []],
      ['main', []]
    ]);

    // Define patterns to match JS to components
    const patterns = {
      'utils': [/class.*Utils/, /formatCurrency/, /debounce/, /throttle/],
      'calculator': [/class.*Calculator/, /calculate/, /parameter/, /slider/],
      'charts': [/Chart\.js/, /canvas/, /chart/, /timeline/, /pie/],
      'ui': [/modal/, /tooltip/, /header/, /animation/, /scroll/],
      'research': [/citation/, /research/, /tooltip.*research/]
    };

    const lines = jsContent.split('\n');
    let currentComponent = 'main';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//')) continue;

      // Check which component this JS belongs to
      for (const [component, regexes] of Object.entries(patterns)) {
        if (regexes.some(regex => regex.test(trimmedLine))) {
          currentComponent = component;
          break;
        }
      }

      componentMap.get(currentComponent).push(line);
    }

    return componentMap;
  }

  /**
   * Extract HTML components
   */
  async extractComponents() {
    console.log('\n🧩 Extracting HTML components...');
    
    // Define component selectors and their target files
    const componentSelectors = {
      'header': 'header, .header-fixed, .fixed-header',
      'hero': '#hero-section, .hero',
      'calculator': '#calculator-start, .calculator, .parameter-group',
      'charts': '.chart-container, canvas, .timeline-chart',
      'sidebar': '.sidebar, .results-panel',
      'modal': '.modal, .help-modal, .research-modal'
    };

    for (const [componentName, selector] of Object.entries(componentSelectors)) {
      try {
        const elements = this.document.querySelectorAll(selector);
        
        if (elements.length > 0) {
          console.log(`📦 Found ${elements.length} ${componentName} elements`);
          
          const componentHTML = Array.from(elements)
            .map(el => el.outerHTML)
            .join('\n');
            
          this.extractedComponents.set(componentName, componentHTML);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to extract ${componentName}:`, error.message);
      }
    }

    return this.extractedComponents;
  }

  /**
   * Create directory structure
   */
  async createDirectoryStructure() {
    console.log('\n📁 Creating directory structure...');
    
    const directories = [
      'src',
      'src/components',
      'src/components/Calculator', 
      'src/components/Charts',
      'src/components/UI',
      'src/components/Research',
      'src/utils',
      'src/styles',
      'src/assets',
      'src/assets/icons',
      'src/assets/images',
      'tests',
      'scripts'
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Created: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          console.warn(`⚠️ Failed to create ${dir}:`, error.message);
        }
      }
    }
  }

  /**
   * Save extracted files
   */
  async saveExtractedFiles() {
    console.log('\n💾 Saving extracted files...');

    // Save CSS files
    for (const [component, cssArray] of this.extractedStyles) {
      if (cssArray.length > 0) {
        const cssContent = cssArray.flat().join('\n');
        const filePath = `src/styles/${component}.css`;
        
        await fs.writeFile(filePath, cssContent);
        console.log(`✅ Saved: ${filePath} (${cssContent.split('\n').length} lines)`);
      }
    }

    // Save JavaScript files  
    for (const [component, jsArray] of this.extractedScripts) {
      if (jsArray.length > 0) {
        const jsContent = jsArray.flat().join('\n');
        const filePath = `src/components/${component.charAt(0).toUpperCase() + component.slice(1)}/${component}.js`;
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, jsContent);
        console.log(`✅ Saved: ${filePath} (${jsContent.split('\n').length} lines)`);
      }
    }

    // Save HTML components
    for (const [component, html] of this.extractedComponents) {
      if (html) {
        const filePath = `src/components/${component.charAt(0).toUpperCase() + component.slice(1)}/${component}.html`;
        
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, html);
        console.log(`✅ Saved: ${filePath}`);
      }
    }
  }

  /**
   * Generate analysis report
   */
  async generateReport() {
    console.log('\n📊 Generating extraction report...');

    const report = {
      timestamp: new Date().toISOString(),
      originalFile: INPUT_FILE,
      extraction: {
        components: Object.fromEntries(
          Array.from(this.extractedComponents.entries()).map(([key, value]) => [
            key, 
            value ? value.length : 0
          ])
        ),
        styles: Object.fromEntries(
          Array.from(this.extractedStyles.entries()).map(([key, value]) => [
            key,
            value.flat().join('\n').split('\n').length
          ])
        ),
        scripts: Object.fromEntries(
          Array.from(this.extractedScripts.entries()).map(([key, value]) => [
            key,
            value.flat().join('\n').split('\n').length  
          ])
        )
      },
      recommendations: [
        'Start with Calculator.js - it contains the core business logic',
        'Extract constants and utilities first for immediate reuse',
        'Break down large CSS files into component-specific stylesheets',
        'Add proper ES6 imports/exports to JavaScript modules',
        'Consider TypeScript for better development experience'
      ]
    };

    await fs.writeFile('extraction-report.json', JSON.stringify(report, null, 2));
    console.log('✅ Saved: extraction-report.json');

    // Console summary
    console.log('\n🎯 EXTRACTION SUMMARY:');
    console.log('=======================');
    console.log(`📦 Components extracted: ${this.extractedComponents.size}`);
    console.log(`🎨 CSS modules created: ${this.extractedStyles.size}`);
    console.log(`⚙️ JavaScript modules created: ${this.extractedScripts.size}`);
    console.log('\n🚀 Next steps:');
    console.log('1. Review extracted files in src/ directory');
    console.log('2. Add proper ES6 imports/exports');
    console.log('3. Test individual components');
    console.log('4. Set up development server: npm run dev');
  }

  /**
   * Main extraction process
   */
  async run() {
    try {
      await this.initialize();
      await this.createDirectoryStructure();
      await this.extractStyles();
      await this.extractJavaScript();
      await this.extractComponents();
      await this.saveExtractedFiles();
      await this.generateReport();
      
      console.log('\n🎉 Extraction completed successfully!');
      
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      process.exit(1);
    }
  }
}

// Run the extraction
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractor = new HTMLExtractor();
  extractor.run();
}

export { HTMLExtractor }; 