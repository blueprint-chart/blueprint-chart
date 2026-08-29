import { describe, it, expect } from 'vitest'
import { estimateLabelWidth } from './value-label-fit'
import { measureTextWidth } from './text-measure'

describe('value label width goes through the shared measurer (#134)', () => {
  it('agrees with the measurer rather than counting characters', () => {
    const text = '$1,200,000.0M'
    expect(estimateLabelWidth(text)).toBeGreaterThanOrEqual(measureTextWidth(text, 11))
  })

  it('reserves at least the old per-character estimate for a formatted number', () => {
    const text = '$1,200,000.0M'
    expect(estimateLabelWidth(text)).toBeGreaterThanOrEqual(text.length * 6.2)
  })
})
