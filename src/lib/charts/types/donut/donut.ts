import * as d3 from 'd3'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas } from '../../canvas/canvas'
import { renderLegend } from '../../legend/legend'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  renderArc(container, data, options, 0.6)
}

export function renderArc(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions,
  innerRadiusRatio: number,
): void {
  const { body } = createFrame(container, options.frame)
  const { chartArea, width, height } = createCanvas(body)

  const radius = Math.min(width, height) / 2
  const innerRadius = radius * innerRadiusRatio

  const colors = options.colors ?? DEFAULT_COLORS
  const colorScale = d3.scaleOrdinal<string>()
    .domain(data.labels)
    .range(colors)

  const pie = d3.pie<number>().sort(null)
  const arc = d3.arc<d3.PieArcDatum<number>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)

  const g = d3.select(chartArea)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`)

  g.selectAll('.bc-arc')
    .data(pie(data.values))
    .enter()
    .append('path')
    .attr('class', 'bc-arc')
    .attr('d', arc)
    .attr('fill', (_d, i) => colorScale(data.labels[i]))

  if (options.legend !== false) {
    renderLegend(chartArea, data.labels, colors)
  }
}
