import { describe, it, expect } from 'vitest'
import { computeDirectionOffset, rotateDirectionForHorizontal, DIRECTION_VECTORS } from './direction-helpers'
import type { CompassDirection } from '../../types'

describe('computeDirectionOffset', () => {
  it('returns zero offset for center direction', () => {
    const { dx, dy } = computeDirectionOffset('center', 60)
    expect(dx).toBe(0)
    expect(dy).toBe(0)
  })

  it('returns negative dy for N (upward)', () => {
    const { dx, dy } = computeDirectionOffset('N', 60)
    expect(dx).toBe(0)
    expect(dy).toBe(-60)
  })

  it('returns positive dx for E (rightward)', () => {
    const { dx, dy } = computeDirectionOffset('E', 60)
    expect(dx).toBe(60)
    expect(dy).toBe(0)
  })

  it('scales proportionally with the distance argument', () => {
    const a = computeDirectionOffset('NE', 100)
    const b = computeDirectionOffset('NE', 200)
    expect(b.dx).toBeCloseTo(a.dx * 2)
    expect(b.dy).toBeCloseTo(a.dy * 2)
  })

  it('falls back to NW for an unknown direction', () => {
    const unknown = computeDirectionOffset('UNKNOWN' as CompassDirection, 10)
    const nw = computeDirectionOffset('NW', 10)
    expect(unknown.dx).toBeCloseTo(nw.dx)
    expect(unknown.dy).toBeCloseTo(nw.dy)
  })

  it('produces unit-length diagonals for cardinal inter-directions', () => {
    for (const dir of ['NE', 'SE', 'SW', 'NW'] as CompassDirection[]) {
      const v = DIRECTION_VECTORS[dir]
      const len = Math.sqrt(v.dx * v.dx + v.dy * v.dy)
      expect(len).toBeCloseTo(1, 2)
    }
  })
})

describe('rotateDirectionForHorizontal', () => {
  it('maps N → W (90° clockwise rotation for compass directions)', () => {
    expect(rotateDirectionForHorizontal('N')).toBe('W')
  })

  it('maps E → N', () => {
    expect(rotateDirectionForHorizontal('E')).toBe('N')
  })

  it('maps S → E', () => {
    expect(rotateDirectionForHorizontal('S')).toBe('E')
  })

  it('maps W → S', () => {
    expect(rotateDirectionForHorizontal('W')).toBe('S')
  })

  it('keeps center unchanged', () => {
    expect(rotateDirectionForHorizontal('center')).toBe('center')
  })

  it('returns the input unchanged for an unknown direction', () => {
    const unknown = 'UNKNOWN' as CompassDirection
    expect(rotateDirectionForHorizontal(unknown)).toBe(unknown)
  })
})
