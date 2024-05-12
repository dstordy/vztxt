import globals from "globals";
import js from "@eslint/js";
import ts from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...js.configs.recommended,
    files: ["packages/*/src/**/*.{js,cjs,mjs}", "*.js"],
  },
  ...[
    ...ts.configs.recommendedTypeChecked,
    ...ts.configs.stylisticTypeChecked,
  ].map((config) => ({
    ...config,
    files: ["packages/*/src/**/*.{ts,tsx,cts,mts}"],
  })),
  {
    rules: {
      "@typescript-eslint/prefer-regexp-exec": "off",
    },
  },
  eslintConfigPrettier,
  {
    ignores: ["**/.antlr/", "**/generated"],
  },
];
