/// <reference types="vite" />

import { InlineConfig } from 'vitest';

export const baseTest: InlineConfig = {
  globals: true,
  passWithNoTests: true,
  environment: 'happy-dom',
  setupFiles: [ '../../config/vite/setup.ts' ],
  
  coverage: {
    reporter: [
      [ 'lcov', { projectRoot: './src' }],
      [ 'text' ],
    ],
    reportsDirectory: './test/results/coverage',
    include: [ '**/src/**/*.{ts,tsx}' ],
    exclude: [
      'vite.config.ts',
      '**/*.d.ts',
      'dist/**',
      '.wireit/**',
      'node_modules/',
      '**/__mocks__/**',
      '**/__snapshots__/**',
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*(*.types.ts|*.test|*.i18n|index|constants|*.mock|mocks).[jt]s?(x)',
    ],
  },
  include: [ '**/*.test.ts', '**/*.test.tsx' ],
  exclude: [ 'node_modules' ],
  reporters: [
    'default',
    [ 'vitest-sonar-reporter', { outputFile: 'test-report.xml' }],
  ],
};
