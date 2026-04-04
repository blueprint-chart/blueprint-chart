import { mount } from '@vue/test-utils'
import LandingFooter from './LandingFooter.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({ theme: { value: 'light' }, cycleTheme: vi.fn() }),
}))

const RouterLinkStub = {
  template: '<a><slot /></a>',
  props: ['to'],
}

describe('LandingFooter', () => {
  it('renders brand name', () => {
    const w = mount(LandingFooter, {
      global: { stubs: { 'router-link': RouterLinkStub } },
    })
    expect(w.text()).toContain('Blueprint Chart')
  })

  it('renders MIT license text', () => {
    const w = mount(LandingFooter, {
      global: { stubs: { 'router-link': RouterLinkStub } },
    })
    expect(w.text()).toContain('MIT License')
  })
})
