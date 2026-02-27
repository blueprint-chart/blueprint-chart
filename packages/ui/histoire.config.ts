import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

export default defineConfig({
  plugins: [HstVue()],
  setupFile: './src/histoire-setup.ts',
  storyMatch: ['src/**/*.story.vue'],
  theme: {
    title: 'Blueprint Chart',
    colors: {
      primary: {
        50: '#eef0fa',
        100: '#d5d9f2',
        200: '#adb4e5',
        300: '#8790d8',
        400: '#6b77cc',
        500: '#5b6abf',
        600: '#4e5ba8',
        700: '#404b8e',
        800: '#333c74',
        900: '#262d5a',
      },
    },
  },
  vite: {
    plugins: [
      Components({
        resolvers: [BootstrapVueNextResolver()],
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 4444,
    },
  },
})
