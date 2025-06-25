#!/usr/bin/env node

/**
 * Development Server for Social Media Calculator
 * 
 * Provides hot reload, automatic browser refresh, and development optimizations
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startDevServer() {
  console.log('🚀 Starting development server...');
  
  try {
    const server = await createServer({
      configFile: resolve(__dirname, '../vite.config.js'),
      server: {
        port: 3000,
        open: true,
        host: true,
        cors: true
      },
      // Development optimizations
      define: {
        __DEV__: true
      },
      // Hot reload for CSS and JS
      css: {
        devSourcemap: true
      }
    });

    await server.listen();
    
    console.log('✅ Development server running at:');
    console.log('   📱 Local:   http://localhost:3000');
    console.log('   🌐 Network: http://192.168.1.x:3000');
    console.log('');
    console.log('🔥 Hot reload enabled - changes will auto-refresh');
    console.log('🎯 Ready for development!');
    
  } catch (error) {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
  }
}

startDevServer(); 