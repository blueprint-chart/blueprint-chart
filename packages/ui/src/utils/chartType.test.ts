import { describe, expect, it } from 'vitest'
import { getChartTypeLabel } from './chartType'

describe('getChartTypeLabel', () => {
  it('labels scatter charts', () => {
    expect(getChartTypeLabel('scatter')).toBe('Scatter')
  })
})
