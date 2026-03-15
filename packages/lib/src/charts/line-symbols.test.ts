import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import * as d3 from 'd3'
import { shouldShowSymbol, renderLineSymbols } from './line-symbols'

// Suppress D3 transition timers that hit jsdom's missing baseVal on SVG transforms
const origMatchMedia = window.matchMedia
beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
})
afterAll(() => {
  window.matchMedia = origMatchMedia
})

describe('shouldShowSymbol', () => {
  it('returns true for all when showOn is all', () => {
    expect(shouldShowSymbol(0, 5, 'all')).toBe(true)
    expect(shouldShowSymbol(2, 5, 'all')).toBe(true)
    expect(shouldShowSymbol(4, 5, 'all')).toBe(true)
  })

  it('returns true only for first when showOn is first', () => {
    expect(shouldShowSymbol(0, 5, 'first')).toBe(true)
    expect(shouldShowSymbol(1, 5, 'first')).toBe(false)
    expect(shouldShowSymbol(4, 5, 'first')).toBe(false)
  })

  it('returns true only for last when showOn is last', () => {
    expect(shouldShowSymbol(0, 5, 'last')).toBe(false)
    expect(shouldShowSymbol(4, 5, 'last')).toBe(true)
  })

  it('returns true for first and last when showOn is firstLast', () => {
    expect(shouldShowSymbol(0, 5, 'firstLast')).toBe(true)
    expect(shouldShowSymbol(2, 5, 'firstLast')).toBe(false)
    expect(shouldShowSymbol(4, 5, 'firstLast')).toBe(true)
  })
})

describe('renderLineSymbols', () => {
  let svg: SVGSVGElement
  let g: SVGGElement

  beforeEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  afterEach(() => {
    // Interrupt pending D3 transitions to prevent async baseVal errors in jsdom
    d3.select(svg).selectAll('*').interrupt()
  })

  const points = [
    { cx: 10, cy: 100, color: '#4e79a7', index: 0 },
    { cx: 50, cy: 80, color: '#4e79a7', index: 1 },
    { cx: 90, cy: 60, color: '#4e79a7', index: 2 },
  ]

  it('renders circle symbols for all points', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'circle', showOn: 'all', style: 'filled', size: 4, opacity: 1 })

    const circles = g.querySelectorAll('.bc-symbol')
    expect(circles).toHaveLength(3)
    expect(circles[0].tagName).toBe('circle')
    expect(circles[0].getAttribute('r')).toBe('4')
  })

  it('renders only first and last for firstLast', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'circle', showOn: 'firstLast', size: 3.5 })

    const symbols = g.querySelectorAll('.bc-symbol')
    expect(symbols).toHaveLength(2)
  })

  it('renders hollow circles with stroke', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'circle', showOn: 'all', style: 'hollow', size: 3.5 })

    const circle = g.querySelector('.bc-symbol')!
    expect(circle.getAttribute('fill')).toBe('var(--bs-body-bg, #fff)')
    expect(circle.getAttribute('stroke')).toBe('#4e79a7')
  })

  it('renders path elements for non-circle symbols', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'square', showOn: 'all', size: 4 })

    const paths = g.querySelectorAll('.bc-symbol')
    expect(paths).toHaveLength(3)
    expect(paths[0].tagName).toBe('path')
    expect(paths[0].getAttribute('d')).toBeTruthy()
  })

  it('reuses existing circle elements on update with transition', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'circle', showOn: 'all', size: 4 })

    const originalElements = Array.from(g.querySelectorAll('.bc-symbol'))
    expect(originalElements).toHaveLength(3)

    // Update with new positions and transition=true
    const updatedPoints = [
      { cx: 20, cy: 90, color: '#4e79a7', index: 0 },
      { cx: 60, cy: 70, color: '#4e79a7', index: 1 },
      { cx: 100, cy: 50, color: '#4e79a7', index: 2 },
    ]
    renderLineSymbols(sel, updatedPoints, 3, { symbol: 'circle', showOn: 'all', size: 4 }, true)

    const afterElements = Array.from(g.querySelectorAll('.bc-symbol'))
    expect(afterElements).toHaveLength(3)
    // Same DOM nodes should be reused (not replaced)
    expect(afterElements[0]).toBe(originalElements[0])
    expect(afterElements[1]).toBe(originalElements[1])
    expect(afterElements[2]).toBe(originalElements[2])
  })

  it('reuses existing path elements on update with transition', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'diamond', showOn: 'all', size: 4 })

    const originalElements = Array.from(g.querySelectorAll('.bc-symbol'))
    expect(originalElements).toHaveLength(3)

    const updatedPoints = [
      { cx: 20, cy: 90, color: '#4e79a7', index: 0 },
      { cx: 60, cy: 70, color: '#4e79a7', index: 1 },
      { cx: 100, cy: 50, color: '#4e79a7', index: 2 },
    ]
    renderLineSymbols(sel, updatedPoints, 3, { symbol: 'diamond', showOn: 'all', size: 4 }, true)

    const afterElements = Array.from(g.querySelectorAll('.bc-symbol'))
    expect(afterElements).toHaveLength(3)
    // Same DOM nodes should be reused (not replaced)
    expect(afterElements[0]).toBe(originalElements[0])
    expect(afterElements[1]).toBe(originalElements[1])
    expect(afterElements[2]).toBe(originalElements[2])
  })

  it('applies transition to updated circle positions', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderLineSymbols(sel, points, 3, { symbol: 'circle', showOn: 'all', size: 4 })

    const updatedPoints = [
      { cx: 20, cy: 90, color: '#4e79a7', index: 0 },
      { cx: 60, cy: 70, color: '#4e79a7', index: 1 },
      { cx: 100, cy: 50, color: '#4e79a7', index: 2 },
    ]
    renderLineSymbols(sel, updatedPoints, 3, { symbol: 'circle', showOn: 'all', size: 4 }, true)

    // With transition, d3 schedules the target values; the immediate attr may still
    // be old. But we can verify a transition is scheduled on the elements.
    const firstSymbol = g.querySelector('.bc-symbol')!
    // d3 stores active transitions in __transition on the node
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transitionState = (firstSymbol as any).__transition
    expect(transitionState).toBeTruthy()
  })
})
