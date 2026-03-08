import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/Home/HomePage.vue'
import WizardShell from '@/components/Wizard/WizardShell.vue'
import { useChartSession } from '@/composables/useChartSession'

function loadSession(to: { params: { id: string } }) {
  const { sessionId, loadChart, startAutoSave } = useChartSession()
  // Skip if session is already loaded (navigating between steps)
  if (sessionId.value === to.params.id) {
    return
  }
  const found = loadChart(to.params.id as string)
  if (!found) {
    return '/'
  }
  startAutoSave()
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/new',
      component: WizardShell,
      beforeEnter: () => {
        const { prepareNew } = useChartSession()
        prepareNew()
      },
    },
    {
      path: '/edit/:id',
      redirect: to => `/edit/${to.params.id}/visualize`,
    },
    {
      path: '/edit/:id/data',
      component: WizardShell,
      beforeEnter: loadSession,
    },
    {
      path: '/edit/:id/visualize',
      component: WizardShell,
      beforeEnter: loadSession,
    },
    {
      path: '/edit/:id/export',
      component: WizardShell,
      beforeEnter: loadSession,
    },
  ],
})

export default router
