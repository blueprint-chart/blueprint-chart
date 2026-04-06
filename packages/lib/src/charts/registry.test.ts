import { describe, it, expect } from 'vitest'
import { registerChart, getChart, getChartOptions, listCharts } from './registry'
import type { ChartRenderer } from './types'
import { ChartType, ChartOptionType, DirectLabelMode, SortMode } from '../enums'

describe('registry', () => {
  it('lists all registered chart types', () => {
    const charts = listCharts()
    expect(charts).toContain(ChartType.BarVertical)
    expect(charts).toContain(ChartType.BarHorizontal)
    expect(charts).toContain(ChartType.Line)
    expect(charts).toContain(ChartType.LineMulti)
    expect(charts).toContain(ChartType.Donut)
    expect(charts).toContain(ChartType.Pie)
    expect(charts).toContain(ChartType.Area)
    expect(charts).toContain(ChartType.AreaStacked)
    expect(charts).toContain(ChartType.ColumnStacked)
    expect(charts).toContain(ChartType.BarStacked)
  })

  it('includes aliases in the chart list', () => {
    const charts = listCharts()
    expect(charts).toContain(ChartType.VerticalBar)
    expect(charts).toContain(ChartType.HorizontalBar)
  })

  it('getChart returns a renderer function for a known chart type', () => {
    const renderer = getChart(ChartType.BarVertical)
    expect(renderer).toBeDefined()
    expect(typeof renderer).toBe('function')
  })

  it('getChart returns undefined for an unknown chart type', () => {
    expect(getChart('nonexistent-chart')).toBeUndefined()
  })

  it('getChartOptions returns option definitions for a known chart type', () => {
    const options = getChartOptions(ChartType.BarVertical)
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
    const mockOptions = [{ key: 'testOpt', type: ChartOptionType.Boolean, label: 'Test' }]
    registerChart('__test-chart__', mockRenderer, mockOptions)

    expect(listCharts()).toContain('__test-chart__')
    expect(getChart('__test-chart__')).toBe(mockRenderer)
    expect(getChartOptions('__test-chart__')).toEqual(mockOptions)
  })

  it('line-multi has direct labelling option defaulting to auto', () => {
    const options = getChartOptions(ChartType.LineMulti)
    const directLabel = options.find(o => o.key === 'directLabelling')
    expect(directLabel).toBeDefined()
    expect(directLabel!.default).toBe(DirectLabelMode.Auto)
  })

  it('area-stacked does not default directLabelling to auto', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const directLabel = options.find(o => o.key === 'directLabelling')
    expect(directLabel).toBeDefined()
    expect(directLabel!.default).not.toBe(DirectLabelMode.Auto)
  })

  it('area-stacked has stacked option defaulting to true', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const opt = options.find(o => o.key === 'stacked')
    expect(opt).toBeDefined()
    expect(opt!.default).toBe(true)
  })

  it('area-stacked has stackPercent option defaulting to false', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const opt = options.find(o => o.key === 'stackPercent')
    expect(opt).toBeDefined()
    expect(opt!.default).toBe(false)
  })

  it('area-stacked has areaLines option defaulting to true', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const opt = options.find(o => o.key === 'areaLines')
    expect(opt).toBeDefined()
    expect(opt!.default).toBe(true)
  })

  it('area-stacked has areaSortMode option defaulting to none', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const opt = options.find(o => o.key === 'areaSortMode')
    expect(opt).toBeDefined()
    expect(opt!.default).toBe(SortMode.None)
  })

  it('area-stacked has areaFillOpacity option', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const opt = options.find(o => o.key === 'areaFillOpacity')
    expect(opt).toBeDefined()
  })

  it('area-stacked does not have stackMode option', () => {
    const options = getChartOptions(ChartType.AreaStacked)
    const keys = options.map(o => o.key)
    expect(keys).not.toContain('stackMode')
  })

  it.each([ChartType.Line, ChartType.LineMulti, ChartType.Area])('%s does not have valueLabelPosition option', (chartType) => {
    const options = getChartOptions(chartType)
    const keys = options.map(o => o.key)
    expect(keys).not.toContain('valueLabelPosition')
  })

  it.each([ChartType.BarVertical, ChartType.BarHorizontal, ChartType.BarMulti])('%s has valueLabelPosition option', (chartType) => {
    const options = getChartOptions(chartType)
    const keys = options.map(o => o.key)
    expect(keys).toContain('valueLabelPosition')
  })

  it('pie has displayAsPercentage defaulting to true', () => {
    const options = getChartOptions(ChartType.Pie)
    const opt = options.find(o => o.key === 'displayAsPercentage')
    expect(opt).toBeDefined()
    expect(opt!.default).toBe(true)
  })
})
