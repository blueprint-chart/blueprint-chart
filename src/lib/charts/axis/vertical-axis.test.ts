import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderVerticalAxis } from './vertical-axis'

describe('renderVerticalAxis', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleLinear<number, number>

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleLinear().domain([0, 100]).range([300, 0])
  })

  it('creates a vertical axis group', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    expect(g.classList.contains('bc-axis-vertical')).toBe(true)
  })

  it('removes tick lines by default', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    const tickLines = g.querySelectorAll('.tick line')
    expect(tickLines).toHaveLength(0)
  })

  it('keeps tick lines when showTicks is true', () => {
    const g = renderVerticalAxis(chartArea, scale, 300, { showTicks: true })
    const tickLines = g.querySelectorAll('.tick line')
    expect(tickLines.length).toBeGreaterThan(0)
  })

  it('applies dashed line style by default', () => {
    const g = renderVerticalAxis(chartArea, scale, 300)
    const domain = g.querySelector('.domain')
    expect(domain?.getAttribute('stroke-dasharray')).toBe('4,4')
  })

  it('removes domain line when lineStyle is none', () => {
    const g = renderVerticalAxis(chartArea, scale, 300, { lineStyle: 'none' })
    const domain = g.querySelector('.domain')
    expect(domain).toBeNull()
  })
})
