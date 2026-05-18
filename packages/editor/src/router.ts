import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardPage from '@/components/Dashboard/DashboardPage.vue'
import WizardShell from '@/components/Wizard/WizardShell.vue'
import RenderPage from '@/components/Render/RenderPage.vue'
import { useChartSession } from '@/stores/chartSession'

declare module 'vue-router' {
  interface RouteMeta {
    bare?: boolean
    /** Set by /copy/:base64 beforeEnter so the route component can router.replace() to it. */
    copyTarget?: string
  }
}

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

/**
 * Decode a URL-safe base64 string (RFC 4648 §5: `-`/`_` instead of `+`/`/`,
 * padding optional). Returns the decoded UTF-8 string, or `null` if input is
 * malformed.
 */
function decodeUrlSafeBase64(raw: string): string | null {
  if (!raw) {
    return null
  }
  try {
    const padded = raw.replace(/-/g, '+').replace(/_/g, '/')
    const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    // atob returns a binary string; decode it as UTF-8 so BPC sources with
    // non-ASCII characters (en dashes, currency symbols, etc.) survive intact.
    const binary = atob(padded + padding)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  }
  catch {
    return null
  }
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
      // Deep-link: decode a URL-safe base64 BPC payload, hydrate a fresh
      // session, then redirect to the canonical editing URL. We hydrate in
      // beforeEnter (so the new session exists before we navigate), and use
      // router.replace from the stub component on mount so the /copy URL is
      // swapped out of history rather than pushed onto it.
      path: '/copy/:base64',
      component: () => import('@/components/Copy/CopyRedirect.vue'),
      meta: { bare: true },
      beforeEnter: (to) => {
        const dsl = decodeUrlSafeBase64(String(to.params.base64 ?? ''))
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
