import { describe, it, expect } from 'vitest'
import { formatScatterTooltip } from './tooltip'

describe('formatScatterTooltip', () => {
  it('lists every mapped field with its column name', () => {
    const p = { name: 'Chad', x: 1500, y: 52.8, size: 18, group: 'Africa' }
    const m = { x: 'GDP per capita', y: 'Life expectancy', size: 'Population', group: 'Continent' }
    expect(formatScatterTooltip(p, m, {})).toBe('Chad\nGDP per capita: 1500\nLife expectancy: 52.8\nPopulation: 18\nContinent: Africa')
  })

  it('skips unmapped size and group', () => {
    expect(formatScatterTooltip({ name: 'a', x: 1, y: 2 }, { x: 'X', y: 'Y' }, {})).toBe('a\nX: 1\nY: 2')
  })

  it('formats x and y with their number formats', () => {
    expect(formatScatterTooltip({ name: 'a', x: 1500, y: 2 }, { x: 'X', y: 'Y' }, { x: ',.0f' })).toBe('a\nX: 1,500\nY: 2')
  })
})
