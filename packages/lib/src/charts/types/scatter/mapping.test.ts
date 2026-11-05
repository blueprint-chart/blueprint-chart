import { describe, it, expect } from 'vitest'
import { parseData } from '../../parse-data'
import { resolveScatterMapping } from './mapping'

const data = parseData([
  'series = "GDP per capita","Life expectancy","Population","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
].join('\n'))

describe('resolveScatterMapping', () => {
  it('infers x, y, size and group', () => {
    expect(resolveScatterMapping(data)).toEqual({ x: 'GDP per capita', y: 'Life expectancy', size: 'Population', group: 'Continent' })
  })

  it('swaps axes by name', () => {
    expect(resolveScatterMapping(data, { x: 'Life expectancy', y: 'GDP per capita' }))
      .toMatchObject({ x: 'Life expectancy', y: 'GDP per capita', size: 'Population' })
  })

  it('does not reuse a column claimed by an override', () => {
    expect(resolveScatterMapping(data, { x: 'Population' }))
      .toMatchObject({ x: 'Population', y: 'GDP per capita', size: 'Life expectancy' })
  })

  it('turns size and group off with "none"', () => {
    expect(resolveScatterMapping(data, { size: 'none', group: 'none' })).toEqual({ x: 'GDP per capita', y: 'Life expectancy' })
  })

  it('treats an empty override as auto', () => {
    expect(resolveScatterMapping(data, { x: '' }).x).toBe('GDP per capita')
  })

  it('leaves y undefined with a single numeric column', () => {
    expect(resolveScatterMapping(parseData('"a" = 1\n"b" = 2'))).toEqual({ x: 'value' })
  })
})
