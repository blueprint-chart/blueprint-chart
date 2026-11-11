import { describe, expect, it } from 'vitest'
import { leastUsedColumn, nextOverlayColumn } from './overlayColumns'

describe('nextOverlayColumn', () => {
  it('prefers a free column over a claimed one', () => {
    expect(nextOverlayColumn(['Sales', 'Target', 'Budget'], ['Target'], 'Sales')).toBe('Budget')
  })

  it('never reuses a claimed column for the upper bound of a range', () => {
    expect(nextOverlayColumn(['Sales', 'Target', 'Budget'], ['Budget', 'Target'], 'Sales', 'Target')).toBeUndefined()
  })

  it('never pairs a range bound with itself', () => {
    expect(nextOverlayColumn(['Sales', 'Target'], ['Target'], 'Sales', 'Target')).toBeUndefined()
  })
})

describe('leastUsedColumn', () => {
  it('picks the claimed column with the fewest uses', () => {
    expect(leastUsedColumn(['Sales', 'Target', 'Budget'], ['Target', 'Budget', 'Target'])).toBe('Budget')
  })

  it('breaks ties in table order', () => {
    expect(leastUsedColumn(['Sales', 'Target', 'Budget'], ['Budget', 'Target'])).toBe('Target')
  })

  it('never reuses a claimed column that is no longer in the data', () => {
    expect(leastUsedColumn(['Sales'], ['Old'])).toBeUndefined()
  })
})
