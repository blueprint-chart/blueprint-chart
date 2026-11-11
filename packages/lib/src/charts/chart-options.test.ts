import { describe, it, expect } from 'vitest'
import { buildChartOptions, contrastOverlayColors } from './chart-options'
import { registerChart } from './registry'
import { adjustColorsForBackground } from './contrast'
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

  it('passes a chart-type sortMode through to the renderer', () => {
    const result = buildChartOptions({ sortMode: SortMode.None }, undefined, ChartType.BarSplit)
    expect(result.sortMode).toBe(SortMode.None)
  })

  it('passes areaFill and areaFillBaseline through to line charts', () => {
    const result = buildChartOptions({ areaFill: true, areaFillBaseline: 'zero' }, undefined, ChartType.Line)
    expect(result.areaFill).toBe(true)
    expect(result.areaFillBaseline).toBe('zero')
  })

  it('parses valueLabelEvery to a positive integer', () => {
    expect(buildChartOptions({ valueLabelEvery: '3' }, undefined, 'line').valueLabelEvery).toBe(3)
    expect(buildChartOptions({ valueLabelEvery: '0' }, undefined, 'line').valueLabelEvery).toBeUndefined()
    expect(buildChartOptions({ valueLabelPoints: 'last' }, undefined, 'line').valueLabelPoints).toBe('last')
  })

  it('parses custom tick values into the axis ticks', () => {
    const result = buildChartOptions(
      { verticalTickValues: '0, 50, abc,100', horizontalTickValues: '1 2' },
      undefined,
      ChartType.Scatter,
    )
    expect(result.verticalAxis?.ticks).toEqual([0, 50, 100])
    expect(result.horizontalAxis?.ticks).toEqual([1, 2])
    expect((result as Record<string, unknown>).verticalTickValues).toBeUndefined()
    expect(buildChartOptions({ verticalTickValues: ' ' }, undefined, ChartType.Line).verticalAxis).toBeUndefined()
  })

  it('keeps working with no chart type', () => {
    expect(buildChartOptions({ legend: true }).legend).toBe(true)
  })

  it('adjusts negativeColor for the background when autoContrast is on', () => {
    const result = buildChartOptions({ autoContrast: true, negativeColor: '#ffff00' }, '#ffffff', ChartType.BarVertical)
    expect(result.negativeColor).toBe(adjustColorsForBackground(['#ffff00'], '#ffffff')[0])
    expect(result.negativeColor).not.toBe('#ffff00')
  })

  it('adjusts overlay cue colors for the background when autoContrast is on', () => {
    const overlays = [{ columns: ['T'], aboveColor: '#111111', belowColor: '#222222' }]
    const result = contrastOverlayColors(overlays, { autoContrast: true }, '#000000')
    expect(result[0].aboveColor).not.toBe('#111111')
    expect(result[0].belowColor).not.toBe('#222222')
  })

  it('adjusts the overlay color for the background when autoContrast is on', () => {
    const overlays = [{ columns: ['T'], color: '#111111' }]
    const result = contrastOverlayColors(overlays, { autoContrast: true }, '#000000')
    expect(result[0].color).toBe(adjustColorsForBackground(['#111111'], '#000000')[0])
    expect(result[0].color).not.toBe('#111111')
  })

  it('keeps currentColor on an overlay when autoContrast is on', () => {
    const overlays = [{ columns: ['T'], color: 'currentColor' }]
    const result = contrastOverlayColors(overlays, { autoContrast: true }, '#000000')
    expect(result[0].color).toBe('currentColor')
  })

  it('leaves overlay cue colors alone when autoContrast is off', () => {
    const overlays = [{ columns: ['T'], aboveColor: '#111111' }]
    const result = contrastOverlayColors(overlays, {}, '#000000')
    expect(result).toEqual(overlays)
  })
})
