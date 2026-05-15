import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LayoutNavbar from './LayoutNavbar.vue'

function mountNavbar() {
  return mount(LayoutNavbar, {
    global: {
      stubs: { 'router-link': RouterLinkStub },
      plugins: [createTestingPinia({ createSpy: vi.fn })],
    },
  })
}

describe('LayoutNavbar', () => {
  it('renders the Home and My Charts nav links', () => {
    const wrapper = mountNavbar()
    const links = wrapper.findAll('.navigation-link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toContain('Home')
    expect(links[1].text()).toContain('My Charts')
  })

  it('renders the search pill', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('.navigation-search-pill').exists()).toBe(true)
  })

  it('does not render an avatar', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('.avatar').exists()).toBe(false)
    expect(wrapper.find('[data-testid="avatar"]').exists()).toBe(false)
  })

  it('does not render a "New chart" button', () => {
    const wrapper = mountNavbar()
    expect(wrapper.text()).not.toContain('New chart')
  })

  it('emits searchClick when the pill is clicked', async () => {
    const wrapper = mountNavbar()
    await wrapper.find('.navigation-search-pill').trigger('click')
    expect(wrapper.emitted('searchClick')).toHaveLength(1)
  })

  it('labels the nav landmark for screen readers', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Main navigation')
  })
})
