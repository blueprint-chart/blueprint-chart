import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { fileURLToPath } from 'node:url'
import bpcSvg from './build/vite-plugin-bpc-svg'

export default defineConfig({
  plugins: [
    bpcSvg(),
    vue(),
    Components({
      resolvers: [
        BootstrapVueNextResolver(),
        IconsResolver({
          prefix: 'icon',
          enabledCollections: ['ph'],
        }),
      ],
    }),
    Icons({
      compiler: 'vue3',
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function'],
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5555,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
  },
})
