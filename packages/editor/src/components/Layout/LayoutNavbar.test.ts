import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LayoutNavbar from './LayoutNavbar.vue'

function mountNavbar() {
  return mount(LayoutNavbar, {
    global: {
      stubs: { 'router-link': RouterLinkStub },
      plugins: [createTestingPinia({ createSpy: vi.fn })],
    },
  })
}

describe('LayoutNavbar', () => {
  it('renders the workspace switcher with the Blueprint name', () => {
    const wrapper = mountNavbar()
    expect(wrapper.text()).toContain('Blueprint')
  })

  it('renders the ⌘K command bar', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('.navigation-command-bar').exists()).toBe(true)
  })

  it('emits searchClick when the command bar is pressed', async () => {
    const wrapper = mountNavbar()
    await wrapper.find('.navigation-command-bar').trigger('click')
    expect(wrapper.emitted('searchClick')).toHaveLength(1)
  })

  it('labels the topbar landmark for screen readers', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('header').attributes('role')).toBe('banner')
  })

  it('no longer renders Home or My Charts nav links (moved to sidebar)', () => {
    const wrapper = mountNavbar()
    const links = wrapper.findAll('.navigation-link')
    expect(links.length).toBe(0)
  })
})
