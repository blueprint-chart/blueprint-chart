import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

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
      },
    },
    rules: {
      'curly': ['error', 'all'],
      'vue/no-v-html': 'off',
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '.claude/**', 'packages/lib/src/dsl/grammar.js'],
  },
]
