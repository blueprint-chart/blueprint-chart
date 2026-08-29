import { createRouter, createWebHashHistory, type RouteLocationNormalized } from 'vue-router'
import DashboardPage from '@/components/Dashboard/DashboardPage.vue'
import WizardShell from '@/components/Wizard/WizardShell.vue'
import RenderPage from '@/components/Render/RenderPage.vue'
import { useChartSession, storageKey, metaKey } from '@/stores/chartSession'
import { accountsEnabled } from '@/config/runtimeConfig'
import { useAccount } from '@/stores/account'
import { useCloudCharts } from '@/stores/cloudCharts'
import { decodeUrlSafeBase64 } from '@/utils/base64'

declare module 'vue-router' {
  interface RouteMeta {
    bare?: boolean
    /** Set by /copy beforeEnter so the route component can router.replace() to it. */
    copyTarget?: string
  }
}

async function loadSession(to: RouteLocationNormalized) {
  const { sessionId, loadChart, startAutoSave } = useChartSession()
  const id = to.params.id as string
  // Skip if session is already loaded (navigating between steps)
  if (sessionId.value === id) {
    return
  }
  // Local hit (includes cloud charts previously cached on this device).
  if (loadChart(id)) {
    startAutoSave()
    return
  }
  // No local copy: if accounts are on and the signed-in user OWNS this chart,
  // fetch it from the cloud, cache it locally under the SAME id (so the editor —
  // which is localStorage-based — loads it and sessionId === cloudId), then load.
  if (accountsEnabled()) {
    const account = useAccount()
    await account.init()
    const userId = account.user.value?.id
    if (userId) {
      const cloud = useCloudCharts()
      const record = await cloud.loadCloud(id)
      if (record && record.owner === userId) {
        localStorage.setItem(storageKey(id), record.dsl)
        if (record.meta && Object.keys(record.meta).length > 0) {
          localStorage.setItem(metaKey(id), JSON.stringify(record.meta))
        }
        cloud.markCloudBacked(id)
        if (loadChart(id)) {
          startAutoSave()
          return
        }
      }
    }
    // Not owner / not found → read-only render.
    return `/render?id=${id}`
  }
  // Accounts off and no local chart → dashboard (unchanged behavior).
  return '/charts'
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
      // Deep-link: decode a URL-safe base64 BPC payload from the `bpc64` query
      // param, hydrate a fresh session, then redirect to the canonical editing
      // URL. We hydrate in beforeEnter (so the new session exists before we
      // navigate), and use router.replace from the stub component on mount so
      // the /copy URL is swapped out of history rather than pushed onto it.
      path: '/copy',
      component: () => import('@/components/Copy/CopyRedirect.vue'),
      meta: { bare: true },
      beforeEnter: (to) => {
        const bpc64 = to.query.bpc64
        const dsl = decodeUrlSafeBase64(typeof bpc64 === 'string' ? bpc64 : '')
        if (!dsl) {
          return '/'
        }
        const { createFromDsl } = useChartSession()
        const newId = createFromDsl(dsl)
        if (!newId) {
          return '/'
        }
        // Stash the target so the component can swap it in with replace().
        to.meta.copyTarget = `/edit/${newId}/visualize`
      },
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
