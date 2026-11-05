import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutNavbar from './LayoutNavbar.vue'

async function mountNavbar(initialPath = '/charts') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/charts', component: { template: '<div />' } },
      { path: '/edit/:id', component: { template: '<div />' } },
      { path: '/new', component: { template: '<div />' } },
    ],
  })
  await router.push(initialPath)
  await router.isReady()
  return mount(LayoutNavbar, {
    global: {
      stubs: { 'router-link': RouterLinkStub },
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
  })
}

describe('LayoutNavbar', () => {
  it('leaves search, theme and account to the sidebar', async () => {
    const wrapper = await mountNavbar()
    expect(wrapper.find('.navigation-command-bar').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Toggle theme"]').exists()).toBe(false)
    expect(wrapper.find('.account-menu').exists()).toBe(false)
  })

  it('renders the workspace switcher only in the leading cluster (sidebar owns primary identity)', async () => {
    const wrapper = await mountNavbar()
    // The switcher is present in the leading cluster (hamburger area), not at root level outside it
    const lead = wrapper.find('.layout-navbar__lead')
    expect(lead.find('.navigation-workspace-switcher').exists()).toBe(true)
  })

  it('does not render a Breadcrumb landmark (moved to contextual header)', async () => {
    const wrapper = await mountNavbar('/charts')
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(false)
  })

  it('renders the leading cluster (hamburger + workspace switcher) with d-xl-none', async () => {
    const wrapper = await mountNavbar()
    const lead = wrapper.find('.layout-navbar__lead')
    expect(lead.exists()).toBe(true)
    expect(lead.classes()).toContain('d-xl-none')
  })

  it('renders the workspace switcher with the wordmark visible in the leading cluster', async () => {
    const wrapper = await mountNavbar()
    const lead = wrapper.find('.layout-navbar__lead')
    const switcher = lead.find('.navigation-workspace-switcher')
    expect(switcher.exists()).toBe(true)
    // wordmark should read "Blueprint Chart"
    expect(switcher.find('.navigation-workspace-switcher__name').text()).toBe('Blueprint Chart')
  })

  it('emits toggleSidebar when the hamburger is clicked', async () => {
    const wrapper = await mountNavbar()
    const btn = wrapper.find('.layout-navbar__lead button[aria-label="Open navigation"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(wrapper.emitted('toggleSidebar')).toHaveLength(1)
  })

  it('reflects sidebarOpen via aria-expanded on the hamburger', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/charts', component: { template: '<div />' } }],
    })
    await router.push('/charts')
    await router.isReady()
    const wrapper = mount(LayoutNavbar, {
      props: { sidebarOpen: true },
      global: {
        stubs: { 'router-link': RouterLinkStub },
        plugins: [createTestingPinia({ createSpy: vi.fn }), router],
      },
    })
    const btn = wrapper.find('.layout-navbar__lead button[aria-label="Open navigation"]')
    expect(btn.attributes('aria-expanded')).toBe('true')
  })
})
