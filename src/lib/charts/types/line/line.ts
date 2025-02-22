import * as d3 from 'd3'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'

const DEFAULT_COLOR = '#4e79a7'

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  const { body } = createFrame(container, options.frame)
  const { chartArea, width, height } = createCanvas(body)

  const x = d3.scaleBand<string>()
    .domain(data.labels)
    .range([0, width])
    .padding(0.5)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data.values) ?? 0])
    .nice()
    .range([height, 0])

  renderVerticalAxis(chartArea, y, height, options.verticalAxis)
  renderHorizontalAxis(chartArea, x, height, options.horizontalAxis)

  const color = options.colors?.[0] ?? DEFAULT_COLOR

  const lineGen = d3.line<number>()
    .x((_d, i) => (x(data.labels[i]) ?? 0) + x.bandwidth() / 2)
    .y(d => y(d))

  d3.select(chartArea)
    .append('path')
    .datum(data.values)
    .attr('class', 'bc-line')
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('d', lineGen)

  // Render dots
  d3.select(chartArea)
    .selectAll('.bc-dot')
    .data(data.values)
    .enter()
    .append('circle')
    .attr('class', 'bc-dot')
    .attr('cx', (_d, i) => (x(data.labels[i]) ?? 0) + x.bandwidth() / 2)
    .attr('cy', d => y(d))
    .attr('r', 3)
    .attr('fill', color)
}
