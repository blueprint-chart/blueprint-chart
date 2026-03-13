import { mount } from '@vue/test-utils'
import DisplayChartType from './DisplayChartType.vue'

describe('DisplayChartType', () => {
  it('renders human-readable label for known chart type', () => {
    const wrapper = mount(DisplayChartType, { props: { chartType: 'bar-vertical' } })
    expect(wrapper.text()).toBe('Columns')
  })

  it('renders raw type when unknown', () => {
    const wrapper = mount(DisplayChartType, { props: { chartType: 'unknown-chart' } })
    expect(wrapper.text()).toBe('unknown-chart')
  })

  it('applies display-chart-type class', () => {
    const wrapper = mount(DisplayChartType, { props: { chartType: 'line' } })
    expect(wrapper.classes()).toContain('display-chart-type')
  })

  it('renders label for each known chart type', () => {
    const expected: Record<string, string> = {
      'bar-vertical': 'Columns',
      'bar-horizontal': 'Bars',
      'bar-multi': 'Grouped Columns',
      'column-stacked': 'Stacked Columns',
      'bar-stacked': 'Stacked Bars',
      'line': 'Line',
      'line-multi': 'Lines',
      'area': 'Area',
      'area-stacked': 'Stacked Area',
      'donut': 'Donut',
      'pie': 'Pie',
    }
    for (const [type, label] of Object.entries(expected)) {
      const wrapper = mount(DisplayChartType, { props: { chartType: type } })
      expect(wrapper.text()).toBe(label)
    }
  })
})
