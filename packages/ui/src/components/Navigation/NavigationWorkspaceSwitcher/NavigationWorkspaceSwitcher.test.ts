import { mount } from '@vue/test-utils'
import NavigationWorkspaceSwitcher from './NavigationWorkspaceSwitcher.vue'

describe('NavigationWorkspaceSwitcher', () => {
  it('renders the workspace name', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, { props: { name: 'Blueprint' } })
    expect(wrapper.text()).toContain('Blueprint')
  })

  it('renders the first letter of the name in the badge', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, { props: { name: 'Acme Newsroom' } })
    expect(wrapper.find('.navigation-workspace-switcher__badge').text()).toBe('A')
  })

  it('uses uppercase for the badge initial regardless of casing', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, { props: { name: 'blueprint' } })
    expect(wrapper.find('.navigation-workspace-switcher__badge').text()).toBe('B')
  })

  it('emits a click event when activated', async () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, { props: { name: 'Blueprint' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
