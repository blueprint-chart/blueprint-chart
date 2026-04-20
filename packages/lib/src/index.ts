// Enums
export {
  ChartType,
  AxisDirection,
  ScaleType,
  GridStyle,
  LabelPosition,
  LabelRotation,
  TickPosition,
  FrameSizing,
  CompassDirection,
  AnnotationLineStyle,
  StrokeStyle,
  AnnotationKind,
  AnnotationAction,
  RangeAnchor,
  Orientation,
  SymbolShape,
  SymbolShowOn,
  SymbolStyle,
  SortDirection,
  SortMode,
  LegendPosition,
  Anchor,
  ValueLabelPosition,
  CrosshairDirection,
  CrosshairStyle,
  StackMode,
  LineStyle,
  ChartOptionType,
  DirectLabelMode,
  Interpolation,
  DslNodeType,
} from './enums'

// Charts
export type {
  ChartData,
  ChartOptions,
  ChartRenderer,
  ChartOptionDef,
  ChartTypeOptions,
  ChartTypeOptionKey,
  ColorizeConfig,
  HighlightConfig,
  AxisOptions,
  FrameOptions,
  AreaFillConfig,
  AnnotationConfig,
  PointAnnotationConfig,
  RangeAnnotationConfig,
  FreeAnnotationConfig,
  AnnotationLineConfig,
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

export { resolveSeriesColor, resolveSeriesInterpolation, isSeriesHidden } from './charts/series-helpers'
export { resolveBackgroundColor, adjustColorsForBackground, wcagContrastRatio, wcagLevel } from './charts/contrast'
export { getTransitionDuration, snapshotForFadeOut, commitFadeOut, fadeIn } from './charts/motion'
export { getCachedChart } from './charts/transition-cache'
export { getCvdFilterId, createCvdSvgFilter, simulateCvdColor, checkCvdColors } from './charts/colorblind'
export type { CvdType, CvdIssue } from './charts/colorblind'

// DSL
export { parse } from './dsl/parser'
export { serialize, compactSerialize } from './dsl/serializer'
export { propertyMap, extractChartTypeOptions, dataEntriesToString, extractSceneOverrides, convertColorizes, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides } from './dsl/converter'
export type { AnnotationNode, AnnotationVisibilityNode, PointAnnotationNode, RangeAnnotationNode, FreeAnnotationNode, AreaFillNode, ChartNode, DataNode, ColorizeNode, HighlightNode, PropertyNode, SceneNode, SeriesNode, StepNode, TransformNode } from './dsl/types'

// Samples
export { samples } from './samples'
export type { ChartSample } from './samples'
