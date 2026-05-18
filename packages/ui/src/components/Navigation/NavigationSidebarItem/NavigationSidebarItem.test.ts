import { mount, RouterLinkStub } from '@vue/test-utils'
import NavigationSidebarItem from './NavigationSidebarItem.vue'

const stubs = { 'router-link': RouterLinkStub }

describe('NavigationSidebarItem', () => {
  it('renders the label inside a router-link with the correct to prop', () => {
    const wrapper = mount(NavigationSidebarItem, {
      props: { to: '/charts', label: 'My Charts' },
      global: { stubs },
    })
    expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/charts')
    expect(wrapper.text()).toContain('My Charts')
  })

  it('applies the active modifier class when active prop is true', () => {
    const wrapper = mount(NavigationSidebarItem, {
      props: { to: '/', label: 'Home', active: true },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-sidebar-item').classes()).toContain('navigation-sidebar-item--active')
  })

  it('renders the count slot when count prop is provided', () => {
    const wrapper = mount(NavigationSidebarItem, {
      props: { to: '/', label: 'Inbox', count: 3 },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-sidebar-item__count').exists()).toBe(true)
    expect(wrapper.find('.navigation-sidebar-item__count').text()).toBe('3')
  })

  it('does not render the count element when count is undefined', () => {
    const wrapper = mount(NavigationSidebarItem, {
      props: { to: '/', label: 'Settings' },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-sidebar-item__count').exists()).toBe(false)
  })

  it('renders the icon slot', () => {
    const wrapper = mount(NavigationSidebarItem, {
      props: { to: '/', label: 'Home' },
      slots: { icon: '<i class="custom-icon" />' },
      global: { stubs },
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })

  it('renders an external anchor when href is provided (no router-link)', () => {
    const wrapper = mount(NavigationSidebarItem, {
      props: { href: 'https://example.com', label: 'External' },
      global: { stubs },
    })
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
    const anchor = wrapper.get('a.navigation-sidebar-item')
    expect(anchor.attributes('href')).toBe('https://example.com')
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
  })

  it('renders the external indicator only when href is provided', () => {
    const internal = mount(NavigationSidebarItem, {
      props: { to: '/', label: 'Home' },
      global: { stubs },
    })
    expect(internal.find('.navigation-sidebar-item__external').exists()).toBe(false)

    const external = mount(NavigationSidebarItem, {
      props: { href: 'https://example.com', label: 'External' },
      global: { stubs },
    })
    expect(external.find('.navigation-sidebar-item__external').exists()).toBe(true)
  })

  it('throws when neither to nor href is provided', () => {
    expect(() => mount(NavigationSidebarItem, {
      // @ts-expect-error — intentionally invalid: both props omitted
      props: { label: 'Nothing' },
      global: { stubs },
    })).toThrow(/either `to` or `href`/)
  })

  it('throws when both to and href are provided', () => {
    expect(() => mount(NavigationSidebarItem, {
      props: { to: '/', href: 'https://example.com', label: 'Both' },
      global: { stubs },
    })).toThrow(/`to` or `href`, not both/)
  })
})
