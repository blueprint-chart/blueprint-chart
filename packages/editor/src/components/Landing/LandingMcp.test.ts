import { mount } from '@vue/test-utils'
import LandingMcp from './LandingMcp.vue'

function mountMcp() {
  return mount(LandingMcp, {
    global: {
      stubs: {
        LandingSection: { template: '<section :id="id"><slot /></section>', props: ['id'] },
        LandingSectionHeader: {
          template: '<header><div class="header-label">{{ label }}</div><slot /><slot name="lead" /></header>',
          props: ['label'],
        },
        LandingChartPreview: { template: '<div class="chart-stub" />', props: ['bpc'] },
        AppIcon: { template: '<span />' },
      },
    },
  })
}

describe('LandingMcp', () => {
  it('mounts at the mcp anchor', () => {
    const w = mountMcp()
    expect(w.find('section').attributes('id')).toBe('mcp')
  })

  it('renders the 05 / Author with AI eyebrow', () => {
    const w = mountMcp()
    expect(w.find('.header-label').text()).toBe('05 / Author with AI')
  })

  it('renders the user prompt bubble', () => {
    const w = mountMcp()
    const bubble = w.find('.landing-mcp__chat__bubble--user')
    expect(bubble.exists()).toBe(true)
    expect(bubble.text()).toContain('letter frequencies')
  })

  it('renders the real chart preview inside the chat', () => {
    const w = mountMcp()
    expect(w.find('.landing-mcp__chat__chart .chart-stub').exists()).toBe(true)
  })

  it('renders the 5-step pipeline', () => {
    const w = mountMcp()
    const chips = w.findAll('.landing-mcp__pipeline__chip')
    expect(chips).toHaveLength(5)
    expect(chips.map(c => c.text())).toEqual([
      'read handbook', 'write .bpc', 'validate', 'render', 'iterate',
    ])
  })

  it('renders the install command', () => {
    const w = mountMcp()
    expect(w.find('.landing-mcp__install__cmd').text()).toContain('claude mcp add blueprint-chart')
  })

  it('CTA links to the MCP repo in a new tab', () => {
    const w = mountMcp()
    const cta = w.find('.landing-mcp__cta')
    expect(cta.attributes('href')).toBe('https://github.com/blueprint-chart/mcp')
    expect(cta.attributes('target')).toBe('_blank')
    expect(cta.attributes('rel')).toBe('noopener noreferrer')
  })
})
