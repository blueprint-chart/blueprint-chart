import { mount } from '@vue/test-utils'
import LandingFormat from './LandingFormat.vue'

function mountFormat() {
  return mount(LandingFormat, {
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

describe('LandingFormat', () => {
  it('mounts at the format anchor', () => {
    const w = mountFormat()
    expect(w.find('section').attributes('id')).toBe('format')
  })

  it('renders the mono eyebrow', () => {
    const w = mountFormat()
    expect(w.find('.header-label').text()).toBe('04 / One portable file')
  })

  it('renders the BPC code pane', () => {
    const w = mountFormat()
    expect(w.find('.landing-format__pane__code').exists()).toBe(true)
  })

  it('renders the browser-frame URL pill', () => {
    const w = mountFormat()
    expect(w.find('.landing-format__browser__url').exists()).toBe(true)
    expect(w.find('.landing-format__browser__url').text()).toContain('blueprintchart.com/#/render?bpc64=')
  })

  it('URL bar links to the actual render route', () => {
    const w = mountFormat()
    const bar = w.find('.landing-format__browser__url__bar')
    expect(bar.element.tagName.toLowerCase()).toBe('a')
    const href = bar.attributes('href') ?? ''
    expect(href).toContain('#/render?bpc64=')
    expect(bar.attributes('target')).toBe('_blank')
    expect(bar.attributes('rel')).toBe('noopener')
  })

  it('renders the chart inside the browser frame', () => {
    const w = mountFormat()
    expect(w.find('.landing-format__browser__chart .chart-stub').exists()).toBe(true)
  })

  it('renders 3 portability cards with A/B/C tags', () => {
    const w = mountFormat()
    const cards = w.findAll('.default-card-stub')
    expect(cards).toHaveLength(3)
    expect(cards.map(n => n.attributes('data-tag'))).toEqual(['A', 'B', 'C'])
    expect(cards.map(n => n.attributes('data-title'))).toEqual([
      'No backend',
      'Data stays local',
      'One string ships',
    ])
  })

  it('renders the LLM footnote pill', () => {
    const w = mountFormat()
    expect(w.find('.landing-format__footnote').exists()).toBe(true)
    expect(w.find('.landing-format__footnote').text()).toContain('FYI')
    expect(w.find('.landing-format__footnote').text()).toContain('LLMs')
  })
})
