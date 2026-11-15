import { describe, it, expect, vi } from 'vitest'
import { thinLabels } from './horizontal-axis'

// Browsers measure fractional widths; the jsdom canvas stub only returns whole pixels.
vi.mock('../text-measure', () => ({
  measureTextWidth: () => 23.4,
  measureMaxTextWidth: () => 23.4,
}))

describe('thinLabels with fractional label widths', () => {
  it('keeps every label that fits with the gap at its unrounded width', () => {
    const labels = Array.from({ length: 10 }, (_, i) => `Item ${i}`)
    // 315 / 10 = 31.5 px per label, and 23.4 + 8 = 31.4 fits.
    expect(thinLabels(labels, 315)).toHaveLength(10)
  })
})
