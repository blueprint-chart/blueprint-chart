import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderHorizontalAxis } from './horizontal-axis'

describe('renderHorizontalAxis', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleBand<string>

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  })

  it('creates a horizontal axis group', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300)
    expect(g.classList.contains('bc-axis-horizontal')).toBe(true)
  })

  it('positions at bottom by default', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300)
    expect(g.getAttribute('transform')).toBe('translate(0,300)')
  })

  it('positions at top when tickPosition is above', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300, { tickPosition: 'above' })
    expect(g.getAttribute('transform')).toBe('translate(0,0)')
  })

  it('applies dashed line style by default', () => {
    const g = renderHorizontalAxis(chartArea, scale, 300)
    const domain = g.querySelector('.domain')
    expect(domain?.getAttribute('stroke-dasharray')).toBe('4,4')
  })
})
