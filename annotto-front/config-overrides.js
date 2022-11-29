// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack')
// eslint-disable-next-line import/no-extraneous-dependencies
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
// eslint-disable-next-line import/no-extraneous-dependencies
const { override, fixBabelImports, addLessLoader, adjustStyleLoaders, addWebpackPlugin } = require('customize-cra')
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
    adjustStyleLoaders(({ use: [, , postcss] }) => {
      const postcssOptions = postcss.options
      postcss.options = { postcssOptions }
    }),
    addWebpackPlugin(new webpack.ProvidePlugin({ process: 'process/browser' })),
    (config) => {
      config.plugins.push(new AntdDayjsWebpackPlugin())
      config.resolve = { ...config.resolve, fallback: { path: require.resolve('path-browserify') } }
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
