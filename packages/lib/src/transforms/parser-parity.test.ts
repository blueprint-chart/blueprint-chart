import { describe, it, expect } from 'vitest'
import { parseBpcData } from './table'
import { parseData } from '../charts/parse-data'

/** #136: two DSL data parsers that read the same input differently. */
describe('parseBpcData agrees with the canonical parser (#136)', () => {
  it('keeps a row whose label contains an escaped quote', () => {
    const src = '"5\\" pipe" = 3'
    expect(parseData(src).labels).toEqual(['5" pipe'])
    expect(parseBpcData(src).rows).toEqual([['5" pipe', '3']])
  })

  it('reads a series name containing a comma as one series', () => {
    const src = 'series = "Paris, France","Berlin"\n"2020" = 1,2'
    expect(parseBpcData(src).columns).toEqual(['label', 'Paris, France', 'Berlin'])
  })

  it('splits a multi-value cell at top level only', () => {
    const src = 'series = "A","B"\n"2020" = "1,5",2'
    expect(parseBpcData(src).rows).toEqual([['2020', '1,5', '2']])
  })

  it('strips the quotes from a space-grouped number', () => {
    const src = '"Alpha" = "1 234"'
    expect(parseBpcData(src).rows).toEqual([['Alpha', '1 234']])
  })
})
