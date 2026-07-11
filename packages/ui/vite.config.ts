import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import * as sass from 'sass'

// Produces dist/styles/*.css for CSS-only consumers (e.g. VitePress in @blueprint-chart/docs)
// that cannot process SCSS. Also copies the .scss source files so SCSS consumers
// (the editor) can @use them directly.
function viteCopyStyles() {
  return {
    name: 'blueprint-chart-copy-styles',
    apply: 'build' as const,
    async closeBundle() {
      const srcDir = resolve(__dirname, 'src/styles')
      const outDir = resolve(__dirname, 'dist/styles')
      await mkdir(outDir, { recursive: true })
      // Explicit allowlist of public entry points, matching package.json's
      // `exports` map. Do NOT copy every .scss in this directory: partials
      // like _mixins.scss are internal (used by tokens.scss/eyebrow.scss)
      // and must not be emitted as their own dist/styles/*.css|scss files.
      const publicEntries = ['tokens.scss', 'eyebrow.scss']
      for (const publicName of publicEntries) {
        // Partials (leading underscore) are still valid public entry points.
        // Consumers `@use` them without the underscore, so the dist copy
        // drops it too, matching Sass's own partial-resolution convention.
        const entry = publicName === 'tokens.scss' ? publicName : `_${publicName}`
        await copyFile(join(srcDir, entry), join(outDir, publicName))
        const css = sass.compile(join(srcDir, entry), { style: 'compressed' }).css
        const cssName = publicName.replace(/\.scss$/, '.css')
        await writeFile(join(outDir, cssName), css)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      include: ['auto-imports.d.ts', 'src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/*.test.ts', 'src/**/*.story.vue'],
      insertTypesEntry: true,
      rollupTypes: false,
      tsconfigPath: './tsconfig.json',
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core'],
      dirs: ['src/composables'],
      dts: 'auto-imports.d.ts',
      eslintrc: { enabled: true, filepath: 'auto-imports.eslintrc.json' },
    }),
    Components({
      dirs: ['src/components'],
      resolvers: [
        BootstrapVueNextResolver(),
        IconsResolver({ prefix: 'icon', enabledCollections: ['ph'] }),
      ],
      dts: 'components.d.ts',
    }),
    Icons({ compiler: 'vue3' }),
    viteCopyStyles(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function'],
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'bootstrap', 'bootstrap-vue-next', '@vueuse/core'],
      onwarn(warning, defaultHandler) {
        // Vue SFC compiler emits an unused `resolveComponent` import for some
        // <script setup> components whose tags are fully resolved at compile
        // time (e.g. via unplugin-vue-components). Suppress that specific noise.
        if (
          warning.code === 'UNUSED_EXTERNAL_IMPORT'
          && warning.exporter === 'vue'
          && /\bresolveComponent\b/.test(warning.message)
        ) {
          return
        }
        defaultHandler(warning)
      },
    },
  },
})
