import { describe, it, expect } from 'vitest'
import type * as d3 from 'd3'
import { ScaleType } from '../../../enums'
import { axisTransform, buildScatterScale } from './scales'

describe('buildScatterScale', () => {
  it('builds a true log10 scale that skips non-positive values', () => {
    const s = buildScatterScale(ScaleType.Log, [0, -5, 120, 45000])
    expect(typeof (s as d3.ScaleLogarithmic<number, number>).base).toBe('function')
    expect(s.domain()[0]).toBeGreaterThan(0)
  })

  it('ignores a range min <= 0 on a log10 axis', () => {
    expect(buildScatterScale(ScaleType.Log, [100, 1000], { min: 0 }).domain()[0]).toBeGreaterThan(0)
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
