import { describe, it, expect } from 'vitest'
import { formatDotPlotTooltip } from './tooltip'

describe('formatDotPlotTooltip', () => {
  it('lists every value column for a dumbbell row', () => {
    expect(formatDotPlotTooltip({ name: 'a', values: [10, 30] }, { mode: 'dumbbell', values: ['2015', '2024'], ignored: [] }))
      .toBe('a\n2015: 10\n2024: 30')
  })
  it('shows value, low and high for a range row', () => {
    expect(formatDotPlotTooltip({ name: 'SPD', values: [14], low: 12, high: 16 }, { mode: 'range', values: ['Poll'], low: 'Low', high: 'High', ignored: [] }))
      .toBe('SPD\nPoll: 14\nLow: 12\nHigh: 16')
  })
  it('applies the number format', () => {
    expect(formatDotPlotTooltip({ name: 'a', values: [0.5] }, { mode: 'single', values: ['value'], ignored: [] }, '.0%'))
      .toBe('a\nvalue: 50%')
  })
})
