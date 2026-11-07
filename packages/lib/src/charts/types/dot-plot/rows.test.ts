import { describe, it, expect } from 'vitest'
import { DotStyle, ScaleType, SortMode } from '../../../enums'
import { parseData } from '../../parse-data'
import type { ChartData } from '../../types'
import { resolveDotPlotMapping } from './mapping'
import { buildDotPlotRows, sortDotPlotRows } from './rows'
import type { DotPlotRow } from './rows'

const DUMBBELL = parseData('series = "2015","2024"\n"a" = 10,30\n"b" = 50,40\n"c" = 20,60')
const resolved = (d: ChartData) => resolveDotPlotMapping(d)
const resolvedRange = (d: ChartData) => resolveDotPlotMapping(d, { dotStyle: DotStyle.Range })

describe('buildDotPlotRows', () => {
  it('builds one row per label with values in column order', () => {
    expect(buildDotPlotRows(DUMBBELL, resolved(DUMBBELL)).rows[0]).toEqual({ name: 'a', values: [10, 30] })
  })
  it('carries low and high in range mode', () => {
    const d = parseData('series = "Poll","High","Low"\n"SPD" = 14,16,12')
    expect(buildDotPlotRows(d, resolvedRange(d)).rows[0]).toEqual({ name: 'SPD', values: [14], low: 12, high: 16 })
  })
  it('drops a row with an empty value cell instead of drawing 0', () => {
    const d = parseData('series = "2015","2024"\n"a" = 10,\n"b" = 1,2')
    expect(buildDotPlotRows(d, resolved(d)).dropped).toEqual([{ name: 'a', reason: 'missing-value' }])
  })
  it('drops a row with a missing low or high', () => {
    const d = parseData('series = "Poll","High","Low"\n"a" = 14,,12')
    expect(buildDotPlotRows(d, resolvedRange(d)).dropped).toEqual([{ name: 'a', reason: 'missing-range' }])
  })
  it('drops non-positive values on a log axis', () => {
    const d = parseData('series = "Poll","High","Low"\n"a" = 14,16,0')
    expect(buildDotPlotRows(d, resolvedRange(d), ScaleType.Log).dropped).toEqual([{ name: 'a', reason: 'non-positive-log' }])
  })
})

describe('sortDotPlotRows', () => {
  const { rows } = buildDotPlotRows(DUMBBELL, resolved(DUMBBELL))
  const names = (r: DotPlotRow[]) => r.map(x => x.name)
  it('sorts by the last value column, largest first, by default', () => {
    expect(names(sortDotPlotRows(rows, {}, 'dumbbell'))).toEqual(['c', 'b', 'a'])
  })
  it('sorts by the last value column, smallest first, when reversed', () => {
    expect(names(sortDotPlotRows(rows, { sortMode: SortMode.Value, sortReverse: true }, 'dumbbell'))).toEqual(['a', 'b', 'c'])
  })
  it('keeps source order with none, even when reversed', () => {
    expect(names(sortDotPlotRows(rows, { sortMode: SortMode.None, sortReverse: true }, 'dumbbell'))).toEqual(['a', 'b', 'c'])
  })
  it('sorts by last minus first with gap', () => {
    expect(names(sortDotPlotRows(rows, { sortMode: SortMode.Gap }, 'dumbbell'))).toEqual(['c', 'a', 'b'])
  })
  it('sorts by percent change from first to last column', () => {
    const d = parseData('series = "2015","2024"\n"a" = 10,30\n"b" = 50,40\n"c" = 100,150\n"z" = 0,5')
    const r = buildDotPlotRows(d, resolved(d)).rows
    expect(names(sortDotPlotRows(r, { sortMode: SortMode.Change }, 'dumbbell'))).toEqual(['a', 'c', 'z', 'b'])
    expect(names(sortDotPlotRows(r, { sortMode: SortMode.Change, sortReverse: true }, 'dumbbell'))).toEqual(['b', 'z', 'c', 'a'])
  })
  it('falls back to value for gap and change outside dumbbell mode', () => {
    expect(names(sortDotPlotRows(rows, { sortMode: SortMode.Gap }, 'range'))).toEqual(['c', 'b', 'a'])
    expect(names(sortDotPlotRows(rows, { sortMode: SortMode.Change }, 'range'))).toEqual(['c', 'b', 'a'])
  })
  it('sorts by value when given a sort mode from another chart type', () => {
    expect(names(sortDotPlotRows(rows, { sortMode: SortMode.Total }, 'dumbbell'))).toEqual(['c', 'b', 'a'])
  })
})
