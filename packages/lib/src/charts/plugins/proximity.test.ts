import { describe, it, expect, beforeEach } from 'vitest'
import { setupProximityInteraction } from './proximity'

function createSvgSetup(): { svg: SVGSVGElement, g: SVGGElement } {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(g)
  document.body.appendChild(svg)
  return { svg, g }
}

const points = [
  { cx: 50, cy: 100, label: 'A', value: 10, color: '#4e79a7' },
  { cx: 150, cy: 80, label: 'B', value: 20, color: '#4e79a7' },
  { cx: 250, cy: 60, label: 'C', value: 30, color: '#4e79a7' },
]

describe('setupProximityInteraction: elements', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('creates overlay rect and highlight dot', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points })
    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).not.toBeNull()
  })

  it('does nothing with empty points', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points: [] })
    expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    cleanup()
  })
})

describe('setupProximityInteraction: crosshair', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('creates crosshair lines when enabled', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true })
    expect(g.querySelector('.bc-crosshair-v')).not.toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).not.toBeNull()
  })

  it('does not create crosshair lines when disabled', () => {
    setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: false })
    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
    expect(g.querySelector('.bc-crosshair-h')).toBeNull()
  })
})

describe('setupProximityInteraction: cleanup', () => {
  let g: SVGGElement
  beforeEach(() => {
    g = createSvgSetup().g
  })

  it('returns cleanup function that removes elements', () => {
    const cleanup = setupProximityInteraction(g, { width: 400, height: 300, points, crosshair: true })
    expect(g.querySelector('.bc-proximity-overlay')).not.toBeNull()
    cleanup()
    expect(g.querySelector('.bc-proximity-overlay')).toBeNull()
    expect(g.querySelector('.bc-proximity-dot')).toBeNull()
    expect(g.querySelector('.bc-crosshair-v')).toBeNull()
  })
})
