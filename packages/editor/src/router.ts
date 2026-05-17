import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardPage from '@/components/Dashboard/DashboardPage.vue'
import WizardShell from '@/components/Wizard/WizardShell.vue'
import RenderPage from '@/components/Render/RenderPage.vue'
import { useChartSession } from '@/stores/chartSession'

function loadSession(to: { params: { id: string } }) {
  const { sessionId, loadChart, startAutoSave } = useChartSession()
  // Skip if session is already loaded (navigating between steps)
  if (sessionId.value === to.params.id) {
    return
  }
  const found = loadChart(to.params.id as string)
  if (!found) {
    return '/charts'
  }
  startAutoSave()
}

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, _from, savedPosition) {
    // Restore position on browser back/forward
    if (savedPosition) {
      return savedPosition
    }
    // Smooth-scroll to in-page anchor (e.g. landing section links)
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    // Default: scroll to top on every route change
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/components/Landing/LandingPage.vue'),
    },
    {
      path: '/charts',
      component: DashboardPage,
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
    {
      path: '/render',
      component: RenderPage,
      meta: { bare: true },
    },
  ],
})

export default router
