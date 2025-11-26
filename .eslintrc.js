module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/nodes'],
	env: {
		node: true,
		es6: true,
	},
	rules: {},
	overrides: [
		{
			files: ['**/*.ts'],
			parser: '@typescript-eslint/parser',
		},
		{
			files: ['**/*.js'],
			parser: 'espree',
		},
	],
	ignorePatterns: ['dist/', 'node_modules/', '*.d.ts'],
};

