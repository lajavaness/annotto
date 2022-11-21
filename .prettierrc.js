module.exports = {
  printWidth: 120,
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  endOfLine: 'lf',
  trailingComma: 'es5',
  bracketSpacing: true,
  overrides: [
    {
      files: './**/*.{js,ts,jsx,tsx}',
      options: {
        parser: 'babylon',
      },
    },
    {
      files: './**/*.json',
      options: {
        parser: 'json',
      },
    },
    {
      files: './*.json',
      options: {
        parser: 'json',
      },
    },
    {
      files: '.*.rc',
      options: {
        parser: 'json',
      },
    },
  ],
}

