import { describe, it, expect, beforeEach } from 'vitest'
import { createCanvas, labelPositionMargins } from './canvas'

describe('createCanvas', () => {
  let body: HTMLElement

  beforeEach(() => {
    body = document.createElement('div')
  })

  it('creates an SVG element', () => {
    const { svg } = createCanvas(body)
    expect(svg.tagName).toBe('svg')
    expect(body.contains(svg)).toBe(true)
  })

  it('uses default dimensions when container has no size', () => {
    const { svg } = createCanvas(body)
    expect(svg.getAttribute('width')).toBe('600')
    expect(svg.getAttribute('height')).toBe('400')
  })

  it('creates a chart area group with margin transform', () => {
    const { chartArea } = createCanvas(body)
    expect(chartArea.tagName).toBe('g')
    expect(chartArea.getAttribute('transform')).toBe('translate(50,12)')
  })

  it('calculates inner dimensions from default margin', () => {
    const { width, height } = createCanvas(body)
    expect(width).toBe(600 - 50 - 20)
    expect(height).toBe(400 - 12 - 24)
  })

  it('applies custom margin', () => {
    const { margin, chartArea } = createCanvas(body, { left: 100, top: 30 })
    expect(margin.left).toBe(100)
    expect(margin.top).toBe(30)
    expect(margin.right).toBe(20)
    expect(margin.bottom).toBe(24)
    expect(chartArea.getAttribute('transform')).toBe('translate(100,30)')
  })
})

describe('labelPositionMargins', () => {
  it('reduces bottom margin when showHorizontalAxis is false', () => {
    const result = labelPositionMargins(800, undefined, undefined, undefined, undefined, false)
    expect(result.bottom).toBe(5)
  })

  it('keeps default bottom margin when showHorizontalAxis is true', () => {
    const result = labelPositionMargins(800, undefined, undefined, undefined, undefined, true)
    expect(result.bottom).toBeUndefined()
  })

  it('keeps default bottom margin when showHorizontalAxis is undefined', () => {
    const result = labelPositionMargins(800)
    expect(result.bottom).toBeUndefined()
  })

  it('provides minimum right margin for last horizontal axis label when vDir is left', () => {
    const result = labelPositionMargins(800, undefined, undefined, 'left')
    expect(result.right).toBeGreaterThan(0)
  })

  it('provides minimum right margin by default (vDir defaults to left)', () => {
    const result = labelPositionMargins(800)
    expect(result.right).toBeGreaterThan(0)
  })

  it('sets right margin to 0 when horizontal axis is hidden', () => {
    const result = labelPositionMargins(800, undefined, undefined, 'left', undefined, false)
    expect(result.right).toBe(0)
  })

  it('keeps default bottom margin for "auto" horizontal labels even on narrow charts', () => {
    // Regression: previously narrow charts (< 400px) auto-switched horizontal
    // labels to "inside" and collapsed bottom margin to 5px, which caused the
    // axis (which still renders labels outside) to clip them against the SVG
    // bottom edge. Category labels never go inside automatically anymore.
    const result = labelPositionMargins(300)
    expect(result.bottom).toBeUndefined()
  })

  it('collapses bottom margin when horizontal labels are explicitly "inside"', () => {
    const result = labelPositionMargins(800, undefined, 'inside')
    expect(result.bottom).toBe(5)
  })

  it('collapses bottom margin when horizontal labels are "off"', () => {
    const result = labelPositionMargins(800, undefined, 'off')
    expect(result.bottom).toBe(5)
  })

  it('reserves a 2px left buffer in auto/inside mode for left-axis charts', () => {
    // containerWidth < 400 triggers AUTO_INSIDE_THRESHOLD => inside mode.
    // Default vDir is 'left'.
    const result = labelPositionMargins(300)
    expect(result.left).toBe(2)
  })

  it('reserves a 2px right buffer in auto/inside mode for right-axis charts', () => {
    const result = labelPositionMargins(300, undefined, undefined, 'right')
    expect(result.right).toBe(2)
  })

  it('keeps off-mode label margin at 0 (no buffer needed when labels are hidden)', () => {
    // Explicit 'off' label position must NOT receive the inside buffer.
    const result = labelPositionMargins(300, 'off')
    expect(result.left).toBe(0)
  })
})
