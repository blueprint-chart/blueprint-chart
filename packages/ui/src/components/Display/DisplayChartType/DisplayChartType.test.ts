import { mount } from '@vue/test-utils'
import { ChartType } from '../../../enums'
import DisplayChartType from './DisplayChartType.vue'

describe('DisplayChartType', () => {
  it('renders human-readable label for known chart type', () => {
    const wrapper = mount(DisplayChartType, { props: { chartType: ChartType.BarVertical } })
    expect(wrapper.text()).toBe('Columns')
  })

  it('renders raw type when unknown', () => {
    const wrapper = mount(DisplayChartType, { props: { chartType: 'unknown-chart' } })
    expect(wrapper.text()).toBe('unknown-chart')
  })

  it('applies display-chart-type class', () => {
    const wrapper = mount(DisplayChartType, { props: { chartType: ChartType.Line } })
    expect(wrapper.classes()).toContain('display-chart-type')
  })

  it('renders label for each known chart type', () => {
    const expected: Record<string, string> = {
      [ChartType.BarVertical]: 'Columns',
      [ChartType.BarHorizontal]: 'Bars',
      [ChartType.BarMulti]: 'Grouped Columns',
      [ChartType.ColumnStacked]: 'Stacked Columns',
      [ChartType.BarStacked]: 'Stacked Bars',
      [ChartType.Line]: 'Line',
      [ChartType.LineMulti]: 'Lines',
      [ChartType.Area]: 'Area',
      [ChartType.AreaStacked]: 'Areas',
      [ChartType.Donut]: 'Donut',
      [ChartType.Pie]: 'Pie',
    }
    for (const [type, label] of Object.entries(expected)) {
      const wrapper = mount(DisplayChartType, { props: { chartType: type } })
      expect(wrapper.text()).toBe(label)
    }
  })
})
