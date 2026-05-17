import { mount } from '@vue/test-utils'
import LandingFooter from './LandingFooter.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({ theme: { value: 'light' } }),
}))

function mountFooter() {
  return mount(LandingFooter, {
    global: {
      stubs: { 'router-link': { template: '<a><slot /></a>', props: ['to'] } },
    },
  })
}

describe('LandingFooter', () => {
  it('renders the brand', () => {
    const w = mountFooter()
    expect(w.text()).toContain('Blueprint Chart')
  })

  it('renders the Editor link', () => {
    const w = mountFooter()
    expect(w.text()).toContain('Editor')
  })

  it('renders the GitHub link', () => {
    const w = mountFooter()
    expect(w.text()).toContain('GitHub')
  })

  it('renders the mono tagline', () => {
    const w = mountFooter()
    expect(w.find('.landing-footer__tagline').text()).toContain('MIT')
    expect(w.find('.landing-footer__tagline').text()).toContain('investigative journalism')
  })

  it('does not use the dark slab class', () => {
    const w = mountFooter()
    expect(w.classes()).toContain('landing-footer')
    expect(w.find('.landing-footer--dark').exists()).toBe(false)
  })
})
