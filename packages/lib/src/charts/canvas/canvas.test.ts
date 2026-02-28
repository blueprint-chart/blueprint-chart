import { describe, it, expect } from 'vitest'
import { createCanvas } from './canvas'

describe('createCanvas SVG creation', () => {
  it('creates an SVG element', () => {
    const body = document.createElement('div')
    const { svg } = createCanvas(body)
    expect(svg.tagName).toBe('svg')
    expect(body.contains(svg)).toBe(true)
  })

  it('uses default dimensions when container has no size', () => {
    const body = document.createElement('div')
    const { svg } = createCanvas(body)
    expect(svg.getAttribute('width')).toBe('600')
    expect(svg.getAttribute('height')).toBe('400')
  })
})

describe('createCanvas layout', () => {
  it('creates a chart area group with margin transform', () => {
    const body = document.createElement('div')
    const { chartArea } = createCanvas(body)
    expect(chartArea.tagName).toBe('g')
    expect(chartArea.getAttribute('transform')).toBe('translate(50,20)')
  })

  it('calculates inner dimensions from default margin', () => {
    const body = document.createElement('div')
    const { width, height } = createCanvas(body)
    expect(width).toBe(600 - 50 - 20)
    expect(height).toBe(400 - 20 - 40)
  })

  it('applies custom margin', () => {
    const body = document.createElement('div')
    const { margin, chartArea } = createCanvas(body, { left: 100, top: 30 })
    expect(margin.left).toBe(100)
    expect(margin.top).toBe(30)
    expect(margin.right).toBe(20)
    expect(margin.bottom).toBe(40)
    expect(chartArea.getAttribute('transform')).toBe('translate(100,30)')
  })
})
