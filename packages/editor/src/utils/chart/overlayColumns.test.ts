import { describe, expect, it } from 'vitest'
import { nextOverlayColumn } from './overlayColumns'

describe('nextOverlayColumn', () => {
  it('prefers a free column over a claimed one', () => {
    expect(nextOverlayColumn(['Sales', 'Target', 'Budget'], ['Target'], 'Sales')).toBe('Budget')
  })

  it('reuses a claimed column once no column is free', () => {
    expect(nextOverlayColumn(['Sales', 'Target'], ['Target'], 'Sales')).toBe('Target')
  })

  it('never reuses a claimed column that is no longer in the data', () => {
    expect(nextOverlayColumn(['Sales'], ['Old'], 'Sales')).toBeUndefined()
  })

  it('reuses another claimed column for the upper bound of a range', () => {
    expect(nextOverlayColumn(['Sales', 'Target', 'Budget'], ['Budget', 'Target'], 'Sales', 'Target')).toBe('Budget')
  })

  it('never pairs a range bound with itself', () => {
    expect(nextOverlayColumn(['Sales', 'Target'], ['Target'], 'Sales', 'Target')).toBeUndefined()
  })
})
