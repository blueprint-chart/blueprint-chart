import { mount } from '@vue/test-utils'
import NavigationSearchPill from './NavigationSearchPill.vue'

describe('NavigationSearchPill', () => {
  it('renders the placeholder and shortcut label', () => {
    const wrapper = mount(NavigationSearchPill, {
      props: { placeholder: 'Search…', shortcutLabel: '⌘ K' },
    })
    expect(wrapper.text()).toContain('Search…')
    expect(wrapper.find('kbd').text()).toBe('⌘ K')
  })

  it('renders the Ctrl K label on non-mac platforms', () => {
    const wrapper = mount(NavigationSearchPill, {
      props: { placeholder: 'Search…', shortcutLabel: 'Ctrl K' },
    })
    expect(wrapper.find('kbd').text()).toBe('Ctrl K')
  })

  it('emits click when activated', async () => {
    const wrapper = mount(NavigationSearchPill, {
      props: { placeholder: 'Search…', shortcutLabel: '⌘ K' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('hides placeholder and kbd in compact mode', () => {
    const wrapper = mount(NavigationSearchPill, {
      props: { placeholder: 'Search…', shortcutLabel: '⌘ K', compact: true },
    })
    expect(wrapper.find('.navigation-search-pill__text').exists()).toBe(false)
    expect(wrapper.find('kbd').exists()).toBe(false)
    expect(wrapper.find('.navigation-search-pill__icon').exists()).toBe(true)
  })

  it('sets aria-keyshortcuts to the keys form of the shortcut', () => {
    const wrapper = mount(NavigationSearchPill, {
      props: { placeholder: 'Search…', shortcutLabel: '⌘ K', shortcutKeys: 'Meta+K' },
    })
    expect(wrapper.find('button').attributes('aria-keyshortcuts')).toBe('Meta+K')
  })
})
