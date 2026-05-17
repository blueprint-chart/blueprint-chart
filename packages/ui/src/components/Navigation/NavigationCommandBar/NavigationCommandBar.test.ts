import { mount } from '@vue/test-utils'
import NavigationCommandBar from './NavigationCommandBar.vue'

describe('NavigationCommandBar', () => {
  it('renders the placeholder label', () => {
    const wrapper = mount(NavigationCommandBar, {
      props: { placeholder: 'Search charts...', shortcutLabel: '⌘K' },
    })
    expect(wrapper.text()).toContain('Search charts...')
  })

  it('renders the shortcut hint when provided', () => {
    const wrapper = mount(NavigationCommandBar, {
      props: { placeholder: 'Search', shortcutLabel: '⌘K' },
    })
    expect(wrapper.find('.navigation-command-bar__kbd').text()).toBe('⌘K')
  })

  it('omits the shortcut hint when shortcutLabel is empty', () => {
    const wrapper = mount(NavigationCommandBar, {
      props: { placeholder: 'Search', shortcutLabel: '' },
    })
    expect(wrapper.find('.navigation-command-bar__kbd').exists()).toBe(false)
  })

  it('emits a click event when activated', async () => {
    const wrapper = mount(NavigationCommandBar, {
      props: { placeholder: 'Search', shortcutLabel: '⌘K' },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
