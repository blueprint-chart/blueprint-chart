import { describe, it, expect } from 'vitest'
import { parseData, buildChartOptions } from './chart-helpers'
import { Anchor, GridStyle, Interpolation, LegendPosition, StackMode, SymbolShape, SymbolShowOn, SymbolStyle } from '../enums'

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
    const raw = `series = "A","B"
"Jan" = 10,20
"Feb" = 30,40`
    const data = parseData(raw)
    expect(data.labels).toEqual(['Jan', 'Feb'])
    expect(data.series).toHaveLength(2)
    expect(data.series![0]).toEqual({ name: 'A', values: [10, 30] })
    expect(data.series![1]).toEqual({ name: 'B', values: [20, 40] })
  })

  it('parses multi-series data with legacy quoted format', () => {
    const raw = `series = "A,B"
"Jan" = "10,20"
"Feb" = "30,40"`
    const data = parseData(raw)
    expect(data.labels).toEqual(['Jan', 'Feb'])
    expect(data.series).toHaveLength(2)
    expect(data.series![0]).toEqual({ name: 'A', values: [10, 30] })
    expect(data.series![1]).toEqual({ name: 'B', values: [20, 40] })
  })

  it('sets values to first series for multi-series data', () => {
    const raw = `series = "X","Y"
"A" = 5,15`
    const data = parseData(raw)
    expect(data.values).toEqual([5])
  })

  it('returns empty arrays for empty input', () => {
    const data = parseData('')
    expect(data.labels).toEqual([])
    expect(data.values).toEqual([])
  })

  it('treats non-numeric values as missing (undefined), distinguishable from real 0', () => {
    const raw = `"Foo" = abc\n"Bar" = 0`
    const data = parseData(raw)
    expect(data.values[0]).toBeUndefined()
    expect(data.values[1]).toBe(0)
  })

  // ── N8: missing/non-finite cells are distinguishable from real 0 ─

  it('treats missing cells in multi-series rows as undefined, not 0', () => {
    // The second row leaves the second column empty (",")
    const raw = `series = "A","B"\n"Jan" = 10,20\n"Feb" = 30,`
    const data = parseData(raw)
    expect(data.series).toHaveLength(2)
    // Real values come through unchanged.
    expect(data.series![0].values).toEqual([10, 30])
    // Missing trailing cell becomes undefined, not 0.
    expect(data.series![1].values[0]).toBe(20)
    expect(data.series![1].values[1]).toBeUndefined()
  })

  it('treats Infinity / -Infinity / NaN as undefined', () => {
    const raw = `"A" = Infinity\n"B" = -Infinity\n"C" = NaN\n"D" = 0`
    const data = parseData(raw)
    // Infinity and NaN are not finite — they drop out as undefined.
    expect(data.values[0]).toBeUndefined()
    expect(data.values[1]).toBeUndefined()
    expect(data.values[2]).toBeUndefined()
    // A real 0 remains a real 0.
    expect(data.values[3]).toBe(0)
  })

  // ── Thousands separators: a space groups digits, it never marks a decimal ─

  it('reads space-grouped numbers that reach parseData still quoted', () => {
    // dataEntriesToString re-quotes any value that is not a bare number, so the
    // quote characters are still attached by the time parseData sees the cell.
    const raw = `"A" = "8 978"\n"B" = "1 559 275"`
    const data = parseData(raw)
    expect(data.values).toEqual([8978, 1559275])
  })

  it('accepts every space flavour a locale or spreadsheet emits as a group separator', () => {
    const raw = [
      `"plain" = "8 978"`,
      `"nbsp" = "8\u00A0978"`,
      `"narrow nbsp" = "8\u202F978"`,
      `"thin" = "8\u2009978"`,
      `"figure" = "8\u2007978"`,
    ].join('\n')
    const data = parseData(raw)
    expect(data.values).toEqual([8978, 8978, 8978, 8978, 8978])
  })

  it('keeps the sign of a negative space-grouped number', () => {
    const data = parseData(`"A" = "-1 234"`)
    expect(data.values).toEqual([-1234])
  })

  it('reads space-grouped numbers in multi-series rows', () => {
    // Multi-value entries lose their quotes in dataEntriesToString, so these
    // cells arrive bare, and parseFloat used to truncate them to the first group.
    const raw = `series = "A","B"\n"Jan" = 8 978,9 000`
    const data = parseData(raw)
    expect(data.series![0].values).toEqual([8978])
    expect(data.series![1].values).toEqual([9000])
  })

  it('reads a quoted bare number', () => {
    const data = parseData(`"A" = "8978"`)
    expect(data.values).toEqual([8978])
  })

  it('leaves comma and dot alone, since a dot is the decimal separator and a comma groups nothing', () => {
    const raw = `"dot" = 8.978\n"comma" = "1,234"`
    const data = parseData(raw)
    expect(data.values[0]).toBe(8.978)
    // A comma-grouped value stays missing rather than silently reading as 1.
    expect(data.values[1]).toBeUndefined()
  })

  it('still reads percentages, quoted or bare', () => {
    const raw = `"bare" = 35%\n"quoted" = "35%"`
    const data = parseData(raw)
    expect(data.values).toEqual([35, 35])
  })

  it('rejects a value that only looks numeric at its start', () => {
    const data = parseData(`"A" = "2 apples"`)
    expect(data.values[0]).toBeUndefined()
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
    const result = buildChartOptions({ legendPosition: LegendPosition.Bottom, legendAnchor: Anchor.End })
    expect(result.legendPosition).toBe(LegendPosition.Bottom)
    expect(result.legendAnchor).toBe(Anchor.End)
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
      verticalGridStyle: GridStyle.Dashed,
      showVerticalAxis: false,
    })
    expect(result.verticalAxis).toBeDefined()
    expect(result.verticalAxis!.showTicks).toBe(true)
    expect(result.verticalAxis!.gridStyle).toBe(GridStyle.Dashed)
    expect(result.verticalAxis!.showAxis).toBe(false)
  })

  it('passes verticalNumberFormat to verticalAxis.numberFormat', () => {
    const result = buildChartOptions({
      verticalNumberFormat: ',.0f',
    })
    expect(result.verticalAxis).toBeDefined()
    expect(result.verticalAxis!.numberFormat).toBe(',.0f')
  })

  it('passes verticalNumberFormat alongside other axis options', () => {
    const result = buildChartOptions({
      showVerticalTicks: false,
      verticalGridStyle: GridStyle.Dashed,
      showVerticalAxis: false,
      verticalNumberFormat: '$|,.0f|M',
    })
    expect(result.verticalAxis!.numberFormat).toBe('$|,.0f|M')
  })

  it('builds horizontal axis options', () => {
    const result = buildChartOptions({
      showHorizontalTicks: true,
      horizontalGridStyle: GridStyle.Dotted,
    })
    expect(result.horizontalAxis).toBeDefined()
    expect(result.horizontalAxis!.showTicks).toBe(true)
    expect(result.horizontalAxis!.gridStyle).toBe(GridStyle.Dotted)
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
    const result = buildChartOptions({ interpolation: Interpolation.MonotoneX })
    expect(result.interpolation).toBe(Interpolation.MonotoneX)
  })

  it('maps stackMode option', () => {
    const result = buildChartOptions({ stackMode: StackMode.Percent })
    expect(result.stackMode).toBe(StackMode.Percent)
  })

  it('builds lineSymbols config when enabled', () => {
    const result = buildChartOptions({
      lineSymbols: true,
      lineSymbolShape: SymbolShape.Diamond,
      lineSymbolShowOn: SymbolShowOn.All,
      lineSymbolStyle: SymbolStyle.Hollow,
      lineSymbolSize: '5',
      lineSymbolOpacity: '0.8',
    })
    expect(result.lineSymbols).toEqual({
      symbol: SymbolShape.Diamond,
      showOn: SymbolShowOn.All,
      style: SymbolStyle.Hollow,
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

  it('forwards categoryLabelLine when true', () => {
    const result = buildChartOptions({ categoryLabelLine: true })
    expect(result.categoryLabelLine).toBe(true)
  })

  it('forwards categoryLabelLine when false', () => {
    const result = buildChartOptions({ categoryLabelLine: false })
    expect(result.categoryLabelLine).toBe(false)
  })

  it('does not set categoryLabelLine when not specified', () => {
    const result = buildChartOptions({})
    expect(result.categoryLabelLine).toBeUndefined()
  })

  it('passes through connectedColumns when true', () => {
    const result = buildChartOptions({ connectedColumns: true })
    expect(result.connectedColumns).toBe(true)
  })

  it('passes through connectedColumns when false', () => {
    const result = buildChartOptions({ connectedColumns: false })
    expect(result.connectedColumns).toBe(false)
  })

  it('does not set connectedColumns when not specified', () => {
    const result = buildChartOptions({})
    expect(result.connectedColumns).toBeUndefined()
  })

  it('parses connectionsOpacity as float', () => {
    const result = buildChartOptions({ connectionsOpacity: '0.42' })
    expect(result.connectionsOpacity).toBe(0.42)
  })

  it('clamps connectionsOpacity above 1 down to 1', () => {
    const result = buildChartOptions({ connectionsOpacity: '2.5' })
    expect(result.connectionsOpacity).toBe(1)
  })

  it('clamps connectionsOpacity below 0 up to 0', () => {
    const result = buildChartOptions({ connectionsOpacity: '-0.3' })
    expect(result.connectionsOpacity).toBe(0)
  })

  it('ignores non-numeric connectionsOpacity', () => {
    const result = buildChartOptions({ connectionsOpacity: 'abc' })
    expect(result.connectionsOpacity).toBeUndefined()
  })

  it('does not set connectionsOpacity when not specified', () => {
    const result = buildChartOptions({})
    expect(result.connectionsOpacity).toBeUndefined()
  })
})
