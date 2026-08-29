import { resolvePalette } from './palettes'
import { adjustColorsForBackground } from './contrast'
import { getChartOptions } from './registry'
import type { ChartOptions, ChartTypeOptions } from './types'
import { buildVerticalAxisOptions, buildHorizontalAxisOptions } from './axis-options'
import { LegendPosition, Anchor, ValueLabelPosition, CrosshairDirection, CrosshairStyle, StackMode, SymbolShape, SymbolShowOn, SymbolStyle } from '../enums'

// Keys the builders below fold into a differently named or differently typed
// ChartOptions field, or drop on a falsy value, so copying their raw value
// would leak a DSL string or a boolean where the renderer expects an object.
const DERIVED_OPTION_KEYS = new Set<string>([
  'colors', 'colorPalette', 'autoContrast',
  'crosshairDirection', 'crosshairStyle', 'crosshairColor',
  'lineSymbols', 'lineSymbolShape', 'lineSymbolShowOn', 'lineSymbolStyle', 'lineSymbolSize', 'lineSymbolOpacity',
  'showVerticalTicks', 'showVerticalAxis', 'verticalAxisDirection', 'verticalGridStyle', 'verticalNumberFormat',
  'verticalScaleType', 'verticalLabelPosition', 'verticalRangeMin', 'verticalRangeMax',
  'showHorizontalTicks', 'showHorizontalAxis', 'horizontalGridStyle', 'horizontalNumberFormat',
  'horizontalScaleType', 'horizontalLabelPosition', 'horizontalLabelRotation', 'horizontalRangeMin', 'horizontalRangeMax',
  'sliceMax', 'barGap', 'connectionsOpacity', 'areaFillOpacity',
])

function buildRegisteredOptions(opts: Partial<ChartTypeOptions>, chartType?: string): Partial<ChartOptions> {
  if (!chartType) {
    return {}
  }
  const partial: Record<string, unknown> = {}
  for (const { key } of getChartOptions(chartType)) {
    const value = (opts as Record<string, unknown>)[key]
    if (value !== undefined && !DERIVED_OPTION_KEYS.has(key)) {
      partial[key] = value
    }
  }
  return partial as Partial<ChartOptions>
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
    partial.legendPosition = opts.legendPosition as LegendPosition
  }
  if (opts.legendAnchor !== undefined) {
    partial.legendAnchor = opts.legendAnchor as Anchor
  }
  if (opts.directLabelling !== undefined) {
    partial.directLabelling = opts.directLabelling
  }
  if (opts.directLabelAnchor !== undefined) {
    partial.directLabelAnchor = opts.directLabelAnchor as Anchor
  }

  return partial
}

function buildLineSymbolOptions(opts: Partial<ChartTypeOptions>): Partial<ChartOptions> {
  if (!opts.lineSymbols) {
    return {}
  }
  return {
    lineSymbols: {
      symbol: (opts.lineSymbolShape as SymbolShape) ?? SymbolShape.Circle,
      showOn: (opts.lineSymbolShowOn as SymbolShowOn) ?? SymbolShowOn.FirstLast,
      style: (opts.lineSymbolStyle as SymbolStyle) ?? SymbolStyle.Filled,
      size: parseFloat(opts.lineSymbolSize ?? '3.5') || 3.5,
      opacity: parseFloat(opts.lineSymbolOpacity ?? '1') || 1,
    },
  }
}

export function buildChartOptions(opts: Partial<ChartTypeOptions>, backgroundColor?: string, chartType?: string): Partial<ChartOptions> {
  const result: Partial<ChartOptions> = {
    ...buildRegisteredOptions(opts, chartType),
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
    result.valueLabelPosition = opts.valueLabelPosition as ValueLabelPosition
  }
  if (opts.tooltips !== undefined) {
    result.tooltips = opts.tooltips
  }
  if (opts.crosshair !== undefined) {
    result.crosshair = opts.crosshair
  }
  if (opts.crosshairDirection) {
    result.crosshairDirection = opts.crosshairDirection as CrosshairDirection
  }
  if (opts.crosshairStyle) {
    result.crosshairStyle = opts.crosshairStyle as CrosshairStyle
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
  const barGap = parseFloat(opts.barGap ?? '')
  if (!isNaN(barGap)) {
    result.barGap = Math.max(0, Math.min(100, barGap))
  }
  if (opts.connectedColumns !== undefined) {
    result.connectedColumns = opts.connectedColumns
  }
  const connectionsOpacity = parseFloat(opts.connectionsOpacity ?? '')
  if (!isNaN(connectionsOpacity)) {
    result.connectionsOpacity = Math.max(0, Math.min(1, connectionsOpacity))
  }
  if (opts.stackMode !== undefined) {
    result.stackMode = opts.stackMode as StackMode
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
  if (opts.categoryLabelLine !== undefined) {
    result.categoryLabelLine = opts.categoryLabelLine
  }

  return result
}
