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

  it('does not render the workspace switcher (sidebar owns workspace identity)', async () => {
    const wrapper = await mountNavbar()
    expect(wrapper.find('.navigation-workspace-switcher').exists()).toBe(false)
  })

  it('renders a Breadcrumb landmark on app routes', async () => {
    const wrapper = await mountNavbar('/charts')
    const crumbs = wrapper.find('nav[aria-label="Breadcrumb"]')
    expect(crumbs.exists()).toBe(true)
    expect(crumbs.text()).toContain('My Charts')
  })
})
