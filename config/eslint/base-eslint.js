module.exports = {
  extends: [
    require.resolve('eslint-config-airbnb'),
    require.resolve('eslint-config-airbnb-typescript/base'),
  ],
  ignorePatterns: [
    'packages/**/dist/',
    'packages/**/test/results/',
  ],
  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    project: [ './tsconfig.json', './tsconfig.node.json' ],
  },
  rules: {
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: [ 'const', 'let', 'var' ], next: '*' },
      { blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: [ 'const', 'let', 'var' ] },
      { blankLine: 'always', prev: [ 'case', 'default' ], next: '*' },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'any', prev: 'directive', next: 'directive' },
      { blankLine: 'always', prev: '*', next: 'return' },

    ],
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/no-shadow': [
      'error',
      {
        ignoreOnInitialization: true,
      },
    ],
    'array-bracket-newline': [
      'error',
      {
        multiline: true,
      },
    ],
    'array-bracket-spacing': [
      'error',
      'always',
      {
        arraysInArrays: false,
        objectsInArrays: false,
      },
    ],
    'import/prefer-default-export': 'off',
    'max-len': [
      'error',
      {
        code: 120,
      },
    ],
    'object-curly-newline': 'off',
    'object-curly-spacing': [
      'error',
      'always',
      {
        arraysInObjects: true,
        objectsInObjects: true,
      },
    ],
    'template-curly-spacing': [
      'error',
      'always',
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'type',
          'internal',
          'sibling',
          'parent',
          'index',

        ],
        pathGroups: [
          {
            pattern: '~/**',
            group: 'external',
          },
          {
            pattern: '@api/**',
            group: 'internal',
          },
          {
            pattern: '@observer/**',
            group: 'internal',
          },
          {
            pattern: '@components/**',
            group: 'internal',
          },
          {
            pattern: '@constants/**',
            group: 'internal',
          },
          {
            pattern: '@contexts/**',
            group: 'internal',
          },
          {
            pattern: '@hooks/**',
            group: 'internal',
          },
          {
            pattern: '@locales/**',
            group: 'internal',
          },
          {
            pattern: '@utils/**',
            group: 'internal',
          },
          {
            pattern: '@type-defs/**',
            group: 'type',
          },
          {
            pattern: '@builders/**',
            group: 'internal',
          },
          {
            pattern: '@attributes/**',
            group: 'internal',
          },
          {
            pattern: '@test/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: [ 'internal' ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
};
