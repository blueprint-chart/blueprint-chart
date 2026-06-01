import { describe, it, expect } from 'vitest'
import { HIGHLIGHT_DIM_OPACITY, highlightTargetSet, highlightOpacity } from './highlight'

describe('highlight helper', () => {
  it('HIGHLIGHT_DIM_OPACITY is 0.35', () => {
    expect(HIGHLIGHT_DIM_OPACITY).toBe(0.35)
  })

  it('highlightTargetSet collects targets', () => {
    expect(highlightTargetSet([{ target: 'A' }, { target: 'B' }])).toEqual(new Set(['A', 'B']))
    expect(highlightTargetSet(undefined)).toEqual(new Set())
  })

  it('highlightOpacity returns base when no targets', () => {
    expect(highlightOpacity(new Set(), 'A')).toBe(1)
    expect(highlightOpacity(new Set(), 'A', 0.85)).toBe(0.85)
  })

  it('highlightOpacity returns base for a targeted key, dim for others', () => {
    const t = new Set(['A'])
    expect(highlightOpacity(t, 'A')).toBe(1)
    expect(highlightOpacity(t, 'A', 0.85)).toBe(0.85)
    expect(highlightOpacity(t, 'B')).toBe(0.35)
    expect(highlightOpacity(t, 'B', 0.85)).toBe(0.35)
  })
})
