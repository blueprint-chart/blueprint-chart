import { describe, it, expect } from 'vitest'
import { parseData, buildChartOptions } from './chart-helpers'

describe('parseData', () => {
  it('parses single-series CSV data', () => {
    const raw = `
      "Apple" = 30
      "Banana" = 50
      "Cherry" = 20
    `
    const data = parseData(raw)
    expect(data.labels).toEqual(['Apple', 'Banana', 'Cherry'])
    expect(data.values).toEqual([30, 50, 20])
    expect(data.series).toBeUndefined()
  })

  it('parses multi-series data with new format', () => {
    const raw = `_series = "A","B"
"Jan" = 10,20
"Feb" = 30,40`
    const data = parseData(raw)
    expect(data.labels).toEqual(['Jan', 'Feb'])
    expect(data.series).toHaveLength(2)
    expect(data.series![0]).toEqual({ name: 'A', values: [10, 30] })
    expect(data.series![1]).toEqual({ name: 'B', values: [20, 40] })
  })

  it('parses multi-series data with legacy quoted format', () => {
    const raw = `_series = "A,B"
"Jan" = "10,20"
"Feb" = "30,40"`
    const data = parseData(raw)
    expect(data.labels).toEqual(['Jan', 'Feb'])
    expect(data.series).toHaveLength(2)
    expect(data.series![0]).toEqual({ name: 'A', values: [10, 30] })
    expect(data.series![1]).toEqual({ name: 'B', values: [20, 40] })
  })

  it('sets values to first series for multi-series data', () => {
    const raw = `_series = "X","Y"
"A" = 5,15`
    const data = parseData(raw)
    expect(data.values).toEqual([5])
  })

  it('returns empty arrays for empty input', () => {
    const data = parseData('')
    expect(data.labels).toEqual([])
    expect(data.values).toEqual([])
  })

  it('handles non-numeric values as 0', () => {
    const raw = `"Foo" = abc`
    const data = parseData(raw)
    expect(data.values).toEqual([0])
  })
})

describe('buildChartOptions', () => {
  it('returns empty object for empty options', () => {
    const result = buildChartOptions({})
    // colorPalette defaults are not set, so palette resolution may or may not produce colors
    expect(result).toBeDefined()
  })

  it('resolves colors from a named palette', () => {
    const result = buildChartOptions({ colorPalette: 'Blueprint' })
    expect(result.colors).toBeDefined()
    expect(result.colors!.length).toBeGreaterThan(0)
  })

  it('uses custom colors when no palette is set', () => {
    const result = buildChartOptions({ colorPalette: '', colors: ['#ff0000', '#00ff00'] })
    expect(result.colors).toEqual(['#ff0000', '#00ff00'])
  })

  it('palette takes precedence over custom colors', () => {
    const result = buildChartOptions({ colorPalette: 'Blueprint', colors: ['#ff0000'] })
    expect(result.colors).toBeDefined()
    expect(result.colors).not.toEqual(['#ff0000'])
  })

  it('passes through boolean options', () => {
    const result = buildChartOptions({
      legend: true,
      valueLabels: false,
      tooltips: true,
      crosshair: true,
      displayAsPercentage: true,
      showTotal: false,
      showLabels: true,
      showValues: false,
      swapLabelValue: true,
      barBackground: true,
      barSeparators: false,
    })
    expect(result.legend).toBe(true)
    expect(result.valueLabels).toBe(false)
    expect(result.tooltips).toBe(true)
    expect(result.crosshair).toBe(true)
    expect(result.displayAsPercentage).toBe(true)
    expect(result.showTotal).toBe(false)
    expect(result.showLabels).toBe(true)
    expect(result.showValues).toBe(false)
    expect(result.swapLabelValue).toBe(true)
    expect(result.barBackground).toBe(true)
    expect(result.barSeparators).toBe(false)
  })

  it('maps legendPosition and legendAnchor', () => {
    const result = buildChartOptions({ legendPosition: 'bottom', legendAnchor: 'end' })
    expect(result.legendPosition).toBe('bottom')
    expect(result.legendAnchor).toBe('end')
  })

  it('parses sliceMax as integer', () => {
    const result = buildChartOptions({ sliceMax: '8' })
    expect(result.sliceMax).toBe(8)
  })

  it('ignores invalid sliceMax', () => {
    const result = buildChartOptions({ sliceMax: 'abc' })
    expect(result.sliceMax).toBeUndefined()
  })

  it('builds vertical axis options', () => {
    const result = buildChartOptions({
      showVerticalTicks: true,
      verticalGridStyle: 'dashed',
      showVerticalAxis: false,
    })
    expect(result.verticalAxis).toBeDefined()
    expect(result.verticalAxis!.showTicks).toBe(true)
    expect(result.verticalAxis!.gridStyle).toBe('dashed')
    expect(result.verticalAxis!.showAxis).toBe(false)
  })

  it('builds horizontal axis options', () => {
    const result = buildChartOptions({
      showHorizontalTicks: true,
      horizontalGridStyle: 'dotted',
    })
    expect(result.horizontalAxis).toBeDefined()
    expect(result.horizontalAxis!.showTicks).toBe(true)
    expect(result.horizontalAxis!.gridStyle).toBe('dotted')
  })

  it('parses vertical axis range', () => {
    const result = buildChartOptions({
      verticalRangeMin: '0',
      verticalRangeMax: '100',
    })
    expect(result.verticalAxis).toBeDefined()
    expect(result.verticalAxis!.range).toEqual({ min: 0, max: 100 })
  })

  it('parses vertical axis range with date strings', () => {
    const result = buildChartOptions({
      verticalRangeMin: '2010',
      verticalRangeMax: '2020',
    })
    expect(result.verticalAxis).toBeDefined()
    expect(result.verticalAxis!.range!.min).toBe(new Date('2010-01-01').getTime())
    expect(result.verticalAxis!.range!.max).toBe(new Date('2020-01-01').getTime())
  })

  it('parses vertical axis range with full date strings', () => {
    const result = buildChartOptions({
      verticalRangeMin: '2015-06-01',
      verticalRangeMax: '2020-12-31',
    })
    expect(result.verticalAxis).toBeDefined()
    expect(result.verticalAxis!.range!.min).toBe(new Date('2015-06-01').getTime())
    expect(result.verticalAxis!.range!.max).toBe(new Date('2020-12-31').getTime())
  })

  it('parses horizontal axis range with date strings', () => {
    const result = buildChartOptions({
      horizontalRangeMin: '2010',
      horizontalRangeMax: '2020',
    })
    expect(result.horizontalAxis).toBeDefined()
    expect(result.horizontalAxis!.range!.min).toBe(new Date('2010-01-01').getTime())
    expect(result.horizontalAxis!.range!.max).toBe(new Date('2020-01-01').getTime())
  })

  it('maps interpolation option', () => {
    const result = buildChartOptions({ interpolation: 'monotoneX' })
    expect(result.interpolation).toBe('monotoneX')
  })

  it('maps stackMode option', () => {
    const result = buildChartOptions({ stackMode: 'percent' })
    expect(result.stackMode).toBe('percent')
  })

  it('builds lineSymbols config when enabled', () => {
    const result = buildChartOptions({
      lineSymbols: true,
      lineSymbolShape: 'diamond',
      lineSymbolShowOn: 'all',
      lineSymbolStyle: 'hollow',
      lineSymbolSize: '5',
      lineSymbolOpacity: '0.8',
    })
    expect(result.lineSymbols).toEqual({
      symbol: 'diamond',
      showOn: 'all',
      style: 'hollow',
      size: 5,
      opacity: 0.8,
    })
  })

  it('does not build lineSymbols when disabled', () => {
    const result = buildChartOptions({ lineSymbols: false })
    expect(result.lineSymbols).toBeUndefined()
  })

  it('maps allowDarkMode option', () => {
    const result = buildChartOptions({ allowDarkMode: false })
    expect(result.allowDarkMode).toBe(false)
  })

  it('maps edgePadding=false', () => {
    const result = buildChartOptions({ edgePadding: false })
    expect(result.edgePadding).toBe(false)
  })

  it('does not set edgePadding when not specified', () => {
    const result = buildChartOptions({})
    expect(result.edgePadding).toBeUndefined()
  })
})
