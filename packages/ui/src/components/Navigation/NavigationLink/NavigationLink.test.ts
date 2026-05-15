import { mount, RouterLinkStub } from '@vue/test-utils'
import NavigationLink from './NavigationLink.vue'

const stubs = { 'router-link': RouterLinkStub }

describe('NavigationLink', () => {
  it('renders the label inside a router-link with the correct to prop', () => {
    const wrapper = mount(NavigationLink, {
      props: { to: '/charts', label: 'My Charts' },
      global: { stubs },
    })
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props().to).toBe('/charts')
    expect(wrapper.text()).toContain('My Charts')
  })

  it('applies the active modifier class when active prop is true', () => {
    const wrapper = mount(NavigationLink, {
      props: { to: '/', label: 'Home', active: true },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-link').classes()).toContain('navigation-link--active')
  })

  it('renders the external-link icon when external prop is true', () => {
    const wrapper = mount(NavigationLink, {
      props: { to: 'https://example.com', label: 'Docs', external: true },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-link__external-icon').exists()).toBe(true)
  })

  it('does not render the external-link icon by default', () => {
    const wrapper = mount(NavigationLink, {
      props: { to: '/', label: 'Home' },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-link__external-icon').exists()).toBe(false)
  })
})
