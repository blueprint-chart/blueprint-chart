import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'vue-color/style.css'
import '@blueprint-chart/lib/charts.scss'
import { createBootstrap } from 'bootstrap-vue-next'

function syncBsTheme() {
  const dark = document.documentElement.classList.contains('htw-dark')
  document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light')
}

export function setupVue3({ app }: { app: import('vue').App }) {
  app.use(createBootstrap())

  syncBsTheme()
  new MutationObserver(syncBsTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}
