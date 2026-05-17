import { shallowRef } from 'vue'
import { mount } from '@vue/test-utils'
import LandingTopNav from './LandingTopNav.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({
    theme: shallowRef('light'),
    resolvedTheme: shallowRef('light'),
    cycleTheme: vi.fn(),
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function mountNav() {
  return mount(LandingTopNav, {
    global: {
      stubs: {
        'router-link': { template: '<a><slot /></a>', props: ['to'] },
        'ButtonIcon': { template: '<button class="btn-stub" :data-label="label"><slot /></button>', props: ['label', 'variant', 'size', 'iconRight', 'iconLeft', 'hideLabel', 'square'] },
        'AppIcon': { template: '<span />', props: ['name', 'size'] },
      },
    },
  })
}

describe('LandingTopNav', () => {
  it('renders the brand name and logo', () => {
    const w = mountNav()
    expect(w.find('.landing-topnav__brand-name').text()).toBe('Blueprint Chart')
    expect(w.find('.landing-topnav__brand-logo').exists()).toBe(true)
  })

  it('renders the four section anchor links', () => {
    const w = mountNav()
    const labels = w.findAll('.landing-topnav__link').map(n => n.text())
    expect(labels).toEqual(['Defaults', 'Transforms', 'Format', 'Scenes'])
  })

  it('renders the GitHub pill', () => {
    const w = mountNav()
    expect(w.find('.landing-topnav__github').exists()).toBe(true)
    expect(w.find('.landing-topnav__github').text()).toContain('GitHub')
  })

  it('renders the My charts and New chart buttons', () => {
    const w = mountNav()
    const labels = w.findAll('.btn-stub').map(n => n.attributes('data-label'))
    expect(labels).toContain('My charts')
    expect(labels).toContain('New chart')
  })

  it('renders the theme toggle button', () => {
    const w = mountNav()
    const labels = w.findAll('.btn-stub').map(n => n.attributes('data-label'))
    expect(labels).toContain('Toggle theme')
  })
})
