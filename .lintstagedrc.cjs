const path = require('path');

const buildEslintCommand = (filenames) =>
	`eslint --fix ${filenames
		.map((f) => path.relative(process.cwd(), f))
		.join(' ')}`;

const buildPrettierCommand = (filenames) =>
	`prettier --write ${filenames
		.map((f) => path.relative(process.cwd(), f))
		.join(' ')}`;

const buildTypecheckCommand = (filenames) => `npm run typecheck`;

module.exports = {
	'*.{cjs,mjs,js,jsx,ts,tsx}': [buildEslintCommand, buildPrettierCommand],
	'src/*.{ts,ts}': [buildTypecheckCommand],
};
