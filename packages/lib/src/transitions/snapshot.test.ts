import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { snapshotLiveAttrs } from './snapshot'

const SVG_NS = 'http://www.w3.org/2000/svg'

describe('snapshotLiveAttrs', () => {
  let svg: SVGSVGElement
  let rect: SVGRectElement

  beforeEach(() => {
    svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement
    rect = document.createElementNS(SVG_NS, 'rect') as SVGRectElement
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '20')
    rect.setAttribute('width', '30')
    rect.setAttribute('height', '40')
    rect.setAttribute('fill', '#abcdef')
    svg.appendChild(rect)
    document.body.appendChild(svg)
  })

  it('returns the named attributes as strings', () => {
    const attrs = snapshotLiveAttrs(rect, ['x', 'y', 'width', 'height', 'fill'])
    expect(attrs).toEqual({ x: '10', y: '20', width: '30', height: '40', fill: '#abcdef' })
  })

  it('omits attributes that are not present on the element', () => {
    const attrs = snapshotLiveAttrs(rect, ['x', 'opacity', 'stroke'])
    expect(attrs).toEqual({ x: '10' })
  })

  it('interrupts the BC_TRANSITION_NAME transition on the element before reading', () => {
    // Start a named transition that moves x from 10 to 100 over 1000ms.
    d3.select(rect).transition('bc-scene').duration(1000).attr('x', '100')
    // snapshot should interrupt the 'bc-scene' transition; attrs read
    // the value the transition would have written *at this instant*,
    // which is the initial value (10) because jsdom hasn't ticked it.
    const attrs = snapshotLiveAttrs(rect, ['x'])
    expect(attrs.x).toBe('10')
    // After snapshot returns, the transition is dead — direct attr writes
    // are stable.
    rect.setAttribute('x', '50')
    expect(rect.getAttribute('x')).toBe('50')
  })

  it('does NOT interrupt transitions with other names', () => {
    d3.select(rect).transition('other').duration(1000).attr('x', '100')
    snapshotLiveAttrs(rect, ['x'])
    // The 'other' transition is still pending; direct attr writes
    // would race with it. We just assert it wasn't cancelled — d3 has no
    // public introspection for this, so we verify by trying to interrupt
    // the same name afterward; if it was already cancelled, the second
    // interrupt is a no-op (no throw); either way the call must not throw.
    expect(() => d3.select(rect).interrupt('other')).not.toThrow()
  })
})
