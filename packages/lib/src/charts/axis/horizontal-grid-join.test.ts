import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderHorizontalAxis } from './horizontal-axis'

describe('the horizontal grid is a data join, not an append (#142)', () => {
  let chartArea: SVGGElement
  let scale: d3.ScaleBand<string>

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chartArea = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(chartArea)
    document.body.appendChild(svg)
    scale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  })

  function gridLines(g: SVGGElement): number {
    return g.querySelectorAll('.bc-grid-line').length
  }

  it('does not stack a second grid on re-render', () => {
    const first = renderHorizontalAxis(chartArea, scale, 300, { width: 300, gridStyle: 'solid' })
    const before = gridLines(first)
    expect(before).toBeGreaterThan(0)
    // No prior element: renderHorizontalAxis only strips .bc-grid-line when one
    // is passed, which is what has been masking the missing join.
    const second = renderHorizontalAxis(chartArea, scale, 300, { width: 300, gridStyle: 'solid' })
    expect(gridLines(second)).toBe(before)
  })

  it('removes the grid when the style becomes none', () => {
    const first = renderHorizontalAxis(chartArea, scale, 300, { width: 300, gridStyle: 'solid' })
    expect(gridLines(first)).toBeGreaterThan(0)
    const second = renderHorizontalAxis(chartArea, scale, 300, { width: 300, gridStyle: 'none' })
    expect(gridLines(second)).toBe(0)
  })
})
