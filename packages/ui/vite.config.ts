import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

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
