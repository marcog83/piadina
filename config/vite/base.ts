/// <reference types="vitest" />

import { resolve } from 'path';
import dotEnv from 'dotenv';
import circleDependency from 'vite-plugin-circular-dependency';
import dts from 'vite-plugin-dts';
import type { UserConfig } from 'vite';
import { baseTest } from './base-test';

dotEnv.config({
  path: resolve(__dirname, '.env'),
});

export type BasePestoConfig = {
  mode: string, __dirname: string, externals?: string []
};

export default ({ mode, __dirname, externals = [] }: BasePestoConfig) => {
  const isProduction = mode === 'production';
  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;

  const config: UserConfig = ({
    define: {
      'process.env': {},
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
      'process.env.NODE_ENV': JSON.stringify(mode),
      ...(!isTest && { 'process.platform': JSON.stringify(process.platform) }),
      'process.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
      circleDependency(),
      dts({
        staticImport: false,
        exclude: [
          '**/*.test.*',
          '**/__mocks__',
          '**/__tests__',
        ] }),
    ],
    build: {
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: [ 'es', 'cjs' ],
        fileName: (format) => {
          const prefix = format === 'es' ? 'index' : 'index.umd';
          const suffix = isProduction ? '' : '.debug';
          const extname = format === 'es' ? '.js' : '.cjs';

          return `${ prefix }${ suffix }${ extname }`;
        },
      },
      rollupOptions: {
        external: [
          'react',
          'react/jsx-runtime',
          '@tanstack/react-query',
          ...externals,
        ],
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    test: baseTest,
    experimental: {
      enableNativePlugins: true,
    },
  });

  return config;
};
