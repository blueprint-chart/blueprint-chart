import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { createCanvas, contentSize, labelPositionMargins, estimateVerticalLabelWidth, estimateScaleLabelWidth } from './canvas'

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
  it('keeps the bottom margin for auto labels when showHorizontalAxis is false', () => {
    // showAxis only drops the domain line: the axis still draws its tick
    // labels, so collapsing the bottom margin painted them below the SVG.
    const result = labelPositionMargins(800, undefined, undefined, undefined, undefined, false)
    expect(result.bottom).toBeUndefined()
  })

  it('keeps the bottom margin for outside labels when showHorizontalAxis is false', () => {
    const result = labelPositionMargins(800, undefined, 'outside', undefined, undefined, false)
    expect(result.bottom).toBeUndefined()
  })

  it('still collapses the bottom margin when labels are off and the axis is hidden', () => {
    const result = labelPositionMargins(800, undefined, 'off', undefined, undefined, false)
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

describe('estimateVerticalLabelWidth', () => {
  // A cell the parser could not read arrives as `undefined`. Spread into
  // `Math.min`/`Math.max` it produced a NaN domain, no ticks, and a width of 0,
  // which collapsed the left margin and painted "2018" as "18".
  it('ignores a cell that is not a number', () => {
    expect(estimateVerticalLabelWidth([10, undefined as unknown as number, 30]))
      .toBe(estimateVerticalLabelWidth([10, 30]))
  })

  it('treats a column of unreadable cells like an empty one', () => {
    expect(estimateVerticalLabelWidth([undefined as unknown as number]))
      .toBe(estimateVerticalLabelWidth([]))
  })
})

describe('estimateScaleLabelWidth', () => {
  it('estimates label width from the scale it is given', () => {
    const linear = estimateScaleLabelWidth(d3.scaleLinear().domain([0, 100000]).nice())
    const log = estimateScaleLabelWidth(d3.scaleLog().domain([1, 100000]))
    expect(linear).toBeGreaterThan(0)
    expect(log).toBeGreaterThan(0)
    expect(log).not.toBe(linear)
  })
})

describe('contentSize', () => {
  it('reads the layout size of a container scaled by a CSS transform', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 125, bottom: 80, width: 125, height: 80, toJSON: () => ({}) })
    Object.defineProperty(el, 'offsetWidth', { value: 626 })
    Object.defineProperty(el, 'offsetHeight', { value: 400 })
    Object.defineProperty(el, 'clientWidth', { value: 626 })
    Object.defineProperty(el, 'clientHeight', { value: 400 })
    expect(contentSize(el)).toEqual({ width: 626, height: 400 })
  })

  it('keeps the fractional size of an untransformed container', () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 300.6, bottom: 200.4, width: 300.6, height: 200.4, toJSON: () => ({}) })
    Object.defineProperty(el, 'offsetWidth', { value: 301 })
    Object.defineProperty(el, 'offsetHeight', { value: 200 })
    Object.defineProperty(el, 'clientWidth', { value: 301 })
    Object.defineProperty(el, 'clientHeight', { value: 200 })
    expect(contentSize(el)).toEqual({ width: 300.6, height: 200.4 })
  })
})
