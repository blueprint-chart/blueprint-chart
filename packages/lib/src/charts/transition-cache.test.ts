import { describe, it, expect } from 'vitest'
import { getCachedChart, setCachedChart, clearCachedChart } from './transition-cache'

describe('transition-cache', () => {
  it('returns undefined for uncached container', () => {
    const el = document.createElement('div')
    expect(getCachedChart(el)).toBeUndefined()
  })

  it('round-trips a cached entry', () => {
    const el = document.createElement('div')
    setCachedChart(el, { chartType: 'bar-vertical' })
    expect(getCachedChart(el)).toEqual({ chartType: 'bar-vertical' })
  })

  it('clears a cached entry', () => {
    const el = document.createElement('div')
    setCachedChart(el, { chartType: 'line' })
    clearCachedChart(el)
    expect(getCachedChart(el)).toBeUndefined()
  })

  it('maintains independent entries for different containers', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    setCachedChart(el1, { chartType: 'donut' })
    setCachedChart(el2, { chartType: 'pie' })
    expect(getCachedChart(el1)?.chartType).toBe('donut')
    expect(getCachedChart(el2)?.chartType).toBe('pie')
  })

  it('overwrites an existing entry', () => {
    const el = document.createElement('div')
    setCachedChart(el, { chartType: 'bar-vertical' })
    setCachedChart(el, { chartType: 'line-multi' })
    expect(getCachedChart(el)?.chartType).toBe('line-multi')
  })
})
