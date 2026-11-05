import { describe, it, expect } from 'vitest'
import { parseData } from '../charts/parse-data'
import { buildChartAccessibility } from './chart-a11y'

const DATA = parseData([
  'series = "GDP per capita","Life expectancy","Population","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
  '"Germany" = 50000, 81.0, 84, "Europe"',
  '"Chad" = 1500, 52.8, 18, "Africa"',
  '"Nigeria" = 5000, 53.9, 213, "Africa"',
  '"Japan" = 42000, 84.5, 125, "Asia"',
].join('\n'))

describe('buildChartAccessibility', () => {
  it('summarises a scatter as points', () => {
    expect(buildChartAccessibility('scatter', null, DATA).description).toBe('scatter chart of 5 points.')
  })
})
