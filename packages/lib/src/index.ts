// Charts
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
} from './charts/types'

export { createFrame } from './charts/frame/frame'
export type { FrameElements } from './charts/frame/frame'

export { createCanvas } from './charts/canvas/canvas'
export type { CanvasElements } from './charts/canvas/canvas'

export { renderVerticalAxis } from './charts/axis/vertical-axis'
export { renderHorizontalAxis } from './charts/axis/horizontal-axis'

export { renderLegend } from './charts/legend/legend'

export { registerChart, getChart, getChartOptions, listCharts } from './charts/registry'

export { parseData, buildChartOptions } from './charts/chart-helpers'
export { resolvePalette, listPalettes } from './charts/palettes'
export type { PaletteEntry } from './charts/palettes'

export { resolveSeriesColor, isSeriesHidden } from './charts/series-helpers'
export { resolveBackgroundColor, adjustColorsForBackground, wcagContrastRatio, wcagLevel } from './charts/contrast'
export { getTransitionDuration } from './charts/motion'
export { getCvdFilterId, createCvdSvgFilter } from './charts/colorblind'
export type { CvdType } from './charts/colorblind'

// DSL
export { parse } from './dsl/parser'
export { serialize } from './dsl/serializer'
export type { AnnotationNode, AreaFillNode, ChartNode, DataNode, HighlightNode, PropertyNode, SeriesNode, StepNode } from './dsl/types'

// Samples
export { samples } from './samples'
export type { ChartSample } from './samples'
