import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingFormat from './LandingFormat.vue'

function mountFormat() {
  return mount(LandingFormat, {
    global: {
      stubs: {
        LandingSection: { template: '<div><slot /></div>' },
        LandingSectionHeader: { template: '<div><slot /></div>' },
        LandingChartPreview: { template: '<div class="chart-stub" />' },
        AppIcon: { template: '<span />', props: ['name', 'size', 'variant'] },
      },
    },
  })
}

describe('LandingFormat', () => {
  it('renders BPC code block with actual BPC syntax', () => {
    const w = mountFormat()
    expect(w.find('.format-pane__code').exists()).toBe(true)
    expect(w.text()).toContain('chart bar-vertical')
  })

  it('renders chart preview tile', () => {
    const w = mountFormat()
    expect(w.find('.format__grid__chart-tile').exists()).toBe(true)
  })

  it('renders AI note', () => {
    const w = mountFormat()
    expect(w.find('.format-ai-note').exists()).toBe(true)
    expect(w.text()).toContain('LLM-friendly by design')
  })
})
