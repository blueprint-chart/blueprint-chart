import { describe, expect, it } from 'vitest'
import { parseData } from '../parse-data'
import { resolveOverlays } from './overlays'

const RAW = 'series = "Value","Min","Max","Last"\n"A" = 5,2,8,6\n"B" = 4,1,9,3'

describe('resolveOverlays', () => {
  it('returns data untouched when there are no overlays', () => {
    const data = parseData(RAW)
    expect(resolveOverlays(data, undefined).data).toBe(data)
  })

  it('makes the first column not named by an overlay the bar', () => {
    const d = parseData('series = "Low","Value","High"\n"A" = 1,2,3')
    expect(resolveOverlays(d, [{ columns: ['Low', 'High'] }]).data.values).toEqual([2])
  })

  it('keeps the remaining columns as series', () => {
    const data = parseData(RAW)
    const r = resolveOverlays(data, [{ columns: ['Min', 'Max'] }])
    expect(r.data.series?.map(s => s.name)).toEqual(['Last'])
  })

  it('keeps a hidden overlay\'s columns out of the bars but draws nothing', () => {
    const d = parseData('series = "Low","Value","High"\n"A" = 1,2,3')
    const r = resolveOverlays(d, [{ columns: ['Low', 'High'], hidden: true }])
    expect(r.data.values).toEqual([2])
    expect(r.overlays).toEqual([])
  })

  it('orders low and high per row whatever the column order', () => {
    const data = parseData(RAW)
    const [range] = resolveOverlays(data, [{ columns: ['Max', 'Min'] }]).overlays
    expect(range.low).toEqual([2, 1])
    expect(range.high).toEqual([8, 9])
  })

  it('turns a missing or non-numeric cell into NaN on that row only', () => {
    const data = parseData('series = "Value","Min","Max"\n"A" = 5,2,8\n"B" = 4,1,n/a')
    const [range] = resolveOverlays(data, [{ columns: ['Min', 'Max'] }]).overlays
    expect(range.low[0]).toBe(2)
    expect(range.high[0]).toBe(8)
    expect(range.low[1]).toBeNaN()
    expect(range.high[1]).toBeNaN()
  })

  it('drops an overlay whose column is missing', () => {
    const data = parseData(RAW)
    expect(resolveOverlays(data, [{ columns: ['Gone'] }]).overlays).toEqual([])
  })

  it('removes columns of a dropped overlay from the bars but draws nothing', () => {
    const d = parseData('series = "Low","Value","High"\n"A" = 1,2,3')
    const r = resolveOverlays(d, [{ columns: ['Low', 'Gone'] }])
    expect(r.data.values).toEqual([2])
    expect(r.overlays).toEqual([])
  })

  it('applies defaults', () => {
    const data = parseData(RAW)
    const [range, value] = resolveOverlays(data, [{ columns: ['Last'] }, { columns: ['Min', 'Max'] }]).overlays
    expect(range).toMatchObject({ kind: 'range', title: 'Min to Max', opacity: 0.3, pattern: 'solid', color: 'currentColor' })
    expect(value).toMatchObject({ kind: 'value', title: 'Last', opacity: 1 })
  })

  it('draws ranges before values, DSL order within each group', () => {
    const data = parseData('series = "Value","A","B","C","D"\n"X" = 1,2,3,4,5')
    const overlays = [{ columns: ['A'] }, { columns: ['B', 'C'] }, { columns: ['D'] }]
    const titles = resolveOverlays(data, overlays).overlays.map(o => o.title)
    expect(titles).toEqual(['B to C', 'A', 'D'])
  })
})
