import { describe, it, expect } from 'vitest'
import { SortDirection, SortMode } from '../enums'
import { sortByValue, labelTotal, sortCategories, withinGroupSlots } from './sort-helpers'

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

describe('sortCategories', () => {
  const labels = ['a', 'b', 'c']
  const series = [
    { name: 'x', values: [1, 5, 3] },
    { name: 'y', values: [9, 0, 1] },
  ]

  it('keeps input order with no sort mode', () => {
    expect(sortCategories(labels, series, {})).toBe(labels)
  })

  it('sorts by total descending', () => {
    expect(sortCategories(labels, series, { sortMode: SortMode.Total })).toEqual(['a', 'b', 'c'])
  })

  it('sorts by the chosen series descending', () => {
    expect(sortCategories(labels, series, { sortMode: SortMode.Series, sortSeries: 'x' })).toEqual(['b', 'c', 'a'])
  })

  it('falls back to the first series when the chosen one is missing', () => {
    expect(sortCategories(labels, series, { sortMode: SortMode.Series, sortSeries: 'nope' })).toEqual(['b', 'c', 'a'])
  })

  it('reverses the sorted order', () => {
    expect(sortCategories(labels, series, { sortMode: SortMode.Series, sortSeries: 'y', sortReverse: true })).toEqual(['b', 'c', 'a'])
  })

  it('reverses the input order with no sort mode', () => {
    expect(sortCategories(labels, series, { sortReverse: true })).toEqual(['c', 'b', 'a'])
  })
})

describe('withinGroupSlots', () => {
  it('maps each bar to the slot of its rank within its category', () => {
    const slot = withinGroupSlots(['a', 'b'], [
      { name: 'x', values: [1, 5] },
      { name: 'y', values: [9, 0] },
    ])
    expect(slot('a', 'y')).toBe('x')
    expect(slot('a', 'x')).toBe('y')
    expect(slot('b', 'x')).toBe('x')
  })
})
