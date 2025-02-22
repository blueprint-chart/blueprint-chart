import * as d3 from 'd3'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas } from '../../canvas/canvas'
import { renderVerticalAxis } from '../../axis/vertical-axis'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'
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
  const { body } = createFrame(container, options.frame)
  const { chartArea, width, height } = createCanvas(body)

  const series = data.series ?? []
  const colors = options.colors ?? DEFAULT_COLORS

  const allValues = series.flatMap(s => s.values)
  const maxValue = d3.max(allValues) ?? 0

  const x = d3.scaleBand<string>()
    .domain(data.labels)
    .range([0, width])
    .padding(0.5)

  const y = d3.scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([height, 0])

  renderVerticalAxis(chartArea, y, height, options.verticalAxis)
  renderHorizontalAxis(chartArea, x, height, options.horizontalAxis)

  series.forEach((s, si) => {
    const color = colors[si % colors.length]

    const lineGen = d3.line<number>()
      .x((_d, i) => (x(data.labels[i]) ?? 0) + x.bandwidth() / 2)
      .y(d => y(d))

    d3.select(chartArea)
      .append('path')
      .datum(s.values)
      .attr('class', 'bc-line')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', lineGen)
  })

  if (options.legend !== false) {
    renderLegend(chartArea, series.map(s => s.name), colors)
  }
}
