import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { fileURLToPath } from 'node:url'
import { readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import bpcSvg from './build/vite-plugin-bpc-svg.ts'

const nodeRequire = createRequire(import.meta.url)

// Both unplugin resolvers inject their imports during transform, so Vite's
// cold-start dependency scanner never sees the packages behind them. See the
// note on optimizeDeps below for why they have to be pre-declared. Both lists
// are read from the installed packages rather than pinned, so neither can rot.
const componentsDir = dirname(nodeRequire.resolve('bootstrap-vue-next/components'))
const componentEntries = readdirSync(componentsDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => `bootstrap-vue-next/components/${entry.name}`)
const autoImportedEntries: string[] = Object.keys(nodeRequire('./package.json').dependencies)
  .filter(name => name.startsWith('@codemirror/') || name.startsWith('@lezer/'))

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
    // Deps the scanner cannot see are discovered on the first page load instead,
    // which re-bundles and forces `optimized dependencies changed. reloading`
    // mid-boot. A page reloaded while booting drops a module out of the fully
    // eager router graph and never finishes, and a request already in flight for
    // the superseded chunk gets a 504 Outdated Optimize Dep. Pre-declaring them
    // keeps the whole set in the optimizer's first pass, so there is no reload.
    include: [...autoImportedEntries, ...componentEntries],
    // Belt and braces for anything a future resolver injects: serving the stale
    // chunk costs a duplicated module for one page load, the 504 costs the page.
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
