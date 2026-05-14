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
      skipDiagnostics: true,
    }),
    AutoImport({
      imports: ['vue', '@vueuse/core', 'vitest'],
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
      external: ['vue', 'bootstrap', 'bootstrap-vue-next', '@vueuse/core', 'vue-color'],
    },
  },
})
