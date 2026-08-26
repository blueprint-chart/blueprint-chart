import { describe, it, expect } from 'vitest'
import { buildChartOptions } from './chart-options'
import { registerChart } from './registry'
import { ChartType, ChartOptionType, SortMode } from '../enums'

describe('buildChartOptions option passthrough', () => {
  it('keeps sharedScale for a chart type that registers it', () => {
    const result = buildChartOptions({ sharedScale: true }, undefined, ChartType.BarSplit)
    expect(result.sharedScale).toBe(true)
  })

  it('passes a third-party key registered via registerChart through to the renderer options', () => {
    registerChart('g1-passthrough-probe', () => {}, [
      { key: 'myScale', type: ChartOptionType.Text, label: 'My scale', default: '1' },
    ])
    const result = buildChartOptions({ myScale: '12' } as never, undefined, 'g1-passthrough-probe')
    expect((result as Record<string, unknown>).myScale).toBe('12')
  })

  it('ignores a key that the chart type does not register', () => {
    const result = buildChartOptions({ sharedScale: true }, undefined, ChartType.BarVertical)
    expect(result.sharedScale).toBeUndefined()
  })

  it('leaves the numeric and axis keys to the dedicated builders', () => {
    const result = buildChartOptions(
      { barGap: 'abc', verticalLabelPosition: 'off', lineSymbols: false },
      undefined,
      ChartType.BarVertical,
    )
    expect(result.barGap).toBeUndefined()
    expect(result.lineSymbols).toBeUndefined()
    expect((result as Record<string, unknown>).verticalLabelPosition).toBeUndefined()
    expect(result.verticalAxis?.labelPosition).toBe('off')
  })

  it('drops empty crosshair values like the truthiness guards do', () => {
    const result = buildChartOptions(
      { crosshair: true, crosshairDirection: '', crosshairStyle: '', crosshairColor: '' },
      undefined,
      ChartType.Line,
    )
    expect(result.crosshair).toBe(true)
    expect(result.crosshairDirection).toBeUndefined()
    expect(result.crosshairStyle).toBeUndefined()
    expect(result.crosshairColor).toBeUndefined()
  })

  it('does not let a chart-type sortMode reach the renderer', () => {
    const result = buildChartOptions({ sortMode: SortMode.None }, undefined, ChartType.BarSplit)
    expect(result.sortMode).toBeUndefined()
  })

  it('keeps working with no chart type', () => {
    expect(buildChartOptions({ legend: true }).legend).toBe(true)
  })
})
