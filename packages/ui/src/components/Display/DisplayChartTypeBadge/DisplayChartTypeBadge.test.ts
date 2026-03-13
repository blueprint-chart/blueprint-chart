import { mount } from '@vue/test-utils'
import DisplayChartTypeBadge from './DisplayChartTypeBadge.vue'

vi.mock('~icons/ph/chart-bar', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-bar-horizontal', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-line-up', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-pie-slice', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-donut', () => ({ default: { render: () => null } }))

const stubs = { BBadge: { template: '<span class="badge"><slot /></span>', props: ['variant', 'pill'] } }

describe('DisplayChartTypeBadge', () => {
  it('renders human-readable label', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'line' }, global: { stubs } })
    expect(wrapper.text()).toBe('Line')
  })

  it('applies badge class', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'pie' }, global: { stubs } })
    expect(wrapper.find('.display-chart-type-badge').exists()).toBe(true)
  })

  it('uses light variant by default', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'line' }, global: { stubs } })
    const badge = wrapper.findComponent(stubs.BBadge)
    expect(badge.props('variant')).toBe('light')
  })

  it('uses dark variant when theme is dark', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'line', theme: 'dark' as const }, global: { stubs } })
    const badge = wrapper.findComponent(stubs.BBadge)
    expect(badge.props('variant')).toBe('dark')
  })

  it('falls back to raw type for unknown chart', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'future-chart' }, global: { stubs } })
    expect(wrapper.text()).toBe('future-chart')
  })
})
