module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Code quality rules
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'warn',
    'no-debugger': 'error',
    
    // Style rules
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Best practices
    'prefer-const': 'error',
    'no-var': 'error',
    'arrow-spacing': 'error',
    'object-shorthand': 'error',
    
    // Calculator-specific rules
    'no-magic-numbers': ['warn', { 
      'ignore': [0, 1, -1, 100, 1000, 1000000], 
      'ignoreArrayIndexes': true 
    }]
  },
  globals: {
    // Third-party libraries
    'Chart': 'readonly',
    'noUiSlider': 'readonly',
    'tippy': 'readonly',
    'anime': 'readonly',
    '_': 'readonly'
  }
}; 