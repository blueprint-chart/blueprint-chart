import { describe, it, expect } from 'vitest'
import { ChartType } from '@blueprint-chart/lib'
import { chartTypeForColumns } from './wizardChartType'

describe('chartTypeForColumns', () => {
  it('upgrades a single-series type when data has more than two columns', () => {
    expect(chartTypeForColumns(ChartType.BarVertical, 3, false)).toBe(ChartType.BarMulti)
    expect(chartTypeForColumns(ChartType.BarVertical, 3, true)).toBe(ChartType.LineMulti)
  })

  it('does not count overlay columns as bar series', () => {
    const overlays = [{ columns: ['Low', 'High'] }, { columns: ['Last year'] }]
    expect(chartTypeForColumns(ChartType.BarVertical, 5, false, overlays)).toBe(ChartType.BarVertical)
  })

  it('upgrades when columns remain beyond the overlays', () => {
    const overlays = [{ columns: ['Low', 'High'] }]
    expect(chartTypeForColumns(ChartType.BarVertical, 5, false, overlays)).toBe(ChartType.BarMulti)
  })

  it('keeps grouped bars when data has more than two columns', () => {
    expect(chartTypeForColumns(ChartType.BarGrouped, 4, false)).toBe(ChartType.BarGrouped)
  })

  it('keeps scatter when data has more than two columns', () => {
    expect(chartTypeForColumns(ChartType.Scatter, 5, false)).toBe(ChartType.Scatter)
  })

  it('keeps dot plot when data has more than two columns', () => {
    expect(chartTypeForColumns(ChartType.DotPlot, 4, false)).toBe(ChartType.DotPlot)
  })
})
