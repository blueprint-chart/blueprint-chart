import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // `@vitejs/plugin-vue` lets the docs vitest pipeline compile and mount the
  // VitePress theme's Vue SFCs (e.g. DocFeedback.vue). The non-Vue docs tests
  // (DSL integrity, theme composables) are unaffected by its presence.
  plugins: [vue()],
  resolve: {
    alias: {
      // The theme SFCs import virtual icon modules provided by unplugin-icons
      // at build time. Those are not available under vitest, so point the icon
      // import at a tiny stub component. Tests can still override with vi.mock.
      '~icons/ph/github-logo': new URL('./test/stubs/icon-stub.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
