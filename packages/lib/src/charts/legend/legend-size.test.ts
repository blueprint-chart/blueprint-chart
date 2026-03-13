import { describe, it, expect } from 'vitest'
import { estimateLegendSize, estimateDirectLabelWidth } from './legend-size'

describe('estimateLegendSize', () => {
  it('returns zero dimensions for empty labels', () => {
    expect(estimateLegendSize([], 'top')).toEqual({ width: 0, height: 0 })
  })

  describe('vertical position (left/right)', () => {
    it('calculates width from the longest label', () => {
      const result = estimateLegendSize(['AB', 'ABCDE'], 'left')
      // maxLen = 5, width = 5 * 7 + 16 + 8 = 59
      expect(result.width).toBe(59)
    })

    it('calculates height from the number of labels', () => {
      const result = estimateLegendSize(['A', 'B', 'C'], 'right')
      // 3 labels * 20 = 60
      expect(result.height).toBe(60)
    })
  })

  describe('horizontal position (top/bottom)', () => {
    it('returns single row when no available width', () => {
      const result = estimateLegendSize(['Foo', 'Bar'], 'top')
      // Foo: 16 + 3*7 + 12 = 49, Bar: 16 + 3*7 + 12 = 49
      expect(result.width).toBe(98)
      expect(result.height).toBe(20)
    })

    it('wraps into multiple rows when items exceed available width', () => {
      // Each label "ABCD" => 16 + 4*7 + 12 = 56px
      const result = estimateLegendSize(['ABCD', 'EFGH', 'IJKL'], 'bottom', 120)
      // Row 1: 56 + 56 = 112 <= 120, Row 2: + 56 = 168 > 120 -> wraps
      expect(result.height).toBe(40) // 2 rows
    })

    it('single row when all items fit', () => {
      const result = estimateLegendSize(['A', 'B'], 'top', 500)
      expect(result.height).toBe(20)
    })
  })
})

describe('estimateDirectLabelWidth', () => {
  it('returns 0 for empty labels', () => {
    expect(estimateDirectLabelWidth([])).toBe(0)
  })

  it('estimates width from the longest label', () => {
    // maxLen = 5 ("Hello"), width = 5 * 7 + 10 = 45
    expect(estimateDirectLabelWidth(['Hi', 'Hello'])).toBe(45)
  })

  it('handles single-character labels', () => {
    // maxLen = 1, width = 1 * 7 + 10 = 17
    expect(estimateDirectLabelWidth(['A'])).toBe(17)
  })
})
