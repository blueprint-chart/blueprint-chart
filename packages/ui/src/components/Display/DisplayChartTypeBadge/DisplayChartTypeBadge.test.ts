import { mount } from '@vue/test-utils'
import DisplayChartTypeBadge from './DisplayChartTypeBadge.vue'

vi.mock('~icons/ph/chart-bar', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-bar-horizontal', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-line-up', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-pie-slice', () => ({ default: { render: () => null } }))
vi.mock('~icons/ph/chart-donut', () => ({ default: { render: () => null } }))

describe('DisplayChartTypeBadge', () => {
  it('renders human-readable label', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'line' } })
    expect(wrapper.text()).toBe('Line')
  })

  it('applies badge class', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'pie' } })
    expect(wrapper.classes()).toContain('display-chart-type-badge')
  })

  it('falls back to raw type for unknown chart', () => {
    const wrapper = mount(DisplayChartTypeBadge, { props: { chartType: 'future-chart' } })
    expect(wrapper.text()).toBe('future-chart')
  })
})
