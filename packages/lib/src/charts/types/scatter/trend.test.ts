import { describe, expect, it } from 'vitest'
import { ScaleType } from '../../../enums'
import { fitLeastSquares, trendSegments } from './trend'

describe('scatter trend', () => {
  it('fits y = 2x', () => {
    expect(fitLeastSquares([1, 2, 3], [2, 4, 6])).toEqual({ slope: 2, intercept: 0 })
  })

  it('refuses fewer than 3 points and zero x-variance', () => {
    expect(fitLeastSquares([1, 2], [1, 2])).toBeNull()
    expect(fitLeastSquares([5, 5, 5], [1, 2, 3])).toBeNull()
  })

  it('fits in log space and never extrapolates', () => {
    const pts = [10, 100, 1000].map((x, i) => ({ name: String(i), x, y: i + 1 }))
    const { segments } = trendSegments(pts, 'overall', { x: ScaleType.Log })
    expect(segments).toHaveLength(1)
    expect(segments[0]).toMatchObject({ key: 'trend:overall', x1: 10, x2: 1000 })
    expect(segments[0].y1).toBeCloseTo(1)
    expect(segments[0].y2).toBeCloseTo(3)
  })

  it('fits per group and reports the groups it skipped', () => {
    const pts = [
      ...[1, 2, 3].map(x => ({ name: `a${x}`, x, y: x, group: 'A' })),
      ...[1, 2].map(x => ({ name: `b${x}`, x, y: x, group: 'B' })),
    ]
    const { segments, skipped } = trendSegments(pts, 'per-group', {})
    expect(segments.map(s => s.key)).toEqual(['trend:A'])
    expect(skipped).toEqual(['B'])
  })
})
