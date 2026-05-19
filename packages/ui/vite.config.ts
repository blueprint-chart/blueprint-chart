import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { mkdir, copyFile, readdir, writeFile } from 'node:fs/promises'
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
      const entries = await readdir(srcDir)
      for (const entry of entries) {
        if (entry.endsWith('.scss') && !entry.startsWith('_')) {
          await copyFile(join(srcDir, entry), join(outDir, entry))
          const css = sass.compile(join(srcDir, entry), { style: 'compressed' }).css
          const cssName = entry.replace(/\.scss$/, '.css')
          await writeFile(join(outDir, cssName), css)
        }
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
