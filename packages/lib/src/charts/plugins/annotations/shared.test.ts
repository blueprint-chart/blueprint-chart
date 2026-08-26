import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderTargetCircle } from './shared'

describe('renderTargetCircle radius (#121)', () => {
  let g: SVGGElement

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  function radius(): string | null {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    return sel.select('circle.bc-annotation-circle').attr('r')
  }

  it('falls back to the default radius when the size is negative', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderTargetCircle(sel, 10, 10, { size: -8 })
    expect(radius()).toBe('4')
  })

  it('falls back to the default radius when the size is zero', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderTargetCircle(sel, 10, 10, { size: 0 })
    expect(radius()).toBe('4')
  })

  it('keeps a positive size', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderTargetCircle(sel, 10, 10, { size: 6 })
    expect(radius()).toBe('6')
  })
})
