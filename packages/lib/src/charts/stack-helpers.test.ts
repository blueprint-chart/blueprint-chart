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
})
