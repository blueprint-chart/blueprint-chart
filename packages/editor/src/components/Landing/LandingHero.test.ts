import { mount } from '@vue/test-utils'
import LandingHero from './LandingHero.vue'

const RouterLinkStub = { template: '<a><slot /></a>', props: ['to'] }

function mountHero() {
  return mount(LandingHero, {
    global: {
      stubs: {
        'router-link': RouterLinkStub,
        'LandingChartPreview': { template: '<div class="chart-stub" />', props: ['bpc'] },
        'AppIcon': { template: '<span />', props: ['name', 'size', 'variant'] },
      },
    },
  })
}

describe('LandingHero', () => {
  it('renders the new headline', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__inner__text__h1').text()).toContain('The open chart format')
    expect(w.find('.landing-hero__inner__text__h1').text()).toContain('AI writes')
  })

  it('renders the eyebrow', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__inner__text__eyebrow').text()).toContain('Open source')
  })

  it('renders the eyebrow as a bc-eyebrow with an accent dot, not a BBadge', () => {
    const w = mountHero()
    const eyebrow = w.find('.landing-hero__inner__text__eyebrow')
    expect(eyebrow.classes()).toContain('bc-eyebrow')
    expect(w.find('.bc-eyebrow__dot').exists()).toBe(true)
    expect(w.findComponent({ name: 'BBadge' }).exists()).toBe(false)
  })

  it('renders CTA buttons', () => {
    const w = mountHero()
    expect(w.text()).toContain('My charts')
    expect(w.text()).toContain('New chart')
  })

  it('does NOT render a badges row', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__inner__text__meta').exists()).toBe(false)
  })

  it('renders the chart preview', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__inner__chart').exists()).toBe(true)
  })
})

describe('LandingHero - grain', () => {
  it('renders a grain layer scoped inside the hero', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__grain').exists()).toBe(true)
  })
})

describe('LandingHero - bold marketing island', () => {
  it('wraps the chart preview in a particle ring', () => {
    const w = mountHero()
    expect(w.find('.bc-ring').exists()).toBe(true)
    expect(w.find('.bc-ring svg rect').exists()).toBe(true)
  })

  it('renders a chartreuse pooled primary CTA', () => {
    const w = mountHero()
    expect(w.find('.btn-bc-primary').exists()).toBe(true)
  })

  it('stamps data-bs-theme=dark so it is an always-dark island regardless of app theme', () => {
    const w = mountHero()
    expect(w.find('.landing-hero').attributes('data-bs-theme')).toBe('dark')
  })
})
