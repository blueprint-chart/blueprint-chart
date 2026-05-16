import { mount } from '@vue/test-utils'
import NavigationSidebar from './NavigationSidebar.vue'

describe('NavigationSidebar', () => {
  it('renders as a <nav> element with the navigation role', () => {
    const wrapper = mount(NavigationSidebar)
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Sidebar')
  })

  it('renders the header slot at the top', () => {
    const wrapper = mount(NavigationSidebar, {
      slots: { header: '<div class="probe-header">workspace</div>' },
    })
    expect(wrapper.find('.probe-header').exists()).toBe(true)
  })

  it('renders the default slot below the header', () => {
    const wrapper = mount(NavigationSidebar, {
      slots: { default: '<div class="probe-body">nav</div>' },
    })
    expect(wrapper.find('.probe-body').exists()).toBe(true)
  })

  it('honors an explicit aria-label prop', () => {
    const wrapper = mount(NavigationSidebar, {
      props: { ariaLabel: 'Workspace navigation' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Workspace navigation')
  })
})
