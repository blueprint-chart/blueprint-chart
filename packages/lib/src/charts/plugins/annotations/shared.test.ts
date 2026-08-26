import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { renderAnnotationText, renderTargetCircle } from './shared'
import { measureTextWidth } from '../../text-measure'

const ANNOTATION_FONT_PX = 12

describe('renderAnnotationText wrapping (#46)', () => {
  let g: SVGGElement

  beforeEach(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  function lines(): string[] {
    return [...g.querySelectorAll('tspan')].map(t => t.textContent ?? '')
  }

  function expectLinesFit(maxWidth: number): void {
    expect(lines().length).toBeGreaterThan(1)
    for (const line of lines()) {
      expect(measureTextWidth(line, ANNOTATION_FONT_PX)).toBeLessThanOrEqual(maxWidth)
    }
  }

  it('breaks a URL that has no whitespace to break on', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderAnnotationText(sel, 'https://example.com/a/very/long/path/to/somewhere', 0, 0, { maxWidth: 120 })
    expectLinesFit(120)
  })

  it('breaks a CJK sentence between characters', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderAnnotationText(sel, '這是一個很長的中文句子用來測試換行的行為', 0, 0, { maxWidth: 120 })
    expectLinesFit(120)
  })

  it('wraps on whitespace at the measured width', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderAnnotationText(sel, 'the quick brown fox jumps over the lazy dog', 0, 0, { maxWidth: 120 })
    expectLinesFit(120)
    expect(lines().join(' ')).toBe('the quick brown fox jumps over the lazy dog')
  })

  it('keeps an explicit newline as a hard break', () => {
    const sel = d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    renderAnnotationText(sel, 'first\nsecond', 0, 0, { maxWidth: 200 })
    expect(lines()).toEqual(['first', 'second'])
  })
})

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
