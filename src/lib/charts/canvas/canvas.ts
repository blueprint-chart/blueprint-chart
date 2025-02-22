import * as d3 from 'd3'
import type { Margin } from '../types'

export interface CanvasElements {
  svg: SVGSVGElement
  chartArea: SVGGElement
  width: number
  height: number
  margin: Margin
}

const DEFAULT_MARGIN: Margin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 50,
}

const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 400

export function createCanvas(
  body: HTMLElement,
  margin?: Partial<Margin>,
): CanvasElements {
  const m: Margin = { ...DEFAULT_MARGIN, ...margin }

  const rect = body.getBoundingClientRect()
  const totalWidth = rect.width > 0 ? rect.width : DEFAULT_WIDTH
  const totalHeight = rect.height > 0 ? rect.height : DEFAULT_HEIGHT

  const width = totalWidth - m.left - m.right
  const height = totalHeight - m.top - m.bottom

  const svg = d3
    .select(body)
    .append('svg')
    .attr('width', totalWidth)
    .attr('height', totalHeight)
    .node() as SVGSVGElement

  const chartArea = d3
    .select(svg)
    .append('g')
    .attr('transform', `translate(${m.left},${m.top})`)
    .node() as SVGGElement

  return { svg, chartArea, width, height, margin: m }
}
