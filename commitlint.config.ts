import { defineConfig } from '@commitlint/config-conventional';

const config = defineConfig({
	extends: ['@commitlint/config-conventional'],
	formatter: '@commitlint/format',
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat',
				'fix',
				'docs',
				'style',
				'refactor',
				'perf',
				'test',
				'build',
				'ci',
				'chore',
				'revert',
			],
		],
		'type-case': [2, 'always', 'lower-case'],
		'type-empty': [2, 'never'],
		'subject-empty': [2, 'never'],
		'subject-full-stop': [2, 'never', '.'],
		'header-max-length': [2, 'always', 100],
	},
	helpUrl: 'https://github.com/conventional-commits/conventional-commits/blob/main/README.md',
});

export default config;
