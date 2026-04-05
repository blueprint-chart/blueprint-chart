import { resolvePalette } from './palettes'
import { adjustColorsForBackground } from './contrast'
import type { ChartData, ChartOptions, ChartTypeOptions } from './types'
import { parseDateOrNumber } from './date-parse'

export function parseData(raw: string): ChartData {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const labels: string[] = []
  const values: number[] = []

  // Check for multi-series header
  const seriesMatch = lines[0]?.match(/^_series\s*=\s*(.+)$/)
  if (seriesMatch) {
    const raw = seriesMatch[1].trim()
    // New format: _series = "A","B","C" — individually quoted names
    // Legacy format: _series = "A,B,C" — single quoted string with commas
    const seriesNames = raw.includes('","')
      ? raw.split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      : raw.replace(/^"|"$/g, '').split(',').map(s => s.trim())
    const seriesValues: number[][] = seriesNames.map(() => [])

    for (let i = 1; i < lines.length; i++) {
      // New format: "Label" = 40,44,42
      const matchNew = lines[i].match(/^"([^"]+)"\s*=\s*([^"]+)$/)
      // Legacy format: "Label" = "40,44,42"
      const matchOld = lines[i].match(/^"([^"]+)"\s*=\s*"([^"]*)"$/)
      const match = matchOld ?? matchNew
      if (match) {
        labels.push(match[1])
        const vals = match[2].split(',')
        for (let s = 0; s < seriesNames.length; s++) {
          seriesValues[s].push(Number.parseFloat(vals[s]?.trim() ?? '') || 0)
        }
      }
    }

    const series = seriesNames.map((name, i) => ({
      name,
      values: seriesValues[i],
    }))

    // values array uses first series for single-series charts
    return { labels, values: seriesValues[0] ?? [], series }
  }

  // Single-series format
  for (const line of lines) {
    const match = line.match(/^"([^"]+)"\s*=\s*(.+)$/)
    if (match) {
      labels.push(match[1])
      values.push(Number.parseFloat(match[2]) || 0)
    }
  }

  return { labels, values }
}

function buildChartColors(opts: Partial<ChartTypeOptions>, backgroundColor?: string): Partial<ChartOptions> {
  const partial: Partial<ChartOptions> = {}

  // Palette takes precedence over custom colors when explicitly set
  const paletteColors = resolvePalette(opts.colorPalette)
  if (paletteColors) {
    partial.colors = paletteColors
  }
  else if (opts.colors && opts.colors.length > 0) {
    partial.colors = opts.colors
  }

  if (opts.autoContrast && backgroundColor && partial.colors) {
    partial.colors = adjustColorsForBackground(partial.colors, backgroundColor)
  }

  if (opts.allowDarkMode !== undefined) {
    partial.allowDarkMode = opts.allowDarkMode
  }

  return partial
}

function buildLegendOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  const partial: Partial<ChartOptions> = {}

  if (opts.legend !== undefined) {
    partial.legend = opts.legend
  }
  if (opts.legendPosition !== undefined) {
    partial.legendPosition = opts.legendPosition as 'top' | 'bottom' | 'left' | 'right'
  }
  if (opts.legendAnchor !== undefined) {
    partial.legendAnchor = opts.legendAnchor as 'start' | 'middle' | 'end'
  }
  if (opts.directLabelling !== undefined) {
    partial.directLabelling = opts.directLabelling
  }
  if (opts.directLabelAnchor !== undefined) {
    partial.directLabelAnchor = opts.directLabelAnchor as 'start' | 'middle' | 'end'
  }

  return partial
}

function buildVerticalAxisOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  const hasVertical = opts.showVerticalTicks !== undefined
    || opts.verticalGridStyle !== undefined
    || opts.verticalNumberFormat !== undefined
    || opts.showVerticalAxis !== undefined
    || opts.verticalAxisDirection !== undefined
    || opts.verticalScaleType !== undefined
    || opts.verticalLabelPosition !== undefined
    || opts.verticalRangeMin
    || opts.verticalRangeMax

  if (!hasVertical) {
    return {}
  }

  const axis: NonNullable<ChartOptions['verticalAxis']> = {}

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

  const vMin = parseDateOrNumber(opts.verticalRangeMin ?? '')
  const vMax = parseDateOrNumber(opts.verticalRangeMax ?? '')
  if (vMin !== undefined || vMax !== undefined) {
    axis.range = {}
    if (vMin !== undefined) {
      axis.range.min = vMin
    }
    if (vMax !== undefined) {
      axis.range.max = vMax
    }
  }

  return { verticalAxis: axis }
}

function buildHorizontalAxisOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  const hasHorizontal = opts.showHorizontalTicks !== undefined
    || opts.horizontalGridStyle !== undefined
    || opts.horizontalNumberFormat !== undefined
    || opts.showHorizontalAxis !== undefined
    || opts.horizontalScaleType !== undefined
    || opts.horizontalLabelPosition !== undefined
    || opts.horizontalRangeMin
    || opts.horizontalRangeMax

  if (!hasHorizontal) {
    return {}
  }

  const axis: NonNullable<ChartOptions['horizontalAxis']> = {}

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

  return { horizontalAxis: axis }
}

function buildLineSymbolOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  if (!opts.lineSymbols) {
    return {}
  }
  return {
    lineSymbols: {
      symbol: (opts.lineSymbolShape as 'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star') ?? 'circle',
      showOn: (opts.lineSymbolShowOn as 'all' | 'first' | 'last' | 'firstLast') ?? 'firstLast',
      style: (opts.lineSymbolStyle as 'filled' | 'hollow') ?? 'filled',
      size: parseFloat(opts.lineSymbolSize ?? '3.5') || 3.5,
      opacity: parseFloat(opts.lineSymbolOpacity ?? '1') || 1,
    },
  }
}

export function buildChartOptions(opts: Partial<ChartTypeOptions>, backgroundColor?: string): Partial<ChartOptions> {
  const result: Partial<ChartOptions> = {
    ...buildChartColors(opts, backgroundColor),
    ...buildLegendOptions(opts),
    ...buildVerticalAxisOptions(opts),
    ...buildHorizontalAxisOptions(opts),
    ...buildLineSymbolOptions(opts),
  }

  if (opts.interpolation !== undefined) {
    result.interpolation = opts.interpolation
  }

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
  if (opts.swapLabelValue !== undefined) {
    result.swapLabelValue = opts.swapLabelValue
  }
  const sliceMax = parseInt(opts.sliceMax ?? '', 10)
  if (!isNaN(sliceMax) && sliceMax > 0) {
    result.sliceMax = sliceMax
  }
  if (opts.sliceGroupLabel !== undefined) {
    result.sliceGroupLabel = opts.sliceGroupLabel
  }

  if (opts.barBackground !== undefined) {
    result.barBackground = opts.barBackground
  }
  if (opts.barSeparators !== undefined) {
    result.barSeparators = opts.barSeparators
  }
  if (opts.stackMode !== undefined) {
    result.stackMode = opts.stackMode as 'normal' | 'percent'
  }
  if (opts.stacked !== undefined) {
    result.stacked = opts.stacked
  }
  if (opts.stackPercent !== undefined) {
    result.stackPercent = opts.stackPercent
  }
  if (opts.areaSortMode !== undefined) {
    result.areaSortMode = opts.areaSortMode
  }
  if (opts.areaLines !== undefined) {
    result.areaLines = opts.areaLines
  }
  const areaFillOpacity = parseFloat(opts.areaFillOpacity ?? '')
  if (!isNaN(areaFillOpacity)) {
    result.areaFillOpacity = areaFillOpacity
  }

  if (opts.edgePadding !== undefined) {
    result.edgePadding = opts.edgePadding
  }
  if (opts.waterfall !== undefined) {
    result.waterfall = opts.waterfall
  }
  if (opts.waterfallTotal !== undefined) {
    result.waterfallTotal = opts.waterfallTotal
  }

  return result
}
