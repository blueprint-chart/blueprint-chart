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
export { ANNOTATION_KIND_KEYWORD } from './enums'

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

// Recommendations
export { recommendCharts } from './recommendations/recommend'
export { classifyIntent } from './recommendations/intent'
export { shapeOf } from './recommendations/shape'
export type { ChartRecommendation, RecommendationFitness, ColumnType, Intent, ShapeSignature } from './recommendations/types'

export { getChartTypeDefaults, resolveChartTypeOptions } from './charts/resolve'
export { resolveBarGapPadding, DEFAULT_BAR_GAP } from './charts/scale-helpers'
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
export { serialize, compactSerialize, compactSerializeDeep } from './dsl/serializer'
export { propertyMap, extractChartTypeOptions, dataEntriesToString, extractSceneOverrides, convertColorizes, convertHighlights, convertAreaFills, convertAnnotations, convertSeriesOverrides } from './dsl/converter'
export type { AnnotationNode, AnnotationVisibilityNode, PointAnnotationNode, RangeAnnotationNode, FreeAnnotationNode, AreaFillNode, ChartNode, DataNode, ColorizeNode, HighlightNode, PropertyNode, SceneNode, SeriesNode, TransformNode } from './dsl/types'
export { validateChart } from './dsl/validate'
export type { ValidationIssue, ValidationResult } from './dsl/validate'

// Samples
export { samples } from './samples'
export type { ChartSample } from './samples'

// Unified render API
export { renderBpc, renderChart, astToDefinition, resolveScene, render } from './render'
export type { ChartDefinition, RenderOptions, ResolvedChartState, ChartHandle, RenderApiOptions, OutputOptions } from './render'
export { ChartParseError, PngBrowserUnsupportedError, MissingNodeRenderDepsError } from './render'

// Transitions (orchestrator, feature-join primitive, snapshot helper)
export {
  SceneTransition,
  getSceneTransition,
  featureJoin,
  snapshotLiveAttrs,
  BC_TRANSITION_NAME,
} from './transitions'
export type {
  CommitOptions,
  TransitionMode,
  SceneTransitionState,
  FeatureRole,
  FeatureJoinConfig,
  AttrMap,
  AttrValue,
} from './transitions'
