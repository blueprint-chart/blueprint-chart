import { mount } from '@vue/test-utils'
import LandingBadge from './LandingBadge.vue'

describe('LandingBadge', () => {
  it('renders the label text', () => {
    const w = mount(LandingBadge, {
      props: { label: 'Free forever' },
      global: { stubs: { AppIcon: { template: '<span class="icon-stub" />' } } },
    })
    expect(w.text()).toContain('Free forever')
  })

  it('renders an icon', () => {
    const w = mount(LandingBadge, {
      props: { label: 'MIT licensed' },
      global: { stubs: { AppIcon: { template: '<span class="icon-stub" />' } } },
    })
    expect(w.find('.icon-stub').exists()).toBe(true)
  })
})
