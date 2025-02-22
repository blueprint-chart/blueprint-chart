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
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
]
