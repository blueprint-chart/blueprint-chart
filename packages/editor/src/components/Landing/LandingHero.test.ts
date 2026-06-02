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
