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

  it('renders the 01 / Author with AI eyebrow', () => {
    const w = mountMcp()
    expect(w.find('.header-label').text()).toBe('01 / Author with AI')
  })

  it('renders the user message bubble with the prompt', () => {
    const w = mountMcp()
    const bubble = w.find('.landing-mcp__bubble--user')
    expect(bubble.exists()).toBe(true)
    expect(bubble.text()).toContain('letter frequencies')
  })

  it('renders the chart image as the assistant reply', () => {
    const w = mountMcp()
    const img = w.find('.landing-mcp__chart img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toContain('E is the most frequent letter')
  })

  it('renders the 5-step numbered stepper in order', () => {
    const w = mountMcp()
    const items = w.findAll('.landing-mcp__steps__item')
    expect(items).toHaveLength(5)
    expect(items.map(i => i.find('.landing-mcp__steps__t').text())).toEqual([
      expect.stringContaining('Read the handbook'),
      expect.stringContaining('Write the .bpc'),
      expect.stringContaining('Validate'),
      expect.stringContaining('Render'),
      expect.stringContaining('Iterate'),
    ])
  })

  it('renders the install command', () => {
    const w = mountMcp()
    expect(w.find('.landing-mcp__install__cmd').text()).toContain('claude mcp add blueprint-chart')
  })

  it('CTA reads "Read the docs" and links to the docs guide in a new tab', () => {
    const w = mountMcp()
    const cta = w.find('.landing-mcp__cta')
    expect(cta.text()).toContain('Read the docs')
    expect(cta.attributes('href')).toBe('https://docs.blueprintchart.com/guide/mcp')
    expect(cta.attributes('target')).toBe('_blank')
    expect(cta.attributes('rel')).toBe('noopener noreferrer')
  })
})
