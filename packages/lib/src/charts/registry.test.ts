import { describe, it, expect } from 'vitest'
import { registerChart, getChart, getChartOptions, listCharts } from './registry'
import type { ChartRenderer } from './types'

describe('registry', () => {
  it('lists all registered chart types', () => {
    const charts = listCharts()
    expect(charts).toContain('bar-vertical')
    expect(charts).toContain('bar-horizontal')
    expect(charts).toContain('line')
    expect(charts).toContain('line-multi')
    expect(charts).toContain('donut')
    expect(charts).toContain('pie')
    expect(charts).toContain('area')
    expect(charts).toContain('area-stacked')
    expect(charts).toContain('column-stacked')
    expect(charts).toContain('bar-stacked')
  })

  it('includes aliases in the chart list', () => {
    const charts = listCharts()
    expect(charts).toContain('vertical-bar')
    expect(charts).toContain('horizontal-bar')
  })

  it('getChart returns a renderer function for a known chart type', () => {
    const renderer = getChart('bar-vertical')
    expect(renderer).toBeDefined()
    expect(typeof renderer).toBe('function')
  })

  it('getChart returns undefined for an unknown chart type', () => {
    expect(getChart('nonexistent-chart')).toBeUndefined()
  })

  it('getChartOptions returns option definitions for a known chart type', () => {
    const options = getChartOptions('bar-vertical')
    expect(options.length).toBeGreaterThan(0)
    const keys = options.map(o => o.key)
    expect(keys).toContain('colors')
    expect(keys).toContain('colorPalette')
    expect(keys).toContain('autoContrast')
  })

  it('getChartOptions returns an empty array for an unknown chart type', () => {
    expect(getChartOptions('nonexistent-chart')).toEqual([])
  })

  it('registerChart adds a new chart type that can be retrieved', () => {
    const mockRenderer = (() => {}) as unknown as ChartRenderer
    const mockOptions = [{ key: 'testOpt', type: 'boolean' as const, label: 'Test' }]
    registerChart('__test-chart__', mockRenderer, mockOptions)

    expect(listCharts()).toContain('__test-chart__')
    expect(getChart('__test-chart__')).toBe(mockRenderer)
    expect(getChartOptions('__test-chart__')).toEqual(mockOptions)
  })

  it('line-multi has direct labelling option defaulting to auto', () => {
    const options = getChartOptions('line-multi')
    const directLabel = options.find(o => o.key === 'directLabelling')
    expect(directLabel).toBeDefined()
    expect(directLabel!.default).toBe('auto')
  })

  it('area-stacked does not default directLabelling to auto', () => {
    const options = getChartOptions('area-stacked')
    const directLabel = options.find(o => o.key === 'directLabelling')
    expect(directLabel).toBeDefined()
    expect(directLabel!.default).not.toBe('auto')
  })

  it('pie has displayAsPercentage defaulting to true', () => {
    const options = getChartOptions('pie')
    const opt = options.find(o => o.key === 'displayAsPercentage')
    expect(opt).toBeDefined()
    expect(opt!.default).toBe(true)
  })
})
