import { mount } from '@vue/test-utils'
import Panel from './LayoutPanel.vue'

describe('Panel', () => {
  it('renders title text', () => {
    const wrapper = mount(Panel, { props: { title: 'Settings' } })
    expect(wrapper.find('.layout-panel__title').text()).toBe('Settings')
  })

  it('renders default slot content', () => {
    const wrapper = mount(Panel, {
      props: { title: 'Test' },
      slots: { default: '<p>Body content</p>' },
    })
    expect(wrapper.find('.layout-panel__body').text()).toContain('Body content')
  })

  it('renders actions slot content', () => {
    const wrapper = mount(Panel, {
      props: { title: 'Test' },
      slots: { actions: '<button>Add</button>' },
    })
    expect(wrapper.find('.layout-panel__actions').exists()).toBe(true)
    expect(wrapper.find('.layout-panel__actions button').exists()).toBe(true)
  })
})
