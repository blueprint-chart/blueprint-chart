import type {
  AxisDirection,
  ScaleType,
  GridStyle,
  LabelPosition,
  LabelRotation,
  TickPosition,
  FrameSizing,
  AnnotationKind,
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
  ChartOptionType,
} from '../enums'

import type {
  CompassDirection,
  AnnotationLineStyle,
  StrokeStyle,
  RangeAnchor,
} from '../enums'

// Re-export enums that were previously exported as type aliases from this module
export {
  CompassDirection,
  AnnotationLineStyle,
  StrokeStyle,
  RangeAnchor,
  LineStyle,
} from '../enums'

export interface ChartData {
  labels: string[]
  values: number[]
  series?: { name: string, values: number[] }[]
}

export interface ColorizeConfig {
  target: string
  color: string
  label?: string
}

export interface HighlightConfig {
  target: string
}

export interface AxisOptions {
  direction?: AxisDirection
  scaleType?: ScaleType
  range?: { min?: number, max?: number }
  ticks?: number[]
  showAxis?: boolean
  showTicks?: boolean
  gridStyle?: GridStyle
  gridWidth?: number
  numberFormat?: string
  tickPosition?: TickPosition
  labelPosition?: LabelPosition
  labelRotation?: LabelRotation
  topPadding?: number
  width?: number
  zeroY?: number
  tickFormat?: (label: string) => string
}

export interface FrameOptions {
  title?: string
  description?: string
  byline?: string
  note?: string
  source?: string
  sourceUrl?: string
  sizing?: FrameSizing
  aspectRatio?: number
  padding?: string
  transparentBackground?: boolean
}

export interface AreaFillConfig {
  from: string
  to: string
  color?: string
  negativeColor?: string
  opacity?: number
  interpolation?: string
}

export interface AnnotationLineConfig {
  anchorDirection?: CompassDirection
  textOffsetX?: number
  textOffsetY?: number
  showLine?: boolean
  lineStyle?: AnnotationLineStyle
  lineWeight?: number
  showArrow?: boolean
  lineTargetDistance?: number
  showCircle?: boolean
  circleSize?: number
  circleStyle?: StrokeStyle
  circleColor?: string
}

interface AnnotationBase {
  id?: string
  text?: string
  textColor?: string
  textOutline?: boolean
  maxWidth?: number | string
}

export interface PointAnnotationConfig extends AnnotationBase, AnnotationLineConfig {
  kind: AnnotationKind.Point
  text: string
  target: string
}

export interface RangeAnnotationConfig extends AnnotationBase {
  kind: AnnotationKind.Range
  orientation?: Orientation
  direction?: CompassDirection
  start: number | string
  end: number | string
  startAnchor?: RangeAnchor
  endAnchor?: RangeAnchor
  bgOpacity?: number
  bgColor?: string
}

export interface FreeAnnotationConfig extends AnnotationBase {
  kind: AnnotationKind.Free
  text: string
  x: number | string
  y: number | string
}

export type AnnotationConfig = PointAnnotationConfig | RangeAnnotationConfig | FreeAnnotationConfig

export interface LineSymbolConfig {
  symbol?: SymbolShape
  showOn?: SymbolShowOn
  style?: SymbolStyle
  size?: number
  opacity?: number
}

export interface SeriesOverride {
  name: string
  color?: string
  showOutline?: boolean
  interpolation?: string
  lineWidth?: number
  dash?: string
  labelMode?: string
  labelText?: string
  valueLabels?: boolean
  lineSymbols?: boolean
  symbolShape?: string
  symbolShowOn?: string
  symbolStyle?: string
  symbolSize?: number
  symbolOpacity?: number
  opacity?: number
  hidden?: boolean
}

export interface ChartOptions {
  frame?: FrameOptions | null
  verticalAxis?: AxisOptions
  horizontalAxis?: AxisOptions
  sort?: SortDirection
  sortMode?: SortMode
  colorizes?: ColorizeConfig[]
  highlights?: HighlightConfig[]
  colors?: string[]
  interpolation?: string
  legend?: boolean
  legendPosition?: LegendPosition
  legendAnchor?: Anchor
  directLabelling?: string | boolean
  directLabelAnchor?: Anchor
  areaFill?: boolean
  areaFillOpacity?: number
  areaFills?: AreaFillConfig[]
  stacked?: boolean
  stackPercent?: boolean
  areaSortMode?: string
  areaLines?: boolean
  valueLabels?: boolean
  valueLabelPosition?: ValueLabelPosition
  tooltips?: boolean
  crosshair?: boolean
  crosshairDirection?: CrosshairDirection
  crosshairStyle?: CrosshairStyle
  crosshairColor?: string
  lineSymbols?: LineSymbolConfig
  annotations?: AnnotationConfig[]
  seriesOverrides?: SeriesOverride[]
  displayAsPercentage?: boolean
  showTotal?: boolean
  showLabels?: boolean
  showValues?: boolean
  sliceMax?: number
  sliceGroupLabel?: string
  autoContrast?: boolean
  allowDarkMode?: boolean
  swapLabelValue?: boolean
  barBackground?: boolean
  barSeparators?: boolean
  barGap?: number
  connectedColumns?: boolean
  connectionsOpacity?: number
  stackMode?: StackMode
  edgePadding?: boolean
  waterfall?: boolean
  waterfallTotal?: boolean
  sharedScale?: boolean
  categoryLabelLine?: boolean
}

export type ChartRenderer = (
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
  transition?: boolean,
) => void

export interface ChartOptionDef {
  key: string
  type: ChartOptionType
  label: string
  default?: unknown
  choices?: { value: string, text: string }[]
  placeholder?: string
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartTypeOptions {
  colors: string[]
  colorPalette: string
  interpolation: string
  legend: boolean
  legendPosition: string
  legendAnchor: string
  directLabelling: string
  directLabelAnchor: string
  showVerticalAxis: boolean
  verticalAxisDirection: string
  showVerticalTicks: boolean
  verticalGridStyle: GridStyle
  verticalNumberFormat: string
  showHorizontalAxis: boolean
  showHorizontalTicks: boolean
  horizontalGridStyle: GridStyle
  horizontalNumberFormat: string
  verticalScaleType: ScaleType
  horizontalScaleType: ScaleType
  verticalLabelPosition: string
  verticalRangeMin: string
  verticalRangeMax: string
  horizontalLabelPosition: string
  horizontalLabelRotation: string
  horizontalRangeMin: string
  horizontalRangeMax: string
  valueLabels: boolean
  valueLabelPosition: string
  tooltips: boolean
  crosshair: boolean
  crosshairDirection: string
  crosshairStyle: string
  crosshairColor: string
  lineSymbols: boolean
  lineSymbolShape: string
  lineSymbolShowOn: string
  lineSymbolStyle: string
  lineSymbolSize: string
  lineSymbolOpacity: string
  displayAsPercentage: boolean
  showTotal: boolean
  showLabels: boolean
  showValues: boolean
  swapLabelValue: boolean
  sliceMax: string
  sliceGroupLabel: string
  autoContrast: boolean
  allowDarkMode: boolean
  sortMode: SortMode
  barBackground: boolean
  barSeparators: boolean
  barGap: string
  connectedColumns: boolean
  connectionsOpacity: string
  stackMode: string
  stacked: boolean
  stackPercent: boolean
  areaSortMode: string
  areaLines: boolean
  areaFillOpacity: string
  edgePadding: boolean
  waterfall: boolean
  waterfallTotal: boolean
  sharedScale: boolean
  categoryLabelLine: boolean
}

export type ChartTypeOptionKey = keyof ChartTypeOptions
