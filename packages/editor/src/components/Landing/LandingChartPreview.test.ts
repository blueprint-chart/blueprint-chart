import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingChartPreview from './LandingChartPreview.vue'

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({ theme: { value: 'light' }, cycleTheme: vi.fn() }),
}))

describe('LandingChartPreview', () => {
  it('renders a container element', () => {
    const w = mount(LandingChartPreview, {
      props: { bpc: '' },
    })
    expect(w.find('.landing-chart-preview').exists()).toBe(true)
  })

  it('accepts bpc prop', () => {
    const w = mount(LandingChartPreview, {
      props: { bpc: 'chart bar-vertical { data { "A" = 1 } }' },
    })
    expect(w.props('bpc')).toContain('chart bar-vertical')
  })
})
