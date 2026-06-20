import { describe, it, expect } from 'vitest'
import { interpolatePath } from './interpolate-path'

describe('interpolatePath', () => {
  it('interpolates numbers pairwise when command structure matches', () => {
    const f = interpolatePath('M0,10L10,20', 'M0,30L10,40')
    expect(f(0)).toBe('M0,10L10,20')
    expect(f(1)).toBe('M0,30L10,40')
    expect(f(0.5)).toBe('M0,20L10,30')
  })

  it('never emits NaN or fused digits (the d3-string-interp failure)', () => {
    const f = interpolatePath('M0,367L10,300L10,367L0,367Z', 'M0,263L10,200L10,263L0,263Z')
    for (let t = 0; t <= 1.0001; t += 0.25) {
      const d = f(Math.min(t, 1))
      expect(d).not.toMatch(/NaN/)
      // no number longer than 7 integer digits (catches fused values like 99951842796)
      expect(d).not.toMatch(/\d{8,}/)
    }
  })

  it('falls back to a clean switch when structures differ (no interpolation)', () => {
    const f = interpolatePath('M0,0L1,1', 'M0,0L1,1L2,2')
    expect(f(0)).toBe('M0,0L1,1')
    expect(f(1)).toBe('M0,0L1,1L2,2')
    expect(f(0.4)).toBe('M0,0L1,1') // before midpoint: old
    expect(f(0.6)).toBe('M0,0L1,1L2,2') // after midpoint: new
  })

  it('handles decimals and negatives without fusing', () => {
    const f = interpolatePath('M-1.5,10.25L2,3', 'M0.5,20.75L4,9')
    expect(f(0)).toBe('M-1.5,10.25L2,3')
    expect(f(1)).toBe('M0.5,20.75L4,9')
    expect(f(0.5)).toBe('M-0.5,15.5L3,6')
  })
})
