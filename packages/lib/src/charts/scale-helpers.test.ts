import { describe, it, expect } from 'vitest'
import { computeLinearDomain, filterLabelsByRange } from './scale-helpers'

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
    expect(computeLinearDomain([])).toEqual([0, 0])
  })

  it('handles all zeros', () => {
    expect(computeLinearDomain([0, 0, 0])).toEqual([0, 0])
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
