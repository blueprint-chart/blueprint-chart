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
  RangeAnchor,
  Orientation,
  SymbolShape,
  SymbolShowOn,
  SymbolStyle,
  SortDirection,
  SortMode,
  DotStyle,
  ArrowDirection,
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
  TransformType,
  FilterCondition,
  ParseOperationCategory,
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
  OverlayConfig,
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
export { stripDigitGroupSpaces } from './charts/number-parse'
export { resolveScatterMapping, numericColumns, MAPPING_NONE, type ScatterMapping } from './charts/types/scatter/mapping'
export { resolveDotPlotMapping, detectRangeColumn, type DotPlotMapping, type DotPlotMode, type ResolvedDotPlot } from './charts/types/dot-plot/mapping'

// Recommendations
export { recommendCharts } from './recommendations/recommend'
export { classifyIntent } from './recommendations/intent'
export { shapeOf } from './recommendations/shape'
export type { ChartRecommendation, RecommendationFitness, ColumnType, Intent, ShapeSignature } from './recommendations/types'

export { getChartTypeDefaults, resolveChartTypeOptions } from './charts/resolve'
export { resolveBarGapPadding, DEFAULT_BAR_GAP } from './charts/scale-helpers'
export { DEFAULT_COLORS, resolvePalette, listPalettes } from './charts/palettes'
export type { PaletteEntry } from './charts/palettes'
export { listThemes } from './charts/themes'
export type { ThemeEntry } from './charts/themes'

export { resolveSeriesColor, resolveSeriesInterpolation, isSeriesHidden } from './charts/series-helpers'
export { resolveBackgroundColor, adjustColorsForBackground, wcagContrastRatio, wcagLevel } from './charts/contrast'
export { getTransitionDuration, snapshotForFadeOut, commitFadeOut, fadeIn } from './charts/motion'
export { getCachedChart } from './charts/transition-cache'
export { getCvdFilterId, createCvdSvgFilter, simulateCvdColor, checkCvdColors } from './charts/colorblind'
export type { CvdType, CvdIssue } from './charts/colorblind'

// DSL
export { parse } from './dsl/parser'
export { serialize, compactSerialize, compactSerializeDeep } from './dsl/serializer'
export { quoteDslString } from './dsl/quoting'
export { toBool } from './dsl/converter'
export { DEFAULT_SCENE_DURATION, SCENE_DURATION_MIN, SCENE_DURATION_MAX, readPlaybackSettings, createPlayback, onceVisible } from './runtime/playback'
export type { PlaybackSettings, PlaybackOptions, Playback } from './runtime/playback'
export { prefersReducedMotion } from './charts/motion'
export { propertyMap, extractChartTypeOptions, dataEntriesToString, extractSceneOverrides, convertColorizes, convertHighlights, convertAreaFills, convertOverlays, convertAnnotations, convertSeriesOverrides } from './dsl/converter'
export type { AnnotationNode, PointAnnotationNode, RangeAnnotationNode, FreeAnnotationNode, AreaFillNode, ChartNode, DataNode, ColorizeNode, HighlightNode, OverlayNode, PropertyNode, SceneNode, SeriesNode, TransformNode } from './dsl/types'
export { validateChart } from './dsl/validate'
export type { ValidationIssue, ValidationResult } from './dsl/validate'

// Data transforms
export {
  TRANSFORM_TYPES,
  applyTransformSteps,
  applyTransformNodes,
  applyTransformNodesToChartData,
  transformNodesToSteps,
  transformValue,
  parseOperations,
  parseOperationMap,
  isTypeCompatible,
  getOutputType,
  NULL_VALUE,
  parseBpcData,
  serializeTableData,
  chartDataToTable,
  detectColumnTypes,
  cleanNumericValue,
  isDateValue,
  isNumberValue,
} from './transforms'
export type { ParseOperation, TransformResult, TransformStep } from './transforms'

// Samples
export { samples } from './samples'
export type { ChartSample } from './samples'

// Unified render API
export { renderBpc, renderChart, astToDefinition, resolveScene, render } from './render'
export type { ChartDefinition, RenderOptions, ResolvedChartState, ChartHandle, RenderApiOptions, OutputOptions } from './render'
export { ChartParseError, PngBrowserUnsupportedError, MissingNodeRenderDepsError } from './render'
export { buildFrameSvg } from './render'
export type { FrameSvgLayout, FrameSvgTextBlock, FrameSvgPlot, ChartAccessibility } from './render'

// Runtime
export { buildSrcdoc } from './runtime/runtime'
export { RESIZE_MESSAGE } from './runtime/messages'

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
