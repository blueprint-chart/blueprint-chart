import { mount } from '@vue/test-utils'
import LandingChartPreview from './LandingChartPreview.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({ theme: ref('light'), cycleTheme: vi.fn() }),
}))

vi.mock('@/composables/useChartFromDsl', () => ({
  useChartFromDsl: vi.fn(() => ({ applyDsl: vi.fn() })),
  renderDsl: vi.fn(),
  parseDslSceneCount: vi.fn(() => 0),
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

  it('accepts the transparentBackground prop without throwing, default false', () => {
    const w = mount(LandingChartPreview, {
      props: { bpc: '' },
    })
    expect(w.props('transparentBackground')).toBe(false)
  })

  it('accepts transparentBackground=true without throwing', () => {
    const w = mount(LandingChartPreview, {
      props: { bpc: '', transparentBackground: true },
    })
    expect(w.props('transparentBackground')).toBe(true)
  })
})
