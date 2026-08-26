import { describe, it, expect } from 'vitest'
import { estimateLegendSize, estimateDirectLabelWidth } from './legend-size'
import { measureTextWidth } from '../text-measure'

describe('estimateLegendSize', () => {
  it('returns zero dimensions for empty labels', () => {
    expect(estimateLegendSize([], 'top')).toEqual({ width: 0, height: 0 })
  })

  describe('vertical position (left/right)', () => {
    it('calculates width from the longest label', () => {
      const result = estimateLegendSize(['AB', 'ABCDE'], 'left')
      // widest is "ABCDE" (30px measured), width = 30 + 16 + 8 = 54
      expect(result.width).toBe(54)
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
      // Foo: 16 + 18 + 12 = 46, Bar: 16 + 18 + 12 = 46
      expect(result.width).toBe(92)
      expect(result.height).toBe(20)
    })

    it('wraps into multiple rows when items exceed available width', () => {
      // Each label "ABCD" => 16 + 24 + 12 = 52px
      const result = estimateLegendSize(['ABCD', 'EFGH', 'IJKL'], 'bottom', 120)
      // Row 1: 52 + 52 = 104 <= 120, Row 2: + 52 = 156 > 120 -> wraps
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
    // widest is "Hello" (30px measured), width = 30 + 10 = 40
    expect(estimateDirectLabelWidth(['Hi', 'Hello'])).toBe(40)
  })

  it('handles single-character labels', () => {
    // "A" measures 6px, width = 6 + 10 = 16
    expect(estimateDirectLabelWidth(['A'])).toBe(16)
  })
})

describe('reserved size is measured, not counted (#35)', () => {
  const cjk = '日本語のラベル'

  it('reserves the measured width for a vertical legend of CJK labels', () => {
    expect(estimateLegendSize([cjk], 'left').width)
      .toBeGreaterThanOrEqual(measureTextWidth(cjk, 12) + 16 + 8)
  })

  it('reserves the measured width for a horizontal legend of CJK labels', () => {
    expect(estimateLegendSize([cjk], 'top').width)
      .toBeGreaterThanOrEqual(measureTextWidth(cjk, 12) + 16 + 12)
  })

  it('reserves the measured width for CJK direct labels', () => {
    expect(estimateDirectLabelWidth([cjk])).toBeGreaterThanOrEqual(measureTextWidth(cjk, 12))
  })
})
