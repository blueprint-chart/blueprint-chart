import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const uiAutoImports = require('./packages/ui/auto-imports.eslintrc.json')
const editorAutoImports = require('./packages/editor/auto-imports.eslintrc.json')
const autoImportGlobals = Object.fromEntries(
  Object.keys({ ...uiAutoImports.globals, ...editorAutoImports.globals }).map(k => [k, 'readonly']),
)

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  stylistic.configs['recommended-flat'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...autoImportGlobals,
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        MouseEvent: 'readonly',
        PointerEvent: 'readonly',
        SVGElement: 'readonly',
        SVGGElement: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        getComputedStyle: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
      },
    },
    rules: {
      'curly': ['error', 'all'],
      'vue/no-v-html': 'off',
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '.claude/**', '.review/**', 'packages/lib/src/dsl/grammar.js', 'packages/editor/src/dsl-lang/bpc-parser.js', 'e2e/**', 'playwright.config.ts', 'packages/docs/src/.vitepress/cache/**'],
  },
]
