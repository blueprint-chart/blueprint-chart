import { describe, it, expect } from 'vitest'
import { getChartTypeDefaults, resolveChartTypeOptions } from './resolve'
import { ChartType, GridStyle } from '../enums'

describe('getChartTypeDefaults', () => {
  it('returns registered defaults for a known chart type', () => {
    const defaults = getChartTypeDefaults(ChartType.LineMulti)
    expect(defaults.verticalGridStyle).toBe(GridStyle.Dashed)
    expect(defaults.horizontalGridStyle).toBe(GridStyle.None)
  })

  it('returns an empty object for an unknown chart type', () => {
    expect(getChartTypeDefaults('not-a-chart')).toEqual({})
  })

  it('memoizes per chart type (same reference on repeat calls)', () => {
    const a = getChartTypeDefaults(ChartType.LineMulti)
    const b = getChartTypeDefaults(ChartType.LineMulti)
    expect(a).toBe(b)
  })
})

describe('resolveChartTypeOptions', () => {
  it('returns defaults when explicit is empty', () => {
    const resolved = resolveChartTypeOptions(ChartType.LineMulti, {})
    expect(resolved.verticalGridStyle).toBe(GridStyle.Dashed)
    expect(resolved.horizontalGridStyle).toBe(GridStyle.None)
  })

  it('lets explicit overrides win over defaults', () => {
    const resolved = resolveChartTypeOptions(ChartType.LineMulti, {
      verticalGridStyle: GridStyle.Solid,
    })
    expect(resolved.verticalGridStyle).toBe(GridStyle.Solid)
  })

  it('suppresses default colorPalette when explicit colors are present', () => {
    const resolved = resolveChartTypeOptions(ChartType.LineMulti, {
      colors: ['#fff'],
    })
    expect(resolved.colorPalette).toBeUndefined()
    expect(resolved.colors).toEqual(['#fff'])
  })

  it('keeps default colorPalette when explicit colors is an empty array', () => {
    const resolved = resolveChartTypeOptions(ChartType.LineMulti, { colors: [] })
    expect(resolved.colorPalette).toBeDefined()
  })

  it('returns explicit unchanged for an unknown chart type', () => {
    const resolved = resolveChartTypeOptions('not-a-chart', {
      verticalGridStyle: GridStyle.Solid,
    })
    expect(resolved).toEqual({ verticalGridStyle: GridStyle.Solid })
  })
})
