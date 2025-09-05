import fs from 'fs';
import { resolve } from 'path';
import pkg from '../package.json' with { type: 'json' };

const config = {};

const getBasePkg = () => ({
  main: './dist/index.umd.cjs',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  type: 'module',
  files: [ 'dist' ],
  exports: {
    '.': {
      import: {
        development: './dist/index.debug.js',
        production: './dist/index.js',
        types: './dist/index.d.ts',
        default: './dist/index.js',
      },
      require: {
        types: './dist/index.d.ts',
        default: './dist/index.umd.cjs',
      },
    },
  },
  scripts: {
    dev: 'wireit',
    tsc: 'tsc --project tsconfig.build.json',
    'build:debug': 'wireit',
    build: 'wireit',
    lint: 'wireit',
    'test:watch': 'vitest',
    test: 'vitest run --coverage',
    'publish-package': 'safe-publish',
    'update-deps': 'npx npm-check-updates -u',
  },
  wireit: {
    lint: {
      command: "eslint --color 'src/**/*.{ts,tsx}' './*.{ts,tsx,cjs}'",
      cache: false,
    },
    'build:tsc': {
      command: 'tsc --build tsconfig.build.json',
      cache: false,
    },
    'build:prod': {
      command: 'vite build --emptyOutDir=false',
      cache: true,
      clean: 'if-file-deleted',
      files: [
        'src/**/*.{ts,tsx,css}',
        '!src/**/*.test.{ts,tsx}',
        'tsconfig.json',
        '../../**/config/vite/base.ts',
      ],
      output: [
        'dist/**/*.js',
        'dist/**/*.d.ts',
        'tsconfig.tsbuildinfo',
      ],
    },
    'build:debug': {
      command: 'vite build --mode development --emptyOutDir=false',
      cache: true,
      clean: 'if-file-deleted',
      files: [
        'src/**/*.{ts,tsx,css}',
        '!src/**/*.test.{ts,tsx}',
        'tsconfig.json',
        '../../**/config/vite/base.ts',
      ],
      output: [
        'dist/**/*.js',
        'dist/**/*.d.ts',
        'tsconfig.tsbuildinfo',
      ],
    },
    build: {
      dependencies: [
        'build:tsc',
        'build:prod',
        'build:debug',
      ],
    },
    dev: {
      command: 'npm run build:debug -- --watch',
      service: {
        readyWhen: {
          lineMatches: 'Server started at \\d+',
        },
      },
    },
  },
  sideEffects: false,
});

pkg.workspaces
  .filter((workspace) => workspace.startsWith('packages/'))
  .forEach((workspace) => {
    const pkgWorkspace = resolve(workspace, 'package.json');
    const content = fs.readFileSync(pkgWorkspace, 'utf-8');
    const { name, dependencies, devDependencies, peerDependencies } = JSON.parse(content);

    config[name] = { dependencies, devDependencies, peerDependencies };
  });

pkg.workspaces
  .filter((workspace) => workspace.startsWith('packages/'))
  .forEach((workspace) => {
    const pkgWorkspace = resolve(workspace, 'package.json');

    const content = fs.readFileSync(pkgWorkspace, 'utf-8');
    const { name, version } = JSON.parse(content);

    const newContent = {
      name,
      version,
      ...getBasePkg(),
      ...config[name],

    };

    fs.writeFileSync(pkgWorkspace, JSON.stringify(newContent, null, 4));
  });
