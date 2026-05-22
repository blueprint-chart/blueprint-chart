import { describe, it, expect, beforeEach } from 'vitest'
import { ensureClipPath } from './clip-path-helper'

function makeSvg(): SVGSVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', 'svg')
}

describe('ensureClipPath', () => {
  let container: HTMLDivElement
  let svg: SVGSVGElement

  beforeEach(() => {
    container = document.createElement('div')
    svg = makeSvg()
    container.appendChild(svg)
  })

  it('creates one clipPath on first call', () => {
    const id = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width: 100, height: 50 })
    expect(id).toMatch(/^bc-clip-\d+$/)
    expect(svg.querySelectorAll('defs > clipPath').length).toBe(1)
    const rect = svg.querySelector('clipPath > rect')!
    expect(rect.getAttribute('width')).toBe('100')
    expect(rect.getAttribute('height')).toBe('50')
  })

  it('reuses the same id and updates rect on subsequent calls with the same container+key', () => {
    const id1 = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width: 100, height: 50 })
    const id2 = ensureClipPath(svg, container, 'plot', { x: 5, y: 5, width: 200, height: 80 })
    expect(id2).toBe(id1)
    expect(svg.querySelectorAll('defs > clipPath').length).toBe(1)
    const rect = svg.querySelector('clipPath > rect')!
    expect(rect.getAttribute('x')).toBe('5')
    expect(rect.getAttribute('width')).toBe('200')
  })

  it('creates a fresh clipPath when the SVG is wiped but the container persists', () => {
    const id1 = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width: 100, height: 50 })
    container.replaceChildren()
    const svg2 = makeSvg()
    container.appendChild(svg2)
    const id2 = ensureClipPath(svg2, container, 'plot', { x: 0, y: 0, width: 120, height: 60 })
    expect(id2).toBe(id1)
    expect(svg2.querySelectorAll('defs > clipPath').length).toBe(1)
  })

  it('uses distinct ids for different keys on the same container', () => {
    const a = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width: 100, height: 50 })
    const b = ensureClipPath(svg, container, 'overlay', { x: 0, y: 0, width: 50, height: 25 })
    expect(a).not.toBe(b)
    expect(svg.querySelectorAll('defs > clipPath').length).toBe(2)
  })

  it('uses distinct ids for different containers', () => {
    const container2 = document.createElement('div')
    const svg2 = makeSvg()
    container2.appendChild(svg2)
    const a = ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width: 100, height: 50 })
    const b = ensureClipPath(svg2, container2, 'plot', { x: 0, y: 0, width: 100, height: 50 })
    expect(a).not.toBe(b)
  })

  it('does not accumulate clipPaths across 10 rerenders on the same container', () => {
    for (let i = 0; i < 10; i++) {
      ensureClipPath(svg, container, 'plot', { x: 0, y: 0, width: 100 + i, height: 50 })
    }
    expect(svg.querySelectorAll('defs > clipPath').length).toBe(1)
  })
})
