import { describe, it, expect } from 'vitest'
import { roleScan, tagsCompatible, ROLE_MATCH_THRESHOLD, shouldEscalateToFade } from './role-matcher'

const SVG_NS = 'http://www.w3.org/2000/svg'

describe('roleScan', () => {
  it('returns elements tagged with the given role, keyed by data-bc-key', () => {
    const container = document.createElement('div')
    const svg = document.createElementNS(SVG_NS, 'svg')
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('data-bc-role', 'mark-per-category')
    rect.setAttribute('data-bc-key', 'a')
    svg.appendChild(rect)
    container.appendChild(svg)
    const map = roleScan(container, 'mark-per-category')
    expect(map.size).toBe(1)
    expect(map.get('a')).toBe(rect)
  })

  it('excludes elements tagged with other roles', () => {
    const container = document.createElement('div')
    const svg = document.createElementNS(SVG_NS, 'svg')
    const a = document.createElementNS(SVG_NS, 'rect')
    a.setAttribute('data-bc-role', 'mark-per-category')
    a.setAttribute('data-bc-key', 'a')
    const b = document.createElementNS(SVG_NS, 'text')
    b.setAttribute('data-bc-role', 'value-label')
    b.setAttribute('data-bc-key', 'a')
    svg.appendChild(a)
    svg.appendChild(b)
    container.appendChild(svg)
    expect(roleScan(container, 'mark-per-category').size).toBe(1)
    expect(roleScan(container, 'value-label').size).toBe(1)
  })

  it('handles missing data-bc-key by skipping the element', () => {
    const container = document.createElement('div')
    const svg = document.createElementNS(SVG_NS, 'svg')
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('data-bc-role', 'mark-per-category')
    svg.appendChild(rect)
    container.appendChild(svg)
    expect(roleScan(container, 'mark-per-category').size).toBe(0)
  })
})

describe('tagsCompatible', () => {
  it('returns true for same tag names', () => {
    const a = document.createElementNS(SVG_NS, 'rect')
    const b = document.createElementNS(SVG_NS, 'rect')
    expect(tagsCompatible(a, b)).toBe(true)
  })

  it('returns false for different tag names', () => {
    const a = document.createElementNS(SVG_NS, 'rect')
    const b = document.createElementNS(SVG_NS, 'circle')
    expect(tagsCompatible(a, b)).toBe(false)
  })
})

describe('shouldEscalateToFade', () => {
  it('escalates when match ratio is below ROLE_MATCH_THRESHOLD', () => {
    expect(shouldEscalateToFade(0, 10)).toBe(true)
    expect(shouldEscalateToFade(4, 10)).toBe(true)
    expect(shouldEscalateToFade(5, 10)).toBe(false)
    expect(shouldEscalateToFade(10, 10)).toBe(false)
  })

  it('does not escalate when total is 0 (nothing to match)', () => {
    expect(shouldEscalateToFade(0, 0)).toBe(false)
  })

  it('uses ROLE_MATCH_THRESHOLD as a strict lower bound', () => {
    // Sanity: the threshold is 0.5 and 5/10 is exactly at the boundary
    // (not below it), so it must not escalate.
    expect(ROLE_MATCH_THRESHOLD).toBe(0.5)
    expect(shouldEscalateToFade(1, 2)).toBe(false)
  })
})
