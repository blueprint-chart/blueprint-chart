import { mount } from '@vue/test-utils'
import NavigationSidebarGroup from './NavigationSidebarGroup.vue'

describe('NavigationSidebarGroup', () => {
  it('renders the eyebrow label when provided', () => {
    const wrapper = mount(NavigationSidebarGroup, {
      props: { eyebrow: 'Workspace' },
      slots: { default: '<a>Item</a>' },
    })
    expect(wrapper.find('.navigation-sidebar-group__eyebrow').text()).toBe('Workspace')
  })

  it('does not render the eyebrow element when eyebrow is not provided', () => {
    const wrapper = mount(NavigationSidebarGroup, {
      slots: { default: '<a>Item</a>' },
    })
    expect(wrapper.find('.navigation-sidebar-group__eyebrow').exists()).toBe(false)
  })

  it('renders the default slot content', () => {
    const wrapper = mount(NavigationSidebarGroup, {
      slots: { default: '<a class="probe">Item</a>' },
    })
    expect(wrapper.find('.probe').exists()).toBe(true)
  })
})
