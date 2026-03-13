import { describe, it, expect, beforeEach } from 'vitest'
import { setupProximityInteraction } from './proximity'

describe('setupProximityInteraction', () => {
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

  const points = [
    { cx: 50, cy: 100, label: 'A', value: 10, color: '#4e79a7' },
    { cx: 150, cy: 80, label: 'B', value: 20, color: '#4e79a7' },
    { cx: 250, cy: 60, label: 'C', value: 30, color: '#4e79a7' },
  ]

  it('creates overlay rect and highlight dot', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points })

    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).not.toBeNull()
  })

  it('creates crosshair lines when crosshair is enabled', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true })

    expect(g.querySelector('.bc-crosshair-v')).not.toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).not.toBeNull()
  })

  it('does not create crosshair lines when crosshair is disabled', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: false })

    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).toBeNull()
  })

  it('returns cleanup function that removes elements', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true })

    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    cleanup()
    expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).toBeNull()
    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
  })

  it('sets stroke-dasharray via style for solid crosshairStyle', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairStyle: 'solid' })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine).not.toBeNull()
    // style.strokeDasharray must override any CSS class default
    expect(vLine.style.strokeDasharray).toBe('none')
  })

  it('sets stroke-dasharray via style for dotted crosshairStyle', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairStyle: 'dotted' })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine).not.toBeNull()
    expect(vLine.style.strokeDasharray).toBe('2,2')
  })

  it('sets stroke-dasharray via style for dashed crosshairStyle', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true, crosshairStyle: 'dashed' })

    const vLine = g.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine).not.toBeNull()
    expect(vLine.style.strokeDasharray).toBe('4,3')
  })

  it('does nothing with empty points', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points: [] })
    expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    cleanup()
  })
})
