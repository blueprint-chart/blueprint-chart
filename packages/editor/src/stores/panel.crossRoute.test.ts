/* eslint-disable vue/one-component-per-file */
import { flushPromises, mount } from '@vue/test-utils'
import { RouterView, createMemoryHistory, createRouter } from 'vue-router'
import { usePanel, usePanelStore } from './panel'

// Regression coverage for the shared-chrome invariant: the three wizard
// sub-routes (/data, /visualize, /export) all render a panel whose state
// lives in the singleton `usePanelStore`. Navigating between routes must
// not reset mode, dockedWidth, or lastDesktopMode.

function createRouteHarness() {
  function makeRoute(label: string) {
    return defineComponent({
      name: `Route${label}`,
      setup() {
        const panel = usePanel()
        return () => h('div', { 'data-test': `route-${label.toLowerCase()}` }, [
          h('span', { 'data-test': 'mode' }, panel.mode.value),
          h('span', { 'data-test': 'docked-width' }, String(panel.dockedWidth.value)),
          h('span', { 'data-test': 'last-desktop-mode' }, panel.lastDesktopMode.value),
        ])
      },
    })
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/data' },
      { path: '/data', component: makeRoute('Data') },
      { path: '/visualize', component: makeRoute('Visualize') },
      { path: '/export', component: makeRoute('Export') },
    ],
  })

  const App = defineComponent({
    name: 'CrossRouteHarness',
    setup() {
      return () => h(RouterView)
    },
  })

  return { router, App }
}

async function mountAt(path: string) {
  const { router, App } = createRouteHarness()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

describe('panel store: cross-route consistency', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('mode = "closed" set on /data persists through /visualize and /export', async () => {
    const { wrapper, router } = await mountAt('/data')

    usePanel().close()
    await flushPromises()

    expect(wrapper.find('[data-test="route-data"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')

    await router.push('/visualize')
    await flushPromises()

    expect(wrapper.find('[data-test="route-visualize"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')

    await router.push('/export')
    await flushPromises()

    expect(wrapper.find('[data-test="route-export"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')
  })

  it('dockedWidth set on one route is identical on the other two', async () => {
    const { wrapper, router } = await mountAt('/visualize')

    usePanelStore().setDockedWidth(0.42)
    await flushPromises()
    expect(wrapper.get('[data-test="docked-width"]').text()).toBe('0.42')

    await router.push('/data')
    await flushPromises()
    expect(wrapper.find('[data-test="route-data"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="docked-width"]').text()).toBe('0.42')

    await router.push('/export')
    await flushPromises()
    expect(wrapper.find('[data-test="route-export"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="docked-width"]').text()).toBe('0.42')
  })

  it('close() on one route leaves the panel closed on all three', async () => {
    const { wrapper, router } = await mountAt('/export')

    usePanel().close()
    await flushPromises()
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')

    await router.push('/data')
    await flushPromises()
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')

    await router.push('/visualize')
    await flushPromises()
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')
  })

  it('narrow→wide→narrow transitions preserve lastDesktopMode across route changes', async () => {
    const { wrapper, router } = await mountAt('/data')
    const panel = usePanel()

    panel.initBreakpoint(false)
    panel.close()
    await flushPromises()
    expect(wrapper.get('[data-test="last-desktop-mode"]').text()).toBe('closed')

    await router.push('/visualize')
    await flushPromises()
    panel.syncBreakpoint(true)
    await flushPromises()
    expect(wrapper.get('[data-test="mode"]').text()).toBe('drawer')
    expect(wrapper.get('[data-test="last-desktop-mode"]').text()).toBe('closed')

    await router.push('/export')
    await flushPromises()
    panel.syncBreakpoint(false)
    await flushPromises()
    expect(wrapper.get('[data-test="mode"]').text()).toBe('closed')
    expect(wrapper.get('[data-test="last-desktop-mode"]').text()).toBe('closed')

    await router.push('/data')
    await flushPromises()
    panel.syncBreakpoint(true)
    await flushPromises()
    expect(wrapper.get('[data-test="mode"]').text()).toBe('drawer')
    expect(wrapper.get('[data-test="last-desktop-mode"]').text()).toBe('closed')
  })
})
