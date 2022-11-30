module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'scope-case': [2, 'always', ['lower-case', 'upper-case', 'camel-case']],
		// removes the 'ci' and 'build' types from the config-conventional list
		'type-enum': [2, 'always', ['chore', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']],
		'subject-case': [2, 'always', 'sentence-case'],
	},
}
