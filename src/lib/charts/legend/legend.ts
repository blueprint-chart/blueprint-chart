import * as d3 from 'd3'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
]

export function renderLegend(
  chartArea: SVGGElement,
  labels: string[],
  colors: string[] = DEFAULT_COLORS,
  yOffset: number = -10,
): SVGGElement {
  const g = d3
    .select(chartArea)
    .append('g')
    .attr('class', 'bc-legend')
    .attr('transform', `translate(0,${yOffset})`)
    .node() as SVGGElement

  let xOffset = 0

  labels.forEach((label, i) => {
    const item = d3.select(g)
      .append('g')
      .attr('class', 'bc-legend-item')
      .attr('transform', `translate(${xOffset},0)`)

    item.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', colors[i % colors.length])

    item.append('text')
      .attr('x', 16)
      .attr('y', 10)
      .attr('font-size', '12px')
      .text(label)

    xOffset += 16 + label.length * 7 + 12
  })

  return g
}
