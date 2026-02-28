import { describe, it, expect } from 'vitest'
import { computeLinearDomain } from './scale-helpers'

describe('computeLinearDomain auto domain', () => {
  it('returns [0, max] for positive-only data', () => {
    expect(computeLinearDomain([5, 10, 15])).toEqual([0, 15])
  })

  it('returns [min, 0] for negative-only data', () => {
    expect(computeLinearDomain([-5, -10, -3])).toEqual([-10, 0])
  })

  it('returns [min, max] for mixed data', () => {
    expect(computeLinearDomain([-5, 10, -3])).toEqual([-5, 10])
  })

  it('handles empty values', () => {
    expect(computeLinearDomain([])).toEqual([0, 0])
  })

  it('handles all zeros', () => {
    expect(computeLinearDomain([0, 0, 0])).toEqual([0, 0])
  })
})

describe('computeLinearDomain custom range', () => {
  it('respects custom range min', () => {
    expect(computeLinearDomain([5, 10], { min: -10 })).toEqual([-10, 10])
  })

  it('respects custom range max', () => {
    expect(computeLinearDomain([5, 10], { max: 100 })).toEqual([0, 100])
  })

  it('respects both custom min and max', () => {
    expect(computeLinearDomain([5, 10], { min: -20, max: 50 })).toEqual([-20, 50])
  })
})
