export interface ChartData {
  labels: string[]
  values: number[]
  series?: { name: string, values: number[] }[]
}

export interface HighlightConfig {
  target: string
  color: string
  label?: string
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
}

export interface AreaFillConfig {
  from: string
  to: string
  color?: string
  negativeColor?: string
  opacity?: number
  interpolation?: string
}

export interface AnnotationConfig {
  target: string
  text: string
  dx?: number
  dy?: number
  showArrow?: boolean
}

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
}

export type ChartRenderer = (
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
) => void

export interface ChartOptionDef {
  key: string
  type: 'colors' | 'boolean' | 'select' | 'text'
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
  sliceMax: string
  sliceGroupLabel: string
  autoContrast: boolean
}

export type ChartTypeOptionKey = keyof ChartTypeOptions
