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
})
