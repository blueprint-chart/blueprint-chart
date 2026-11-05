import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutSidebar from './LayoutSidebar.vue'

const accountsOn = vi.hoisted(() => ({ value: false }))

vi.mock('@/config/runtimeConfig', async (orig) => {
  const actual = await orig<typeof import('@/config/runtimeConfig')>()
  return { ...actual, accountsEnabled: () => accountsOn.value }
})

beforeEach(() => {
  accountsOn.value = false
})

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
      stubs: { 'router-link': RouterLinkStub, 'AccountMenu': { template: '<div class="account-menu-stub" />' } },
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

  it('renders the theme toggle in the footer', async () => {
    const wrapper = await mountSidebar()
    expect(wrapper.find('.layout-sidebar__footer button[aria-label="Toggle theme"]').exists()).toBe(true)
  })

  it('renders the account menu in the footer when accounts are enabled', async () => {
    accountsOn.value = true
    const wrapper = await mountSidebar()
    expect(wrapper.find('.layout-sidebar__footer .account-menu-stub').exists()).toBe(true)
  })

  it('omits the account menu when accounts are disabled', async () => {
    const wrapper = await mountSidebar()
    expect(wrapper.find('.account-menu-stub').exists()).toBe(false)
  })
})
