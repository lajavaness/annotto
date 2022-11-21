const srcDir = 'src'
module.exports = {
  collectCoverageFrom: [`${srcDir}/**/*.{js,ts}`, `!${srcDir}/**/*.d.ts`],
  coverageReporters: ['text', 'cobertura', 'lcov'],
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  reporters: ['default', 'jest-junit'],
  roots: [`<rootDir>/${process.env.ENV_TEST === 'int' ? 'tests/integration' : srcDir}`],
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(js|ts)', '**/?*.(spec|test).(js|ts)'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  preset: 'ts-jest',
}
