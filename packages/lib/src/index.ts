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
  PointAnnotationConfig,
  RangeAnchor,
  RangeAnnotationConfig,
  FreeAnnotationConfig,
  CompassDirection,
  AnnotationLineStyle,
  StrokeStyle,
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
export { getCvdFilterId, createCvdSvgFilter, simulateCvdColor, checkCvdColors } from './charts/colorblind'
export type { CvdType, CvdIssue } from './charts/colorblind'

// DSL
export { parse } from './dsl/parser'
export { serialize, compactSerialize } from './dsl/serializer'
export { propertyMap, extractChartTypeOptions, dataEntriesToString, extractSceneOverrides, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides } from './dsl/converter'
export type { AnnotationNode, AnnotationVisibilityNode, PointAnnotationNode, RangeAnnotationNode, FreeAnnotationNode, AreaFillNode, ChartNode, DataNode, HighlightNode, PropertyNode, SceneNode, SeriesNode, StepNode, TransformNode } from './dsl/types'

// Samples
export { samples } from './samples'
export type { ChartSample } from './samples'
