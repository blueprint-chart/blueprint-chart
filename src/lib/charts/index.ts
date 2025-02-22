export type {
  ChartData,
  ChartOptions,
  ChartRenderer,
  HighlightConfig,
  AxisOptions,
  FrameOptions,
  Margin,
} from './types'

export { createFrame } from './frame/frame'
export type { FrameElements } from './frame/frame'

export { createCanvas } from './canvas/canvas'
export type { CanvasElements } from './canvas/canvas'

export { renderVerticalAxis } from './axis/vertical-axis'
export { renderHorizontalAxis } from './axis/horizontal-axis'

export { renderLegend } from './legend/legend'

export { registerChart, getChart, listCharts } from './registry'
