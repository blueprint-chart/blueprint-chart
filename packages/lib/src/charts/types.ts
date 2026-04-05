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
  direction?: 'left' | 'right'
  scaleType?: 'linear' | 'log'
  range?: { min?: number, max?: number }
  ticks?: number[]
  showAxis?: boolean
  showTicks?: boolean
  gridStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  gridWidth?: number
  numberFormat?: string
  tickPosition?: 'above' | 'below'
  labelPosition?: 'auto' | 'inside' | 'outside' | 'off'
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
  sizing?: 'auto' | 'standard' | 'aspect-ratio'
  aspectRatio?: number
  showCredit?: boolean
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

export type CompassDirection = 'NW' | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'center'
export type AnnotationLineStyle = 'direct' | 'curve-left' | 'curve-right' | 'elbow'
export type StrokeStyle = 'solid' | 'dotted' | 'dashed'

interface AnnotationBase {
  id?: string
  text?: string
  textColor?: string
  textOutline?: boolean
  maxWidth?: number | string
}

interface AnnotationLineConfig {
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

export interface PointAnnotationConfig extends AnnotationBase, AnnotationLineConfig {
  kind: 'point'
  text: string
  target: string
}

export type RangeAnchor = 'start' | 'center' | 'end'

export interface RangeAnnotationConfig extends AnnotationBase {
  kind: 'range'
  orientation?: 'vertical' | 'horizontal'
  direction?: CompassDirection
  start: number | string
  end: number | string
  startAnchor?: RangeAnchor
  endAnchor?: RangeAnchor
  bgOpacity?: number
  bgColor?: string
}

export interface FreeAnnotationConfig extends AnnotationBase {
  kind: 'free'
  text: string
  x: number | string
  y: number | string
}

export type AnnotationConfig = PointAnnotationConfig | RangeAnnotationConfig | FreeAnnotationConfig

export interface LineSymbolConfig {
  symbol?: 'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star'
  showOn?: 'all' | 'first' | 'last' | 'firstLast'
  style?: 'filled' | 'hollow'
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
  frame?: FrameOptions
  verticalAxis?: AxisOptions
  horizontalAxis?: AxisOptions
  sort?: 'ascending' | 'descending' | 'none'
  sortMode?: 'total' | 'within-groups' | 'none'
  colorizes?: ColorizeConfig[]
  highlights?: HighlightConfig[]
  colors?: string[]
  interpolation?: string
  legend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  legendAnchor?: 'start' | 'middle' | 'end'
  directLabelling?: string | boolean
  directLabelAnchor?: 'start' | 'middle' | 'end'
  areaFill?: boolean
  areaFillOpacity?: number
  areaFills?: AreaFillConfig[]
  stacked?: boolean
  stackPercent?: boolean
  areaSortMode?: string
  areaLines?: boolean
  valueLabels?: boolean
  valueLabelPosition?: 'inside' | 'outside' | 'auto'
  tooltips?: boolean
  crosshair?: boolean
  crosshairDirection?: 'both' | 'vertical' | 'horizontal'
  crosshairStyle?: 'solid' | 'dashed' | 'dotted'
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
  stackMode?: 'normal' | 'percent'
  edgePadding?: boolean
  waterfall?: boolean
  waterfallTotal?: boolean
}

export type ChartRenderer = (
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
  transition?: boolean,
) => void

export interface ChartOptionDef {
  key: string
  type: 'colors' | 'boolean' | 'select' | 'text' | 'numberFormat' | 'dateFormat'
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

export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'none'

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
  verticalGridStyle: LineStyle
  verticalNumberFormat: string
  showHorizontalAxis: boolean
  showHorizontalTicks: boolean
  horizontalGridStyle: LineStyle
  horizontalNumberFormat: string
  verticalScaleType: 'linear' | 'log'
  horizontalScaleType: 'linear' | 'log'
  verticalLabelPosition: string
  verticalRangeMin: string
  verticalRangeMax: string
  horizontalLabelPosition: string
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
  sortMode: 'total' | 'within-groups' | 'none'
  barBackground: boolean
  barSeparators: boolean
  stackMode: string
  stacked: boolean
  stackPercent: boolean
  areaSortMode: string
  areaLines: boolean
  areaFillOpacity: string
  edgePadding: boolean
  waterfall: boolean
  waterfallTotal: boolean
}

export type ChartTypeOptionKey = keyof ChartTypeOptions
