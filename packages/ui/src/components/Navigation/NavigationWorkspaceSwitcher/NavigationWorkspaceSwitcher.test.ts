import { mount, RouterLinkStub } from '@vue/test-utils'
import NavigationWorkspaceSwitcher from './NavigationWorkspaceSwitcher.vue'

const stubs = { 'router-link': RouterLinkStub }

describe('NavigationWorkspaceSwitcher', () => {
  it('renders the workspace name', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, {
      props: { name: 'Blueprint' },
      global: { stubs },
    })
    expect(wrapper.text()).toContain('Blueprint')
  })

  it('renders the first letter of the name in the badge', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, {
      props: { name: 'Acme Newsroom' },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-workspace-switcher__badge').text()).toBe('A')
  })

  it('uses uppercase for the badge initial regardless of casing', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, {
      props: { name: 'blueprint' },
      global: { stubs },
    })
    expect(wrapper.find('.navigation-workspace-switcher__badge').text()).toBe('B')
  })

  it('renders the initial badge with the editorial accent', () => {
    const w = mount(NavigationWorkspaceSwitcher, { props: { name: 'Blueprint' } })
    const badge = w.find('.navigation-workspace-switcher__badge')
    expect(badge.exists()).toBe(true)
    // background pulls from --bc-accent via a class, asserted structurally:
    expect(badge.classes()).toContain('navigation-workspace-switcher__badge--accent')
  })

  it('emits a click event when activated as a button', async () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, {
      props: { name: 'Blueprint' },
      global: { stubs },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders as a router-link when the to prop is provided', () => {
    const wrapper = mount(NavigationWorkspaceSwitcher, {
      props: { name: 'Blueprint', to: '/' },
      global: { stubs },
    })
    expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/')
    expect(wrapper.find('a.navigation-workspace-switcher').exists()).toBe(true)
    expect(wrapper.find('button.navigation-workspace-switcher').exists()).toBe(false)
  })
})
