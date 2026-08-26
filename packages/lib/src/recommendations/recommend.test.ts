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

  // bar-split draws one panel per series, so a margin of error needs a second
  // numeric column to be the margin. With one, it has no range to show.
  it('recommends plain bars for a margin-of-error goal on a single numeric column', () => {
    const recs = recommendCharts(['string', 'number'], 6, 'the polling lead with its margin of error')
    expect(recs[0]).toMatchObject({ chartType: 'bar-vertical', fitness: 'best' })
    expect(recs.some(r => r.chartType === 'bar-split')).toBe(false)
  })

  it('recommends bar-split for a margin-of-error goal on two numeric columns', () => {
    const recs = recommendCharts(['string', 'number', 'number'], 6, 'the polling lead with its margin of error')
    expect(recs[0]).toMatchObject({ chartType: 'bar-split', fitness: 'best' })
  })

  it('recommends area-stacked for a date + N numbers composition-over-time goal', () => {
    const recs = recommendCharts(['date', 'number', 'number', 'number'], 24, 'the energy mix composition over time')
    expect(recs[0]).toMatchObject({ chartType: 'area-stacked', fitness: 'best' })
  })

  it('recommends line-multi for a categorical "overtakes" goal (crossover reads as lines)', () => {
    const recs = recommendCharts(['string', 'number', 'number', 'number'], 8, 'how software overtakes hardware by quarter')
    expect(recs[0]).toMatchObject({ chartType: 'line-multi', fitness: 'best' })
  })

  it('recommends bar-horizontal for a ranking goal', () => {
    const recs = recommendCharts(['string', 'number'], 10, 'the most-spoken languages, ranked')
    expect(recs[0]).toMatchObject({ chartType: 'bar-horizontal', fitness: 'best' })
  })

  it('recommends bar-stacked for a 1cat+Nnum part-to-whole goal', () => {
    const recs = recommendCharts(['string', 'number', 'number'], 5, 'each segment as a share of the total')
    expect(recs[0]).toMatchObject({ chartType: 'bar-stacked', fitness: 'best' })
  })

  it('ignores an unrecognized goal and uses the shape default', () => {
    const recs = recommendCharts(['date', 'number'], 12, 'just a chart please')
    expect(recs[0]).toMatchObject({ chartType: 'line', fitness: 'best' })
  })
})
