import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LayoutBreadcrumb from './LayoutBreadcrumb.vue'

async function mountBreadcrumb(initialPath = '/charts') {
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
  return mount(LayoutBreadcrumb, {
    global: {
      stubs: { 'router-link': RouterLinkStub },
      plugins: [createTestingPinia({ createSpy: vi.fn }), router],
    },
  })
}

describe('LayoutBreadcrumb', () => {
  it('renders a Breadcrumb landmark', async () => {
    const wrapper = await mountBreadcrumb('/charts')
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(true)
  })

  it('shows "My charts" on /charts', async () => {
    const wrapper = await mountBreadcrumb('/charts')
    expect(wrapper.text()).toContain('My charts')
  })

  it('shows "My charts / New chart" on /new', async () => {
    const wrapper = await mountBreadcrumb('/new')
    expect(wrapper.text()).toContain('My charts')
    expect(wrapper.text()).toContain('New chart')
  })

  it('marks the last crumb with aria-current="page"', async () => {
    const wrapper = await mountBreadcrumb('/charts')
    const active = wrapper.find('[aria-current="page"]')
    expect(active.exists()).toBe(true)
    expect(active.text()).toBe('My charts')
  })

  it('renders the chart title as the page h1 on edit routes', async () => {
    const wrapper = await mountBreadcrumb('/edit/abc')
    expect(wrapper.find('h1').text()).toBe('Untitled')
  })

  it('renders nothing on unmatched routes', async () => {
    const wrapper = await mountBreadcrumb('/unknown')
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(false)
  })
})
