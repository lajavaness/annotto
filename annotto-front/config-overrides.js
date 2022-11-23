/* eslint-disable @typescript-eslint/no-var-requires */
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const { override, fixBabelImports, addLessLoader } = require('customize-cra')
const theme = require('./src/__theme__/index')

module.exports = {
	webpack: override(
		fixBabelImports('import', {
			libraryName: 'antd',
			libraryDirectory: 'es',
			style: true,
		}),
		addLessLoader({
			lessOptions: {
				javascriptEnabled: true,
				modifyVars: {
					'@primary-color': theme.colors.primary,
					'@secondary-color': theme.colors.secondary,
				},
			},
		}),
		(config) => {
			config.plugins.push(new AntdDayjsWebpackPlugin())
			return config
		}
	),
	jest: (config) => {
		return {
			...config,
			coverageReporters: ['text', 'cobertura', 'lcov'],
			reporters: ['default', 'jest-junit'],
			modulePaths: [...(config.modulePaths || []), `<rootDir>/src`],
		}
	},
}
