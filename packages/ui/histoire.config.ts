import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

export default defineConfig({
  plugins: [HstVue()],
  setupFile: './src/histoire-setup.ts',
  storyMatch: ['src/**/*.story.vue'],
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
