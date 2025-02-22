import * as d3 from 'd3'
import type { AxisOptions } from '../types'

export function renderVerticalAxis(
  chartArea: SVGGElement,
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>,
  height: number,
  options: AxisOptions = {},
): SVGGElement {
  const direction = options.direction ?? 'left'
  const axisFn = direction === 'right' ? d3.axisRight(scale) : d3.axisLeft(scale)

  if (options.ticks) {
    axisFn.tickValues(options.ticks)
  }

  if (options.numberFormat) {
    axisFn.tickFormat(d3.format(options.numberFormat))
  }

  const g = d3
    .select(chartArea)
    .append('g')
    .attr('class', 'bc-axis bc-axis-vertical')
    .call(axisFn)
    .node() as SVGGElement

  if (!options.showTicks) {
    d3.select(g).selectAll('.tick line').remove()
  }

  applyLineStyle(g, options.lineStyle ?? 'dashed')

  return g
}

function applyLineStyle(g: SVGGElement, style: string): void {
  const domain = d3.select(g).select('.domain')
  switch (style) {
    case 'none':
      domain.remove()
      break
    case 'dashed':
      domain.attr('stroke-dasharray', '4,4')
      break
    case 'dotted':
      domain.attr('stroke-dasharray', '1,3')
      break
  }
}
