import * as d3 from 'd3'
import type { AxisOptions } from '../types'

export function renderHorizontalAxis(
  chartArea: SVGGElement,
  scale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>,
  height: number,
  options: AxisOptions = {},
): SVGGElement {
  const position = options.tickPosition ?? 'below'
  const axisFn = position === 'above'
    ? d3.axisTop(scale as d3.AxisScale<string | d3.NumberValue>)
    : d3.axisBottom(scale as d3.AxisScale<string | d3.NumberValue>)

  if (options.ticks) {
    axisFn.tickValues(options.ticks as (string & d3.NumberValue)[])
  }

  if (options.numberFormat) {
    axisFn.tickFormat(d3.format(options.numberFormat) as (d: string | d3.NumberValue) => string)
  }

  const translateY = position === 'above' ? 0 : height

  const g = d3
    .select(chartArea)
    .append('g')
    .attr('class', 'bc-axis bc-axis-horizontal')
    .attr('transform', `translate(0,${translateY})`)
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
