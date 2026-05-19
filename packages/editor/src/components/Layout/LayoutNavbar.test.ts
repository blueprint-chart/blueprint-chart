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
  it('renders the ⌘K command bar', async () => {
    const wrapper = await mountNavbar()
    expect(wrapper.find('.navigation-command-bar').exists()).toBe(true)
  })

  it('emits searchClick when the command bar is pressed', async () => {
    const wrapper = await mountNavbar()
    await wrapper.find('.navigation-command-bar').trigger('click')
    expect(wrapper.emitted('searchClick')).toHaveLength(1)
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

  it('renders the command bar to the left of the theme toggle', async () => {
    const wrapper = await mountNavbar('/charts')
    const header = wrapper.find('header.layout-navbar')
    const html = header.html()
    const searchIdx = html.indexOf('navigation-command-bar')
    const themeIdx = html.indexOf('aria-label="Toggle theme"')
    expect(searchIdx).toBeGreaterThan(-1)
    expect(themeIdx).toBeGreaterThan(-1)
    expect(searchIdx).toBeLessThan(themeIdx)
  })

  it('renders the leading cluster (hamburger + workspace switcher) with d-xl-none', async () => {
    const wrapper = await mountNavbar()
    const lead = wrapper.find('.layout-navbar__lead')
    expect(lead.exists()).toBe(true)
    expect(lead.classes()).toContain('d-xl-none')
  })

  it('renders the workspace switcher with hide-name in the leading cluster', async () => {
    const wrapper = await mountNavbar()
    const lead = wrapper.find('.layout-navbar__lead')
    const switcher = lead.find('.navigation-workspace-switcher')
    expect(switcher.exists()).toBe(true)
    // hide-name should suppress the wordmark inside the cluster
    expect(switcher.find('.navigation-workspace-switcher__name').exists()).toBe(false)
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
