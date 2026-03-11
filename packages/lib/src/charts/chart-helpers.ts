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

export function parseData(raw: string): ChartData {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const labels: string[] = []
  const values: number[] = []

  // Check for multi-series header
  const seriesMatch = lines[0]?.match(/^_series\s*=\s*"(.+)"$/)
  if (seriesMatch) {
    const seriesNames = seriesMatch[1].split(',').map(s => s.trim())
    const seriesValues: number[][] = seriesNames.map(() => [])

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

export function buildChartOptions(opts: Partial<ChartTypeOptions>, backgroundColor?: string): Partial<ChartOptions> {
  const result: Partial<ChartOptions> = {}

  // Palette takes precedence over custom colors when explicitly set
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

  if (opts.showVerticalTicks !== undefined || opts.verticalGridStyle !== undefined || opts.verticalNumberFormat !== undefined || opts.showVerticalAxis !== undefined || opts.verticalAxisDirection !== undefined || opts.verticalScaleType !== undefined || opts.verticalLabelPosition !== undefined || opts.verticalRangeMin || opts.verticalRangeMax) {
    result.verticalAxis = {}
    if (opts.showVerticalTicks !== undefined) {
      result.verticalAxis.showTicks = opts.showVerticalTicks
    }
    if (opts.verticalAxisDirection !== undefined) {
      result.verticalAxis.direction = opts.verticalAxisDirection as 'left' | 'right'
    }
    if (opts.verticalGridStyle !== undefined) {
      result.verticalAxis.gridStyle = opts.verticalGridStyle
    }
    if (opts.verticalNumberFormat !== undefined) {
      result.verticalAxis.numberFormat = opts.verticalNumberFormat
    }
    if (opts.showVerticalAxis !== undefined) {
      result.verticalAxis.showAxis = opts.showVerticalAxis
    }
    if (opts.verticalScaleType !== undefined) {
      result.verticalAxis.scaleType = opts.verticalScaleType
    }
    if (opts.verticalLabelPosition !== undefined) {
      result.verticalAxis.labelPosition = opts.verticalLabelPosition as 'auto' | 'inside' | 'outside' | 'off'
    }
    const vMin = parseFloat(opts.verticalRangeMin ?? '')
    const vMax = parseFloat(opts.verticalRangeMax ?? '')
    if (!isNaN(vMin) || !isNaN(vMax)) {
      result.verticalAxis.range = {}
      if (!isNaN(vMin)) {
        result.verticalAxis.range.min = vMin
      }
      if (!isNaN(vMax)) {
        result.verticalAxis.range.max = vMax
      }
    }
  }

  if (opts.showHorizontalTicks !== undefined || opts.horizontalGridStyle !== undefined || opts.horizontalNumberFormat !== undefined || opts.showHorizontalAxis !== undefined || opts.horizontalScaleType !== undefined || opts.horizontalLabelPosition !== undefined || opts.horizontalRangeMin || opts.horizontalRangeMax) {
    result.horizontalAxis = {}
    if (opts.showHorizontalTicks !== undefined) {
      result.horizontalAxis.showTicks = opts.showHorizontalTicks
    }
    if (opts.horizontalGridStyle !== undefined) {
      result.horizontalAxis.gridStyle = opts.horizontalGridStyle
    }
    if (opts.horizontalNumberFormat !== undefined) {
      result.horizontalAxis.numberFormat = opts.horizontalNumberFormat
    }
    if (opts.showHorizontalAxis !== undefined) {
      result.horizontalAxis.showAxis = opts.showHorizontalAxis
    }
    if (opts.horizontalScaleType !== undefined) {
      result.horizontalAxis.scaleType = opts.horizontalScaleType
    }
    if (opts.horizontalLabelPosition !== undefined) {
      result.horizontalAxis.labelPosition = opts.horizontalLabelPosition as 'auto' | 'inside' | 'outside' | 'off'
    }
    const hMin = parseDateOrNumber(opts.horizontalRangeMin ?? '')
    const hMax = parseDateOrNumber(opts.horizontalRangeMax ?? '')
    if (hMin !== undefined || hMax !== undefined) {
      result.horizontalAxis.range = {}
      if (hMin !== undefined) {
        result.horizontalAxis.range.min = hMin
      }
      if (hMax !== undefined) {
        result.horizontalAxis.range.max = hMax
      }
    }
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

  if (opts.lineSymbols) {
    result.lineSymbols = {
      symbol: (opts.lineSymbolShape as 'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star') ?? 'circle',
      showOn: (opts.lineSymbolShowOn as 'all' | 'first' | 'last' | 'firstLast') ?? 'firstLast',
      style: (opts.lineSymbolStyle as 'filled' | 'hollow') ?? 'filled',
      size: parseFloat(opts.lineSymbolSize ?? '3.5') || 3.5,
      opacity: parseFloat(opts.lineSymbolOpacity ?? '1') || 1,
    }
  }

  return result
}
