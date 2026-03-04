export type {
  ChartData,
  ChartOptions,
  ChartRenderer,
  ChartOptionDef,
  ChartTypeOptions,
  ChartTypeOptionKey,
  LineStyle,
  HighlightConfig,
  AxisOptions,
  FrameOptions,
  AreaFillConfig,
  AnnotationConfig,
  LineSymbolConfig,
  SeriesOverride,
  Margin,
} from './types'

export { createFrame } from './frame/frame'
export type { FrameElements } from './frame/frame'

export { createCanvas } from './canvas/canvas'
export type { CanvasElements } from './canvas/canvas'

export { renderVerticalAxis } from './axis/vertical-axis'
export { renderHorizontalAxis } from './axis/horizontal-axis'

export { renderLegend } from './legend/legend'

export { registerChart, getChart, getChartOptions, listCharts } from './registry'

export { parseData, buildChartOptions } from './chart-helpers'

export { resolveSeriesColor, isSeriesHidden } from './series-helpers'

export { getDefaultTransitionMs, DEFAULT_TRANSITION_MS } from './motion'
export { getCachedChart, setCachedChart, clearCachedChart } from './transition-cache'
export type { CachedChart } from './transition-cache'
