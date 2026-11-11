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

  it('links to each main documentation section', async () => {
    const wrapper = await mountSidebar()
    const hrefs = wrapper.findAll('a').map(a => a.attributes('href'))
    expect(hrefs).toEqual(expect.arrayContaining([
      'https://docs.blueprintchart.com/guide/getting-started',
      'https://docs.blueprintchart.com/charts/',
      'https://docs.blueprintchart.com/handbook/',
      'https://docs.blueprintchart.com/reference/',
    ]))
  })

  it('links the version to its release notes', async () => {
    const wrapper = await mountSidebar()
    const link = wrapper.findAll('a').find(a => a.attributes('href')?.includes('/releases/tag/'))
    expect(link?.text()).toBe(`v${__APP_VERSION__}`)
    expect(link?.attributes('href')).toBe(`https://github.com/blueprint-chart/blueprint-chart/releases/tag/v${__APP_VERSION__}`)
  })

  it('renders the account and theme footer', async () => {
    const wrapper = await mountSidebar()
    expect(wrapper.find('.navigation-sidebar__footer .account-menu-stub').exists()).toBe(true)
  })

  it('links to the datasets page', async () => {
    const wrapper = await mountSidebar()
    const link = wrapper.findAllComponents(RouterLinkStub).find(l => l.props('to') === '/datasets')
    expect(link?.text()).toContain('Datasets')
  })
})
