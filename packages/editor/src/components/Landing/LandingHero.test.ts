import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingHero from './LandingHero.vue'

const RouterLinkStub = {
  template: '<a><slot /></a>',
  props: ['to'],
}

function mountHero() {
  return mount(LandingHero, {
    global: {
      stubs: {
        'router-link': RouterLinkStub,
        'LandingBadge': { template: '<span><slot /></span>', props: ['label'] },
        'LandingChartPreview': { template: '<div class="chart-stub" />' },
        'AppIcon': { template: '<span />', props: ['name', 'size', 'variant'] },
      },
    },
  })
}

describe('LandingHero', () => {
  it('renders hero heading', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__h1').exists()).toBe(true)
    expect(w.text()).toContain('Turn data into')
  })

  it('renders CTA buttons', () => {
    const w = mountHero()
    expect(w.text()).toContain('My Charts')
    expect(w.text()).toContain('New')
  })

  it('renders badges', () => {
    const w = mountHero()
    const meta = w.find('.landing-hero__meta')
    expect(meta.exists()).toBe(true)
  })

  it('renders chart preview', () => {
    const w = mountHero()
    expect(w.find('.landing-hero__chart').exists()).toBe(true)
  })
})
