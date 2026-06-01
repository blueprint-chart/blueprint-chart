import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'
import router from './router'
import { resolveSupabaseConfig, accountsEnabled } from './config/runtimeConfig'
import { getSupabaseClient } from './lib/supabaseClient'
import './assets/styles/main.scss'

/**
 * If the URL carries a magic-link PKCE `?code=`, exchange it for a session and
 * strip the param before the router takes over. Runs only when accounts are on.
 */
async function handleAuthRedirect(): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  if (!code) {
    return
  }
  const client = await getSupabaseClient()
  if (client) {
    try {
      await client.auth.exchangeCodeForSession(code)
    }
    catch {
      // Expired/used code — fall through; the sign-in UI can prompt a retry.
    }
  }
  // Strip ?code= (and any error params) while preserving the router hash.
  const clean = `${window.location.origin}${window.location.pathname}${window.location.hash || '#/charts'}`
  window.history.replaceState({}, '', clean)
}

async function bootstrap(): Promise<void> {
  await resolveSupabaseConfig()
  if (accountsEnabled()) {
    await handleAuthRedirect()
  }

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  createApp(App).use(pinia).use(router).use(createBootstrap()).mount('#app')
}

void bootstrap()
