import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import vitest from '@vitest/eslint-plugin'

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
     plugins: { js },
      extends: ["js/recommended"],
       languageOptions: { globals: globals.browser } 
      },
    tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginReact.configs.flat.recommended,
  {
      files: ['**/*.spec.ts*', '**/*.test.ts*', '**/*.test-d.ts*'],
      plugins: { vitest },
      rules: vitest.configs.recommended.rules,
      settings: { vitest: { typecheck: true } },
    },
]);
