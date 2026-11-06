import { describe, expect, it } from 'vitest'
import { getChartTypeLabel } from './chartType'

describe('getChartTypeLabel', () => {
  it('labels scatter charts', () => {
    expect(getChartTypeLabel('scatter')).toBe('Scatter')
  })

  it('labels dot plot charts', () => {
    expect(getChartTypeLabel('dot-plot')).toBe('Dot plot')
  })
})
