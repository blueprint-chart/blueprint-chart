import { describe, expect, it } from 'vitest'
import { recommendCharts } from './recommend'

describe('recommendCharts', () => {
  it('returns empty array for empty columns', () => {
    expect(recommendCharts([], 0)).toEqual([])
  })

  it('recommends Line + BarVertical for 1 date + 1 number', () => {
    const recs = recommendCharts(['date', 'number'], 12)
    expect(recs[0]).toMatchObject({ chartType: 'line', fitness: 'best' })
    expect(recs[1]).toMatchObject({ chartType: 'bar-vertical', fitness: 'alternative' })
  })

  it('recommends LineMulti for 1 date + N numbers', () => {
    const recs = recommendCharts(['date', 'number', 'number', 'number'], 24)
    expect(recs[0]).toMatchObject({ chartType: 'line-multi', fitness: 'best' })
  })

  it('recommends BarVertical for 1 string + 1 number', () => {
    const recs = recommendCharts(['string', 'number'], 6)
    expect(recs.find(r => r.chartType === 'bar-vertical')?.fitness).toBe('best')
  })

  it('adds Donut suggestion when rowCount <= 8', () => {
    const recs = recommendCharts(['string', 'number'], 6)
    expect(recs.some(r => r.chartType === 'donut')).toBe(true)
  })

  it('drops Donut suggestion when rowCount > 8', () => {
    const recs = recommendCharts(['string', 'number'], 20)
    expect(recs.some(r => r.chartType === 'donut')).toBe(false)
  })

  it('recommends BarMulti for 1 string + N numbers', () => {
    const recs = recommendCharts(['string', 'number', 'number'], 10)
    expect(recs[0]).toMatchObject({ chartType: 'bar-multi', fitness: 'best' })
  })
})
