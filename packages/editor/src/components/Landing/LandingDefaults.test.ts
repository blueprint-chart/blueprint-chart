import { mount } from '@vue/test-utils'
import LandingDefaults from './LandingDefaults.vue'

function mountDefaults() {
  return mount(LandingDefaults, {
    global: {
      stubs: {
        LandingSection: { template: '<section :id="id"><slot /></section>', props: ['id'] },
        LandingSectionHeader: {
          template: '<header><div class="header-label">{{ label }}</div><slot /><slot name="lead" /></header>',
          props: ['label'],
        },
        LandingChartPreview: { template: '<div class="chart-stub" />', props: ['bpc'] },
        LandingDefaultCard: {
          template: '<div class="default-card-stub" :data-title="title" :data-tag="tag" />',
          props: ['icon', 'tag', 'title', 'description'],
        },
        AppIcon: { template: '<span />' },
      },
    },
  })
}

describe('LandingDefaults', () => {
  it('renders a section with the defaults anchor', () => {
    const w = mountDefaults()
    expect(w.find('section').attributes('id')).toBe('defaults')
  })

  it('renders the mono eyebrow', () => {
    const w = mountDefaults()
    expect(w.find('.header-label').text()).toBe('03 / Defaults')
  })

  it('renders the chart preview', () => {
    const w = mountDefaults()
    expect(w.find('.chart-stub').exists()).toBe(true)
  })

  it('keeps the newsroom-rigor credibility line in the lead', () => {
    const w = mountDefaults()
    expect(w.text()).toContain('the same rigor newsrooms rely on')
  })

  it('renders 6 default cards in the expected order', () => {
    const w = mountDefaults()
    const titles = w.findAll('.default-card-stub').map(n => n.attributes('data-title'))
    expect(titles).toEqual([
      'Axes start at zero',
      'Direct labels',
      'No chart junk',
      'CVD-safe palettes',
      'Mobile-first',
      'Source attribution',
    ])
  })

  it('uses 01–06 mono tags', () => {
    const w = mountDefaults()
    const tags = w.findAll('.default-card-stub').map(n => n.attributes('data-tag'))
    expect(tags).toEqual(['01', '02', '03', '04', '05', '06'])
  })
})
