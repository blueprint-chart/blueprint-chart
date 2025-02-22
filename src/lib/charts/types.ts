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
  showTicks?: boolean
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  numberFormat?: string
  tickPosition?: 'above' | 'below'
}

export interface FrameOptions {
  title?: string
  description?: string
  byline?: string
  source?: string
  sourceUrl?: string
  sizing?: 'auto' | 'standard' | 'aspect-ratio'
  aspectRatio?: number
}

export interface ChartOptions {
  frame?: FrameOptions
  verticalAxis?: AxisOptions
  horizontalAxis?: AxisOptions
  sort?: 'ascending' | 'descending' | 'none'
  highlights?: HighlightConfig[]
  colors?: string[]
  legend?: boolean
}

export type ChartRenderer = (
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
) => void

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}
