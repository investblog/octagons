// Flat config (ESLint 9+). Vanilla browser library, ES5 IIFE, zero dependencies.
// CommonJS on purpose: there is no "type": "module" here.
module.exports = [
	{
		ignores: ['*.min.js'],
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 5,
			sourceType: 'script',
			globals: {
				window: 'readonly',
				document: 'readonly',
				performance: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				ResizeObserver: 'readonly',
				IntersectionObserver: 'readonly',
				devicePixelRatio: 'readonly',
				getComputedStyle: 'readonly',
				module: 'writable',
			},
		},
		rules: {
			'no-undef': 'error',
			'no-unused-vars': 'error',
			'no-redeclare': 'error',
		},
	},
];
