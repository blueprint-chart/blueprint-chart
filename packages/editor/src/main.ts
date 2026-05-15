import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).use(router).use(createBootstrap()).mount('#app')
