import { mount } from '@vue/test-utils'
import LandingHero from './LandingHero.vue'

const RouterLinkStub = { template: '<a><slot /></a>', props: ['to'] }

function mountHero() {
  return mount(LandingHero, {
    global: {
      stubs: {
        'router-link': RouterLinkStub,
        'LandingChartPreview': { name: 'LandingChartPreview', template: '<div class="chart-stub" />', props: ['bpc'] },
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

  it('renders the chart with the brand theme and palette (dark surface is forced via CSS)', () => {
    const w = mountHero()
    const preview = w.findComponent({ name: 'LandingChartPreview' })
    expect(preview.props('bpc')).toContain('theme = "blueprint-bold"')
    expect(preview.props('bpc')).toContain('colorPalette = "BlueprintBold"')
  })
})

describe('LandingHero - grain', () => {
  it('renders a grain layer scoped inside the hero', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__grain').exists()).toBe(true)
  })
})

describe('LandingHero - bold marketing island', () => {
  it('rings the hero CTA with the particle ring', () => {
    const w = mountHero()
    const ring = w.find('.bc-ring')
    expect(ring.exists()).toBe(true)
    expect(ring.find('svg rect').exists()).toBe(true)
    // the ring wraps the primary CTA
    expect(ring.find('.btn-bc-primary').exists()).toBe(true)
  })

  it('renders a chartreuse primary CTA', () => {
    const w = mountHero()
    expect(w.find('.btn-bc-primary').exists()).toBe(true)
  })

  it('renders the grid-pool lamp', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__lamp .bc-pool').exists()).toBe(true)
  })

  it('stamps data-bs-theme=dark so it is an always-dark island regardless of app theme', () => {
    const w = mountHero()
    expect(w.find('.landing-hero').attributes('data-bs-theme')).toBe('dark')
  })
})
