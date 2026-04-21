import { describe, it, expect } from 'vitest'
import { computeLinearDomain, filterLabelsByRange, resolveBarGapPadding, DEFAULT_BAR_GAP } from './scale-helpers'

describe('computeLinearDomain', () => {
  it('returns [0, max] for positive-only data', () => {
    expect(computeLinearDomain([5, 10, 15])).toEqual([0, 15])
  })

  it('returns [min, 0] for negative-only data', () => {
    expect(computeLinearDomain([-5, -10, -3])).toEqual([-10, 0])
  })

  it('returns [min, max] for mixed data', () => {
    expect(computeLinearDomain([-5, 10, -3])).toEqual([-5, 10])
  })

  it('respects custom range min', () => {
    expect(computeLinearDomain([5, 10], { min: -10 })).toEqual([-10, 10])
  })

  it('respects custom range max', () => {
    expect(computeLinearDomain([5, 10], { max: 100 })).toEqual([0, 100])
  })

  it('respects both custom min and max', () => {
    expect(computeLinearDomain([5, 10], { min: -20, max: 50 })).toEqual([-20, 50])
  })

  it('handles empty values', () => {
    const [lo, hi] = computeLinearDomain([])
    expect(lo).toBe(0)
    expect(hi).toBe(1)
  })

  it('handles all zeros', () => {
    const [lo, hi] = computeLinearDomain([0, 0, 0])
    expect(lo).toBe(0)
    expect(hi).toBe(1)
  })

  // ── Edge cases: custom min/max ──────────────────────────────────

  it('swaps inverted min/max (min > max)', () => {
    const [lo, hi] = computeLinearDomain([5, 10], { min: 50, max: 10 })
    expect(lo).toBe(10)
    expect(hi).toBe(50)
  })

  it('produces a non-zero extent when min === max (custom)', () => {
    const [lo, hi] = computeLinearDomain([5, 10], { min: 20, max: 20 })
    expect(lo).toBeLessThan(hi)
  })

  it('produces a non-zero extent when min=0 and max=0', () => {
    const [lo, hi] = computeLinearDomain([5, 10], { min: 0, max: 0 })
    expect(lo).toBeLessThan(hi)
  })

  it('produces a non-zero extent for all-zero data without custom range', () => {
    const [lo, hi] = computeLinearDomain([0, 0, 0])
    expect(lo).toBeLessThan(hi)
  })

  it('produces a non-zero extent for empty values', () => {
    const [lo, hi] = computeLinearDomain([])
    expect(lo).toBeLessThan(hi)
  })

  it('produces a non-zero extent when single value equals custom min and max', () => {
    const [lo, hi] = computeLinearDomain([5], { min: 5, max: 5 })
    expect(lo).toBeLessThan(hi)
  })

  it('handles custom range that excludes all data points', () => {
    const [lo, hi] = computeLinearDomain([1, 2, 3], { min: 100, max: 200 })
    expect(lo).toBe(100)
    expect(hi).toBe(200)
  })

  it('handles negative min with all positive data', () => {
    const [lo, hi] = computeLinearDomain([5, 10, 15], { min: -50 })
    expect(lo).toBe(-50)
    expect(hi).toBe(15)
  })
})

describe('filterLabelsByRange', () => {
  it('returns all indices when no range is provided', () => {
    expect(filterLabelsByRange(['A', 'B', 'C'])).toEqual([0, 1, 2])
  })

  it('returns all indices when range is empty', () => {
    expect(filterLabelsByRange(['A', 'B', 'C'], {})).toEqual([0, 1, 2])
  })

  it('filters year labels by min', () => {
    const labels = ['2000', '2005', '2010', '2015', '2020']
    const min = new Date('2010-01-01').getTime()
    const indices = filterLabelsByRange(labels, { min })
    expect(indices).toEqual([2, 3, 4])
  })

  it('filters year labels by max', () => {
    const labels = ['2000', '2005', '2010', '2015', '2020']
    const max = new Date('2010-01-01').getTime()
    const indices = filterLabelsByRange(labels, { max })
    expect(indices).toEqual([0, 1, 2])
  })

  it('filters year labels by min and max', () => {
    const labels = ['2000', '2005', '2010', '2015', '2020']
    const min = new Date('2005-01-01').getTime()
    const max = new Date('2015-01-01').getTime()
    const indices = filterLabelsByRange(labels, { min, max })
    expect(indices).toEqual([1, 2, 3])
  })

  it('keeps non-numeric labels', () => {
    const labels = ['Jan', 'Feb', 'Mar']
    const indices = filterLabelsByRange(labels, { min: 0, max: 100 })
    expect(indices).toEqual([0, 1, 2])
  })

  it('filters numeric labels', () => {
    const labels = ['10', '20', '30', '40', '50']
    const indices = filterLabelsByRange(labels, { min: 20, max: 40 })
    expect(indices).toEqual([1, 2, 3])
  })
})

describe('resolveBarGapPadding', () => {
  it('defaults to DEFAULT_BAR_GAP (60) when barGap is undefined', () => {
    expect(DEFAULT_BAR_GAP).toBe(60)
    expect(resolveBarGapPadding()).toBeCloseTo(60 / 160, 10)
    expect(resolveBarGapPadding(undefined)).toBeCloseTo(60 / 160, 10)
  })

  it('returns 0 when barGap is 0 (no gap)', () => {
    expect(resolveBarGapPadding(0)).toBe(0)
  })

  it('returns 0.5 when barGap is 100 (gap equals bar width)', () => {
    expect(resolveBarGapPadding(100)).toBeCloseTo(0.5, 10)
  })

  it('returns the correct padding for an intermediate value (50)', () => {
    // barGap = 50 → gap = 50% of bar, paddingInner = 50 / 150 = 1/3
    expect(resolveBarGapPadding(50)).toBeCloseTo(50 / 150, 10)
  })

  it('clamps values below 0 up to 0', () => {
    expect(resolveBarGapPadding(-25)).toBe(0)
  })

  it('clamps values above 100 down to 100', () => {
    expect(resolveBarGapPadding(200)).toBeCloseTo(0.5, 10)
  })

  it('falls back to default for non-finite values', () => {
    expect(resolveBarGapPadding(NaN)).toBeCloseTo(60 / 160, 10)
    expect(resolveBarGapPadding(Infinity)).toBeCloseTo(60 / 160, 10)
  })
})
