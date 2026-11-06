import { describe, it, expect } from 'vitest'
import { parseData } from '../../parse-data'
import { detectRangeColumn, resolveDotPlotMapping } from './mapping'

const POLLS = parseData('series = "Poll","High","Low"\n"SPD" = 14,16,12')

describe('detectRangeColumn', () => {
  it('matches whole words case-insensitively', () => {
    expect(detectRangeColumn(['Value', 'Lower bound', 'Max'], 'low')).toBe('Lower bound')
    expect(detectRangeColumn(['Value', 'Lower bound', 'Max'], 'high')).toBe('Max')
    expect(detectRangeColumn(['Lowland', 'Maximal'], 'low')).toBeUndefined()
    expect(detectRangeColumn(['Lowland', 'Maximal'], 'high')).toBeUndefined()
  })
})

describe('resolveDotPlotMapping', () => {
  it('detects range mode from column names', () => {
    expect(resolveDotPlotMapping(POLLS)).toEqual({ mode: 'range', values: ['Poll'], low: 'Low', high: 'High', ignored: [] })
  })
  it('is single with one numeric column', () => {
    expect(resolveDotPlotMapping(parseData('"a" = 1\n"b" = 2'))).toEqual({ mode: 'single', values: ['value'], ignored: [] })
  })
  it('is a dumbbell with two unmatched columns', () => {
    expect(resolveDotPlotMapping(parseData('series = "2015","2024"\n"a" = 1,2')).mode).toBe('dumbbell')
  })
  it('stays a dumbbell when only low matches, keeping it as a value', () => {
    expect(resolveDotPlotMapping(parseData('series = "Poll","Low"\n"a" = 1,2')))
      .toEqual({ mode: 'dumbbell', values: ['Poll', 'Low'], ignored: [] })
  })
  it('turns a role off with "none"', () => {
    expect(resolveDotPlotMapping(POLLS, { low: 'none' })).toEqual({ mode: 'dumbbell', values: ['Poll', 'High', 'Low'], ignored: [] })
  })
  it('uses explicit column names', () => {
    const data = parseData('series = "Estimate","A","B"\n"a" = 2,1,3')
    expect(resolveDotPlotMapping(data, { low: 'A', high: 'B' })).toEqual({ mode: 'range', values: ['Estimate'], low: 'A', high: 'B', ignored: [] })
  })
  it('treats an unknown column name as unresolved', () => {
    expect(resolveDotPlotMapping(POLLS, { low: 'Nope' }).mode).toBe('dumbbell')
  })
  it('keeps the first unclaimed column as the value and ignores the rest', () => {
    const data = parseData('series = "Poll","Other","High","Low"\n"a" = 1,2,3,0')
    expect(resolveDotPlotMapping(data)).toMatchObject({ mode: 'range', values: ['Poll'], ignored: ['Other'] })
  })
  it('falls back to a dumbbell when low and high leave no value column', () => {
    expect(resolveDotPlotMapping(parseData('series = "Low","High"\n"a" = 1,2')))
      .toEqual({ mode: 'dumbbell', values: ['Low', 'High'], ignored: [] })
  })
})
