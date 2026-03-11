import { describe, it, expect } from 'vitest'
import { computeStack, computeStack100 } from './stack-helpers'
import type { ChartData } from './types'

describe('computeStack', () => {
  const basicData: ChartData = {
    labels: ['A', 'B', 'C'],
    values: [10, 20, 30],
    series: [
      { name: 'S1', values: [10, 20, 30] },
      { name: 'S2', values: [5, 15, 25] },
    ],
  }

  it('returns stacked series for multi-series data', () => {
    const result = computeStack(basicData)
    expect(result).toHaveLength(2)
    expect(result[0].key).toBe('S1')
    expect(result[1].key).toBe('S2')
  })

  it('y0 of second series equals y1 of first series', () => {
    const result = computeStack(basicData)
    for (let i = 0; i < 3; i++) {
      expect(result[1][i][0]).toBe(result[0][i][1])
    }
  })

  it('first series starts at zero baseline', () => {
    const result = computeStack(basicData)
    for (let i = 0; i < 3; i++) {
      expect(result[0][i][0]).toBe(0)
    }
  })

  it('returns empty array for empty series', () => {
    const emptyData: ChartData = { labels: ['A'], values: [1] }
    expect(computeStack(emptyData)).toEqual([])
  })

  it('returns empty array for explicitly empty series', () => {
    const emptyData: ChartData = { labels: ['A'], values: [1], series: [] }
    expect(computeStack(emptyData)).toEqual([])
  })

  it('handles single-series data', () => {
    const singleData: ChartData = {
      labels: ['A', 'B'],
      values: [10, 20],
      series: [{ name: 'Only', values: [10, 20] }],
    }
    const result = computeStack(singleData)
    expect(result).toHaveLength(1)
    expect(result[0][0][0]).toBe(0)
    expect(result[0][0][1]).toBe(10)
    expect(result[0][1][0]).toBe(0)
    expect(result[0][1][1]).toBe(20)
  })
})

describe('computeStack100', () => {
  const basicData: ChartData = {
    labels: ['A', 'B', 'C'],
    values: [10, 20, 30],
    series: [
      { name: 'S1', values: [10, 20, 30] },
      { name: 'S2', values: [5, 15, 25] },
    ],
  }

  it('normalizes each category to sum to 100', () => {
    const result = computeStack100(basicData)
    for (let i = 0; i < 3; i++) {
      const lastSeries = result[result.length - 1]
      expect(lastSeries[i][1]).toBeCloseTo(100, 5)
    }
  })

  it('y0 of second series equals y1 of first series', () => {
    const result = computeStack100(basicData)
    for (let i = 0; i < 3; i++) {
      expect(result[1][i][0]).toBeCloseTo(result[0][i][1], 5)
    }
  })

  it('returns empty array for empty series', () => {
    const emptyData: ChartData = { labels: ['A'], values: [1] }
    expect(computeStack100(emptyData)).toEqual([])
  })

  it('handles single-series data (each category is 100%)', () => {
    const singleData: ChartData = {
      labels: ['A', 'B'],
      values: [10, 20],
      series: [{ name: 'Only', values: [10, 20] }],
    }
    const result = computeStack100(singleData)
    expect(result).toHaveLength(1)
    expect(result[0][0][1]).toBeCloseTo(100, 5)
    expect(result[0][1][1]).toBeCloseTo(100, 5)
  })

  it('handles zero totals gracefully', () => {
    const zeroData: ChartData = {
      labels: ['A'],
      values: [0],
      series: [
        { name: 'S1', values: [0] },
        { name: 'S2', values: [0] },
      ],
    }
    const result = computeStack100(zeroData)
    expect(result).toHaveLength(2)
    expect(result[0][0][0]).toBe(0)
    expect(result[0][0][1]).toBe(0)
    expect(result[1][0][0]).toBe(0)
    expect(result[1][0][1]).toBe(0)
  })
})
