import { describe, it, expect } from 'vitest'
import { getChart, getChartOptions, listCharts } from './registry'

describe('chart registry types', () => {
  it('has all 7 chart types registered', () => {
    const names = listCharts()
    expect(names).toContain('bar-vertical')
    expect(names).toContain('bar-horizontal')
    expect(names).toContain('bar-multi')
    expect(names).toContain('line')
    expect(names).toContain('line-multi')
    expect(names).toContain('donut')
    expect(names).toContain('pie')
  })

  it('returns a function for each chart type', () => {
    const chart = getChart('bar-vertical')
    expect(typeof chart).toBe('function')
  })

  it('lists all registered names including aliases', () => {
    const names = listCharts()
    expect(names).toHaveLength(9)
  })
})

describe('chart registry aliases', () => {
  it('has aliases registered', () => {
    expect(getChart('vertical-bar')).toBe(getChart('bar-vertical'))
    expect(getChart('horizontal-bar')).toBe(getChart('bar-horizontal'))
  })

  it('returns undefined for unknown chart', () => {
    expect(getChart('unknown-chart')).toBeUndefined()
  })
})

describe('getChartOptions axis types', () => {
  it('returns option defs for axis chart types', () => {
    const opts = getChartOptions('bar-vertical')
    const keys = opts.map(o => o.key)
    expect(keys).toContain('colors')
    expect(keys).toContain('showVerticalTicks')
    expect(keys).toContain('verticalGridStyle')
    expect(keys).toContain('verticalNumberFormat')
    expect(keys).toContain('showHorizontalTicks')
    expect(keys).toContain('horizontalGridStyle')
    expect(keys).toContain('horizontalNumberFormat')
    expect(keys).not.toContain('legend')
  })

  it('option defs have correct structure', () => {
    const opts = getChartOptions('line')
    const gridStyle = opts.find(o => o.key === 'verticalGridStyle')
    expect(gridStyle).toBeDefined()
    expect(gridStyle!.type).toBe('select')
    expect(gridStyle!.choices).toHaveLength(4)
    expect(gridStyle!.default).toBe('dashed')
  })
})

describe('getChartOptions multi and arc types', () => {
  it('returns legend for multi-series and donut/pie types', () => {
    for (const type of ['bar-multi', 'line-multi', 'donut', 'pie']) {
      const keys = getChartOptions(type).map(o => o.key)
      expect(keys).toContain('legend')
      expect(keys).toContain('colors')
    }
  })

  it('donut/pie have no axis options', () => {
    for (const type of ['donut', 'pie']) {
      const keys = getChartOptions(type).map(o => o.key)
      expect(keys).not.toContain('showVerticalTicks')
      expect(keys).not.toContain('verticalGridStyle')
    }
  })
})

describe('getChartOptions edge cases', () => {
  it('returns empty array for unknown chart type', () => {
    expect(getChartOptions('unknown')).toEqual([])
  })

  it('aliases return same options as their target', () => {
    const barVertOpts = getChartOptions('bar-vertical')
    const aliasOpts = getChartOptions('vertical-bar')
    expect(aliasOpts.map(o => o.key)).toEqual(barVertOpts.map(o => o.key))
  })
})
