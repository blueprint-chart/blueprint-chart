import { describe, it, expect, beforeEach } from 'vitest'
import { createCanvas } from './canvas'

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
    expect(chartArea.getAttribute('transform')).toBe('translate(50,20)')
  })

  it('calculates inner dimensions from default margin', () => {
    const { width, height } = createCanvas(body)
    expect(width).toBe(600 - 50 - 20)
    expect(height).toBe(400 - 20 - 40)
  })

  it('applies custom margin', () => {
    const { margin, chartArea } = createCanvas(body, { left: 100, top: 30 })
    expect(margin.left).toBe(100)
    expect(margin.top).toBe(30)
    expect(margin.right).toBe(20)
    expect(margin.bottom).toBe(40)
    expect(chartArea.getAttribute('transform')).toBe('translate(100,30)')
  })
})
