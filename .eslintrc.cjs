/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	plugins: ['@typescript-eslint'],
	extends: [
		// The order of these matter:
		// eslint baseline
		'eslint:recommended',
		// disables eslint rules in favor of using prettier separately
		'prettier',
		// Recommended typescript changes, which removes some "no-undef" checks that TS handles
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		// https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
		'no-undef': 'off',
	},
	ignorePatterns: ['/dist/**/*', '/src/api-types/**/*'],
	overrides: [
		{
			files: ['src/**/*'],
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		{
			files: ['*.cjs'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
};
