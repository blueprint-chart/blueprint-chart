import * as d3 from 'd3'
import type { ChartData, ChartOptions } from '../../types'
import { createFrame } from '../../frame/frame'
import { createCanvas } from '../../canvas/canvas'
import { renderHorizontalAxis } from '../../axis/horizontal-axis'

const DEFAULT_COLORS = ['#4e79a7']

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  const { body } = createFrame(container, options.frame)
  const { chartArea, width, height } = createCanvas(body)

  const labels = sortLabels(data, options)
  const values = labels.map(l => data.values[data.labels.indexOf(l)])

  const x = d3.scaleLinear()
    .domain([0, d3.max(values) ?? 0])
    .nice()
    .range([0, width])

  const y = d3.scaleBand<string>()
    .domain(labels)
    .range([0, height])
    .padding(0.2)

  renderHorizontalAxis(chartArea, x, height, options.horizontalAxis)

  // Render band axis on the left as a vertical axis workaround
  const axisFn = d3.axisLeft(y)
  d3.select(chartArea)
    .append('g')
    .attr('class', 'bc-axis bc-axis-vertical')
    .call(axisFn)

  const colors = options.colors ?? DEFAULT_COLORS
  const highlights = new Map(
    (options.highlights ?? []).map(h => [h.target, h.color]),
  )

  d3.select(chartArea)
    .selectAll('.bc-bar')
    .data(labels)
    .enter()
    .append('rect')
    .attr('class', 'bc-bar')
    .attr('x', 0)
    .attr('y', d => y(d) ?? 0)
    .attr('width', (_d, i) => x(values[i]))
    .attr('height', y.bandwidth())
    .attr('fill', d => highlights.get(d) ?? colors[0])
}

function sortLabels(data: ChartData, options: ChartOptions): string[] {
  const paired = data.labels.map((l, i) => ({ label: l, value: data.values[i] }))
  if (options.sort === 'ascending') {
    paired.sort((a, b) => a.value - b.value)
  }
  else if (options.sort === 'descending') {
    paired.sort((a, b) => b.value - a.value)
  }
  return paired.map(p => p.label)
}
