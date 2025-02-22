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
  const seriesNames = series.map(s => s.name)
  const colors = options.colors ?? DEFAULT_COLORS

  const allValues = series.flatMap(s => s.values)
  const maxValue = d3.max(allValues) ?? 0

  const x0 = d3.scaleBand<string>()
    .domain(data.labels)
    .range([0, width])
    .padding(0.2)

  const x1 = d3.scaleBand<string>()
    .domain(seriesNames)
    .range([0, x0.bandwidth()])
    .padding(0.05)

  const y = d3.scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([height, 0])

  renderVerticalAxis(chartArea, y, height, options.verticalAxis)
  renderHorizontalAxis(chartArea, x0, height, options.horizontalAxis)

  data.labels.forEach((label, i) => {
    const group = d3.select(chartArea)
      .append('g')
      .attr('transform', `translate(${x0(label) ?? 0},0)`)

    series.forEach((s, si) => {
      group.append('rect')
        .attr('class', 'bc-bar bc-bar-multi')
        .attr('x', x1(s.name) ?? 0)
        .attr('y', y(s.values[i]))
        .attr('width', x1.bandwidth())
        .attr('height', height - y(s.values[i]))
        .attr('fill', colors[si % colors.length])
    })
  })

  if (options.legend !== false) {
    renderLegend(chartArea, seriesNames, colors)
  }
}
