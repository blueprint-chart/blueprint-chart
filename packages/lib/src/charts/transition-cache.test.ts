import { describe, it, expect } from 'vitest'
import { getCachedChart, setCachedChart, clearCachedChart } from './transition-cache'
import { ChartType } from '../enums'

describe('transition-cache', () => {
  it('returns undefined for uncached container', () => {
    const el = document.createElement('div')
    expect(getCachedChart(el)).toBeUndefined()
  })

  it('round-trips a cached entry', () => {
    const el = document.createElement('div')
    setCachedChart(el, { chartType: ChartType.BarVertical })
    expect(getCachedChart(el)).toEqual({ chartType: ChartType.BarVertical })
  })

  it('clears a cached entry', () => {
    const el = document.createElement('div')
    setCachedChart(el, { chartType: ChartType.Line })
    clearCachedChart(el)
    expect(getCachedChart(el)).toBeUndefined()
  })

  it('maintains independent entries for different containers', () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    setCachedChart(el1, { chartType: ChartType.Donut })
    setCachedChart(el2, { chartType: ChartType.Pie })
    expect(getCachedChart(el1)?.chartType).toBe(ChartType.Donut)
    expect(getCachedChart(el2)?.chartType).toBe(ChartType.Pie)
  })

  it('overwrites an existing entry', () => {
    const el = document.createElement('div')
    setCachedChart(el, { chartType: ChartType.BarVertical })
    setCachedChart(el, { chartType: ChartType.LineMulti })
    expect(getCachedChart(el)?.chartType).toBe(ChartType.LineMulti)
  })
})
