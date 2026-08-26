import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { fileURLToPath } from 'node:url'
import bpcSvg from './build/vite-plugin-bpc-svg.ts'

export default defineConfig({
  plugins: [
    bpcSvg(),
    vue(),
    AutoImport({
      imports: ['vue', '@vueuse/core', 'pinia'],
      dirs: ['src/composables', '../ui/src/composables'],
      dts: 'auto-imports.d.ts',
      eslintrc: { enabled: true, filepath: 'auto-imports.eslintrc.json' },
    }),
    Components({
      dirs: [
        'src/components',
        '../ui/src/components',
      ],
      resolvers: [
        BootstrapVueNextResolver(),
        IconsResolver({
          prefix: 'icon',
          enabledCollections: ['ph'],
        }),
      ],
      dts: 'components.d.ts',
    }),
    Icons({
      compiler: 'vue3',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function'],
      },
    },
  },
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // Exact-match alias so subpath imports like `@blueprint-chart/ui/styles/tokens.scss`
      // continue to resolve through the package's exports map instead of being
      // incorrectly rewritten to `src/index.ts/<subpath>`.
      { find: /^@blueprint-chart\/ui$/, replacement: fileURLToPath(new URL('../ui/src/index.ts', import.meta.url)) },
      // Resolve lib to source so `make dev` picks up edits via HMR without
      // a manual `make build-lib` round-trip. Exact match only — subpath
      // imports (e.g. `@blueprint-chart/lib/charts.scss`) must keep resolving
      // through the package's exports map to the SCSS file.
      { find: /^@blueprint-chart\/lib$/, replacement: fileURLToPath(new URL('../lib/src/index.ts', import.meta.url)) },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT ?? 5555),
  },
  optimizeDeps: {
    // The BootstrapVueNextResolver injects `bootstrap-vue-next/components/*`
    // imports during transform, so the cold-start scanner never sees them: the
    // optimizer discovers them on the first page load, re-bundles, and answers
    // requests already in flight with 504 Outdated Optimize Dep. A page that
    // loses that race drops a module out of the eager graph and never boots,
    // and if the 504 landed before the HMR client connected there is no
    // full-reload to recover it. Serving the stale chunk instead costs a
    // duplicated module for one page load; the 504 costs the whole page.
    ignoreOutdatedRequests: true,
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
})
