import { describe, it, expect } from 'vitest'
import { computeStack, computeStack100 } from './stack-helpers'
import type { ChartData } from './types'

describe('computeStack', () => {
  it('returns empty array when there are no series', () => {
    const data: ChartData = { labels: ['A', 'B'], values: [1, 2] }
    expect(computeStack(data)).toEqual([])
  })

  it('computes a stacked layout from multi-series data', () => {
    const data: ChartData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'S1', values: [10, 20] },
        { name: 'S2', values: [30, 40] },
      ],
    }
    const result = computeStack(data)
    expect(result).toHaveLength(2)

    // First series (S1): baseline at 0
    expect(result[0].key).toBe('S1')
    expect(result[0][0][0]).toBe(0) // y0
    expect(result[0][0][1]).toBe(10) // y1
    expect(result[0][1][0]).toBe(0)
    expect(result[0][1][1]).toBe(20)

    // Second series (S2): stacked on top of S1
    expect(result[1].key).toBe('S2')
    expect(result[1][0][0]).toBe(10) // y0 = S1 top
    expect(result[1][0][1]).toBe(40) // y1 = 10 + 30
    expect(result[1][1][0]).toBe(20)
    expect(result[1][1][1]).toBe(60) // 20 + 40
  })

  it('treats missing values as 0', () => {
    const data: ChartData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'S1', values: [10] }, // missing second value
        { name: 'S2', values: [5, 15] },
      ],
    }
    const result = computeStack(data)
    // S1 second point should be 0
    expect(result[0][1][0]).toBe(0)
    expect(result[0][1][1]).toBe(0)
  })
})

describe('computeStack100', () => {
  it('returns empty array when there are no series', () => {
    const data: ChartData = { labels: ['A'], values: [1] }
    expect(computeStack100(data)).toEqual([])
  })

  it('normalizes values to sum to 100 per category', () => {
    const data: ChartData = {
      labels: ['A'],
      values: [],
      series: [
        { name: 'S1', values: [25] },
        { name: 'S2', values: [75] },
      ],
    }
    const result = computeStack100(data)
    expect(result).toHaveLength(2)

    // S1: 25 / 100 * 100 = 25
    expect(result[0][0][0]).toBe(0)
    expect(result[0][0][1]).toBe(25)

    // S2: 75 / 100 * 100 = 75, stacked: 25 to 100
    expect(result[1][0][0]).toBe(25)
    expect(result[1][0][1]).toBe(100)
  })

  it('handles a category where all values are zero', () => {
    const data: ChartData = {
      labels: ['A'],
      values: [],
      series: [
        { name: 'S1', values: [0] },
        { name: 'S2', values: [0] },
      ],
    }
    const result = computeStack100(data)
    expect(result[0][0][0]).toBe(0)
    expect(result[0][0][1]).toBe(0)
    expect(result[1][0][0]).toBe(0)
    expect(result[1][0][1]).toBe(0)
  })

  it('handles unequal series values correctly', () => {
    const data: ChartData = {
      labels: ['X'],
      values: [],
      series: [
        { name: 'A', values: [30] },
        { name: 'B', values: [10] },
        { name: 'C', values: [60] },
      ],
    }
    const result = computeStack100(data)
    // Total = 100, so percentages match raw values
    expect(result[0][0][1]).toBe(30)
    expect(result[1][0][1]).toBe(40) // 30 + 10
    expect(result[2][0][1]).toBe(100) // 30 + 10 + 60
  })

  // ── N4: diverging data normalisation ─────────────────────────────

  it('normalises diverging rows so the signed segments sum to 100', () => {
    // Pre-fix bug: the denominator used Math.abs while the numerator used the
    // raw value, so this row didn't sum to 100. After switching to
    // stackOffsetExpand the signed segments add up to the row's signed total
    // (100), and the layout no longer double-counts negative magnitudes.
    const data: ChartData = {
      labels: ['X'],
      values: [],
      series: [
        { name: 'A', values: [10] },
        { name: 'B', values: [-5] },
        { name: 'C', values: [3] },
      ],
    }
    const result = computeStack100(data)
    expect(result).toHaveLength(3)

    const signedSum = result.reduce((sum, layer) => sum + (layer[0][1] - layer[0][0]), 0)
    expect(signedSum).toBeCloseTo(100, 6)
  })

  it('symmetry fix: numerator and denominator agree for every row', () => {
    const data: ChartData = {
      labels: ['Row1', 'Row2', 'Row3'],
      values: [],
      series: [
        { name: 'A', values: [10, 50, -20] },
        { name: 'B', values: [-5, 50, 30] },
        { name: 'C', values: [3, 0, 10] },
      ],
    }
    const result = computeStack100(data)
    for (let i = 0; i < data.labels.length; i++) {
      const signedSum = result.reduce((sum, layer) => sum + (layer[i][1] - layer[i][0]), 0)
      expect(signedSum).toBeCloseTo(100, 6)
    }
  })
})

describe('computeStack — N3: diverging offsets', () => {
  it('uses diverging layout when any value is negative (no overlap)', () => {
    const data: ChartData = {
      labels: ['X'],
      values: [],
      series: [
        { name: 'A', values: [10] },
        { name: 'B', values: [-5] },
        { name: 'C', values: [3] },
      ],
    }
    const result = computeStack(data)
    expect(result).toHaveLength(3)

    // Positives stack upward from 0, negatives sit below 0 — no segment may
    // overlap another along the y-axis.
    const segments = result.map(layer => [layer[0][0], layer[0][1]] as [number, number])
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const [a0, a1] = segments[i]
        const [b0, b1] = segments[j]
        const aLo = Math.min(a0, a1)
        const aHi = Math.max(a0, a1)
        const bLo = Math.min(b0, b1)
        const bHi = Math.max(b0, b1)
        // Overlap means aLo < bHi and bLo < aHi (open intervals).
        const overlaps = aLo < bHi && bLo < aHi
        expect(overlaps).toBe(false)
      }
    }
  })

  it('keeps the happy-path (all positive) layout unchanged', () => {
    const data: ChartData = {
      labels: ['A'],
      values: [],
      series: [
        { name: 'S1', values: [10] },
        { name: 'S2', values: [20] },
      ],
    }
    const result = computeStack(data)
    // Same expectations as the pre-fix behaviour
    expect(result[0][0][0]).toBe(0)
    expect(result[0][0][1]).toBe(10)
    expect(result[1][0][0]).toBe(10)
    expect(result[1][0][1]).toBe(30)
  })
})

describe('computeStack100 — percent stacking with negative values', () => {
  const diverging: ChartData = {
    labels: ['North', 'South'],
    values: [],
    series: [
      { name: 'Alpha', values: [31, 31] },
      { name: 'Beta', values: [44, -44] },
    ],
  }

  it('never returns a segment that runs backwards', () => {
    for (const layer of computeStack100(diverging)) {
      for (const point of layer) {
        expect(point[1]).toBeGreaterThanOrEqual(point[0])
      }
    }
  })

  it('keeps every segment within 100% of the baseline', () => {
    for (const layer of computeStack100(diverging)) {
      for (const point of layer) {
        expect(Math.abs(point[0])).toBeLessThanOrEqual(100)
        expect(Math.abs(point[1])).toBeLessThanOrEqual(100)
      }
    }
  })

  it('normalises a diverging row against the sum of absolute values', () => {
    const result = computeStack100(diverging)
    const magnitudes = result.map(layer => layer[1][1] - layer[1][0])
    expect(magnitudes.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 6)
  })

  it('puts the negative segment below the baseline', () => {
    const [, beta] = computeStack100(diverging)
    expect(beta[1][0]).toBeLessThan(0)
    expect(beta[1][1]).toBeCloseTo(0, 6)
  })
})
