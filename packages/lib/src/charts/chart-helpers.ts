import { resolvePalette } from './palettes'
import { adjustColorsForBackground } from './contrast'
import type { ChartData, ChartOptions, ChartTypeOptions } from './types'
import { parseDate } from './date-parse'

function parseDateOrNumber(s: string): number | undefined {
  const trimmed = s.trim()
  if (!trimmed) {
    return undefined
  }
  // Try date first — "2020" should become epoch ms for Jan 1 2020,
  // not the number 2020 (which would be 1970 + 2020ms via new Date())
  const d = parseDate(trimmed)
  if (d) {
    return d.getTime()
  }
  const n = parseFloat(trimmed)
  if (!isNaN(n)) {
    return n
  }
  return undefined
}

function parseMultiSeriesData(lines: string[], seriesMatch: RegExpMatchArray): ChartData {
  const seriesNames = seriesMatch[1].split(',').map(s => s.trim())
  const seriesValues: number[][] = seriesNames.map(() => [])
  const labels: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const match = lines[i].match(/^"([^"]+)"\s*=\s*"([^"]*)"$/)
    if (match) {
      labels.push(match[1])
      const vals = match[2].split(',')
      for (let s = 0; s < seriesNames.length; s++) {
        seriesValues[s].push(Number.parseFloat(vals[s]?.trim() ?? '') || 0)
      }
    }
  }

  const series = seriesNames.map((name, i) => ({ name, values: seriesValues[i] }))
  return { labels, values: seriesValues[0] ?? [], series }
}

export function parseData(raw: string): ChartData {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

  const seriesMatch = lines[0]?.match(/^_series\s*=\s*"(.+)"$/)
  if (seriesMatch) {
    return parseMultiSeriesData(lines, seriesMatch)
  }

  const labels: string[] = []
  const values: number[] = []
  for (const line of lines) {
    const match = line.match(/^"([^"]+)"\s*=\s*(.+)$/)
    if (match) {
      labels.push(match[1])
      values.push(Number.parseFloat(match[2]) || 0)
    }
  }
  return { labels, values }
}

function applyColorOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>, backgroundColor?: string): void {
  const paletteColors = resolvePalette(opts.colorPalette)
  if (paletteColors) {
    result.colors = paletteColors
  }
  else if (opts.colors && opts.colors.length > 0) {
    result.colors = opts.colors
  }

  if (opts.autoContrast && backgroundColor && result.colors) {
    result.colors = adjustColorsForBackground(result.colors, backgroundColor)
  }
}

function applyLegendOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>): void {
  if (opts.allowDarkMode !== undefined) {
    result.allowDarkMode = opts.allowDarkMode
  }
  if (opts.legend !== undefined) {
    result.legend = opts.legend
  }
  if (opts.interpolation !== undefined) {
    result.interpolation = opts.interpolation
  }
  if (opts.legendPosition !== undefined) {
    result.legendPosition = opts.legendPosition as 'top' | 'bottom' | 'left' | 'right'
  }
  if (opts.legendAnchor !== undefined) {
    result.legendAnchor = opts.legendAnchor as 'start' | 'middle' | 'end'
  }
  if (opts.directLabelling !== undefined) {
    result.directLabelling = opts.directLabelling
  }
  if (opts.directLabelAnchor !== undefined) {
    result.directLabelAnchor = opts.directLabelAnchor as 'start' | 'middle' | 'end'
  }
}

function hasVerticalAxisOptions(opts: Partial<ChartTypeOptions>): boolean {
  return opts.showVerticalTicks !== undefined || opts.verticalGridStyle !== undefined
    || opts.verticalNumberFormat !== undefined || opts.showVerticalAxis !== undefined
    || opts.verticalAxisDirection !== undefined || opts.verticalScaleType !== undefined
    || opts.verticalLabelPosition !== undefined || !!opts.verticalRangeMin || !!opts.verticalRangeMax
}

function applyVerticalAxisFields(axis: NonNullable<ChartOptions['verticalAxis']>, opts: Partial<ChartTypeOptions>): void {
  if (opts.showVerticalTicks !== undefined) {
    axis.showTicks = opts.showVerticalTicks
  }
  if (opts.verticalAxisDirection !== undefined) {
    axis.direction = opts.verticalAxisDirection as 'left' | 'right'
  }
  if (opts.verticalGridStyle !== undefined) {
    axis.gridStyle = opts.verticalGridStyle
  }
  if (opts.verticalNumberFormat !== undefined) {
    axis.numberFormat = opts.verticalNumberFormat
  }
  if (opts.showVerticalAxis !== undefined) {
    axis.showAxis = opts.showVerticalAxis
  }
  if (opts.verticalScaleType !== undefined) {
    axis.scaleType = opts.verticalScaleType
  }
  if (opts.verticalLabelPosition !== undefined) {
    axis.labelPosition = opts.verticalLabelPosition as 'auto' | 'inside' | 'outside' | 'off'
  }
}

function applyVerticalAxisRange(axis: NonNullable<ChartOptions['verticalAxis']>, opts: Partial<ChartTypeOptions>): void {
  const vMin = parseFloat(opts.verticalRangeMin ?? '')
  const vMax = parseFloat(opts.verticalRangeMax ?? '')
  if (!isNaN(vMin) || !isNaN(vMax)) {
    axis.range = {}
    if (!isNaN(vMin)) {
      axis.range.min = vMin
    }
    if (!isNaN(vMax)) {
      axis.range.max = vMax
    }
  }
}

function applyVerticalAxisOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>): void {
  if (!hasVerticalAxisOptions(opts)) {
    return
  }
  result.verticalAxis = {}
  applyVerticalAxisFields(result.verticalAxis, opts)
  applyVerticalAxisRange(result.verticalAxis, opts)
}

function hasHorizontalAxisOptions(opts: Partial<ChartTypeOptions>): boolean {
  return opts.showHorizontalTicks !== undefined || opts.horizontalGridStyle !== undefined
    || opts.horizontalNumberFormat !== undefined || opts.showHorizontalAxis !== undefined
    || opts.horizontalScaleType !== undefined || opts.horizontalLabelPosition !== undefined
    || !!opts.horizontalRangeMin || !!opts.horizontalRangeMax
}

function applyHorizontalAxisFields(axis: NonNullable<ChartOptions['horizontalAxis']>, opts: Partial<ChartTypeOptions>): void {
  if (opts.showHorizontalTicks !== undefined) {
    axis.showTicks = opts.showHorizontalTicks
  }
  if (opts.horizontalGridStyle !== undefined) {
    axis.gridStyle = opts.horizontalGridStyle
  }
  if (opts.horizontalNumberFormat !== undefined) {
    axis.numberFormat = opts.horizontalNumberFormat
  }
  if (opts.showHorizontalAxis !== undefined) {
    axis.showAxis = opts.showHorizontalAxis
  }
  if (opts.horizontalScaleType !== undefined) {
    axis.scaleType = opts.horizontalScaleType
  }
  if (opts.horizontalLabelPosition !== undefined) {
    axis.labelPosition = opts.horizontalLabelPosition as 'auto' | 'inside' | 'outside' | 'off'
  }
}

function applyHorizontalAxisRange(axis: NonNullable<ChartOptions['horizontalAxis']>, opts: Partial<ChartTypeOptions>): void {
  const hMin = parseDateOrNumber(opts.horizontalRangeMin ?? '')
  const hMax = parseDateOrNumber(opts.horizontalRangeMax ?? '')
  if (hMin !== undefined || hMax !== undefined) {
    axis.range = {}
    if (hMin !== undefined) {
      axis.range.min = hMin
    }
    if (hMax !== undefined) {
      axis.range.max = hMax
    }
  }
}

function applyHorizontalAxisOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>): void {
  if (!hasHorizontalAxisOptions(opts)) {
    return
  }
  result.horizontalAxis = {}
  applyHorizontalAxisFields(result.horizontalAxis, opts)
  applyHorizontalAxisRange(result.horizontalAxis, opts)
}

function applyInteractionOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>): void {
  if (opts.valueLabels !== undefined) {
    result.valueLabels = opts.valueLabels
  }
  if (opts.valueLabelPosition !== undefined) {
    result.valueLabelPosition = opts.valueLabelPosition as 'inside' | 'outside' | 'auto'
  }
  if (opts.tooltips !== undefined) {
    result.tooltips = opts.tooltips
  }
  if (opts.crosshair !== undefined) {
    result.crosshair = opts.crosshair
  }
  if (opts.crosshairDirection) {
    result.crosshairDirection = opts.crosshairDirection as 'both' | 'vertical' | 'horizontal'
  }
  if (opts.crosshairStyle) {
    result.crosshairStyle = opts.crosshairStyle as 'solid' | 'dashed' | 'dotted'
  }
  if (opts.crosshairColor) {
    result.crosshairColor = opts.crosshairColor
  }
}

function applySliceOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>): void {
  if (opts.displayAsPercentage !== undefined) {
    result.displayAsPercentage = opts.displayAsPercentage
  }
  if (opts.showTotal !== undefined) {
    result.showTotal = opts.showTotal
  }
  if (opts.showLabels !== undefined) {
    result.showLabels = opts.showLabels
  }
  if (opts.showValues !== undefined) {
    result.showValues = opts.showValues
  }
  const sliceMax = parseInt(opts.sliceMax ?? '', 10)
  if (!isNaN(sliceMax) && sliceMax > 0) {
    result.sliceMax = sliceMax
  }
  if (opts.sliceGroupLabel !== undefined) {
    result.sliceGroupLabel = opts.sliceGroupLabel
  }
}

function applyLineSymbolOptions(result: Partial<ChartOptions>, opts: Partial<ChartTypeOptions>): void {
  if (!opts.lineSymbols) {
    return
  }
  result.lineSymbols = {
    symbol: (opts.lineSymbolShape as 'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star') ?? 'circle',
    showOn: (opts.lineSymbolShowOn as 'all' | 'first' | 'last' | 'firstLast') ?? 'firstLast',
    style: (opts.lineSymbolStyle as 'filled' | 'hollow') ?? 'filled',
    size: parseFloat(opts.lineSymbolSize ?? '3.5') || 3.5,
    opacity: parseFloat(opts.lineSymbolOpacity ?? '1') || 1,
  }
}

export function buildChartOptions(opts: Partial<ChartTypeOptions>, backgroundColor?: string): Partial<ChartOptions> {
  const result: Partial<ChartOptions> = {}

  applyColorOptions(result, opts, backgroundColor)
  applyLegendOptions(result, opts)
  applyVerticalAxisOptions(result, opts)
  applyHorizontalAxisOptions(result, opts)
  applyInteractionOptions(result, opts)
  applySliceOptions(result, opts)
  applyLineSymbolOptions(result, opts)

  return result
}
