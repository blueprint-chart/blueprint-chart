import { describe, it, expect } from 'vitest'
import { getChart, listCharts } from './registry'

describe('chart registry', () => {
  it('has all 7 chart types registered', () => {
    const names = listCharts()
    expect(names).toContain('bar-vertical')
    expect(names).toContain('bar-horizontal')
    expect(names).toContain('bar-multi')
    expect(names).toContain('line')
    expect(names).toContain('line-multi')
    expect(names).toContain('donut')
    expect(names).toContain('pie')
  })

  it('has aliases registered', () => {
    expect(getChart('vertical-bar')).toBe(getChart('bar-vertical'))
    expect(getChart('horizontal-bar')).toBe(getChart('bar-horizontal'))
  })

  it('returns undefined for unknown chart', () => {
    expect(getChart('unknown-chart')).toBeUndefined()
  })

  it('returns a function for each chart type', () => {
    const chart = getChart('bar-vertical')
    expect(typeof chart).toBe('function')
  })

  it('lists all registered names including aliases', () => {
    const names = listCharts()
    expect(names).toHaveLength(9) // 7 types + 2 aliases
  })
})
