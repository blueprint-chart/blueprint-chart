import { describe, it, expect } from 'vitest'
import { SortDirection } from '../enums'
import { sortByValue, labelTotal } from './sort-helpers'

describe('sortByValue', () => {
  const labels = ['a', 'b', 'c', 'd']
  const values = [3, 1, 3, 2]
  const byValue = (_: string, i: number) => values[i]

  it('sorts descending and keeps ties in input order', () => {
    expect(sortByValue(labels, byValue, SortDirection.Descending)).toEqual(['a', 'c', 'd', 'b'])
  })

  it('sorts ascending and keeps ties in input order', () => {
    expect(sortByValue(labels, byValue, SortDirection.Ascending)).toEqual(['b', 'd', 'a', 'c'])
  })

  it.each([SortDirection.None, undefined])('keeps input order for %s', (direction) => {
    const sorted = sortByValue(labels, byValue, direction)
    expect(sorted).toEqual(labels)
    expect(sorted).not.toBe(labels)
  })

  it('does not mutate the input', () => {
    sortByValue(labels, byValue, SortDirection.Descending)
    expect(labels).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('labelTotal', () => {
  it('sums one category across series, counting missing values as zero', () => {
    const series = [{ values: [1, 2] }, { values: [10] }]
    expect(labelTotal(series, 0)).toBe(11)
    expect(labelTotal(series, 1)).toBe(2)
  })
})
