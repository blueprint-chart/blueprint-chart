import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutSidebar from './LayoutSidebar.vue'

async function mountSidebar() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/charts', component: { template: '<div />' } },
    ],
  })
  await router.push('/charts')
  await router.isReady()
  return mount(LayoutSidebar, {
    global: {
      stubs: { 'router-link': RouterLinkStub, 'LayoutSidebarFooter': { template: '<div class="layout-sidebar-footer-stub" />' } },
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
  })
}

describe('LayoutSidebar', () => {
  it('renders the command bar and emits searchClick when pressed', async () => {
    const wrapper = await mountSidebar()
    await wrapper.find('.navigation-command-bar').trigger('click')
    expect(wrapper.emitted('searchClick')).toHaveLength(1)
  })

  it('renders the account and theme footer', async () => {
    const wrapper = await mountSidebar()
    expect(wrapper.find('.navigation-sidebar__footer .layout-sidebar-footer-stub').exists()).toBe(true)
  })
})
