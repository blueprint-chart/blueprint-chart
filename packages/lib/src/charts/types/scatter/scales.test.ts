import { describe, it, expect } from 'vitest'
import type * as d3 from 'd3'
import { ScaleType } from '../../../enums'
import { axisTransform, buildScatterScale, fitRange } from './scales'

describe('buildScatterScale', () => {
  it('builds a true log10 scale that skips non-positive values', () => {
    const s = buildScatterScale(ScaleType.Log, [0, -5, 120, 45000])
    expect(typeof (s as d3.ScaleLogarithmic<number, number>).base).toBe('function')
    expect(s.domain()[0]).toBeGreaterThan(0)
  })

  it('ignores a range min <= 0 on a log10 axis', () => {
    expect(buildScatterScale(ScaleType.Log, [100, 1000], { min: 0 }).domain()[0]).toBeGreaterThan(0)
  })

  it('ignores a string range min <= 0 on a log10 axis', () => {
    const ignored = buildScatterScale(ScaleType.Log, [100, 1000], { min: '0' }).domain()
    expect(ignored).toEqual(buildScatterScale(ScaleType.Log, [100, 1000]).domain())
  })

  it('keeps a valid log10 domain when no positive value remains', () => {
    for (const values of [[0, -5], []]) {
      const [lo, hi] = buildScatterScale(ScaleType.Log, values).domain()
      expect(lo).toBeGreaterThan(0)
      expect(Number.isFinite(hi)).toBe(true)
    }
  })

  it('honors log range bounds when no positive value remains', () => {
    expect(buildScatterScale(ScaleType.Log, [0, -5], { min: 10, max: 1000 }).domain()).toEqual([10, 1000])
  })

  it('builds a symlog scale that keeps zero', () => {
    expect(buildScatterScale(ScaleType.Symlog, [0, 100]).domain()[0]).toBe(0)
  })

  it('does not anchor a linear axis at zero', () => {
    expect(buildScatterScale(undefined, [50, 85]).domain()[0]).toBeGreaterThan(0)
  })
})

describe('axisTransform', () => {
  it('round-trips every axis transform', () => {
    for (const t of [undefined, ScaleType.Log, ScaleType.Symlog]) {
      const { forward, inverse } = axisTransform(t)
      expect(inverse(forward(250))).toBeCloseTo(250)
    }
  })
})

describe('fitRange', () => {
  const scale = () => buildScatterScale(undefined, [0, 100])

  it('reserves no margin for a big bubble in the middle', () => {
    const [lo, hi] = fitRange(scale(), [{ value: 50, r: 40 }, { value: 0, r: 2 }, { value: 100, r: 2 }], 500)
    expect(lo).toBeCloseTo(2, 5)
    expect(hi).toBeCloseTo(498, 5)
  })

  it('keeps every bubble inside the plot', () => {
    const items = [{ value: 0, r: 30 }, { value: 10, r: 45 }, { value: 95, r: 20 }, { value: 100, r: 5 }]
    const s = scale()
    s.range(fitRange(s, items, 400))
    for (const { value, r } of items) {
      expect(s(value) - r).toBeGreaterThanOrEqual(-1e-6)
      expect(s(value) + r).toBeLessThanOrEqual(400 + 1e-6)
    }
  })
})

describe('fitRange edge padding', () => {
  it('keeps the domain ends clear of the plot edges by the requested pad', () => {
    const [lo, hi] = fitRange(buildScatterScale(undefined, [0, 100]), [{ value: 50, r: 10 }], 300, 8)
    expect(lo).toBeCloseTo(8, 5)
    expect(hi).toBeCloseTo(292, 5)
  })
})
