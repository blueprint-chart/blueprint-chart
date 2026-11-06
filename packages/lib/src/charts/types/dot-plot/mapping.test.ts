import { describe, it, expect } from 'vitest'
import { DotStyle } from '../../../enums'
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
  it('matches snake_case column names', () => {
    expect(detectRangeColumn(['estimate', 'ci_low', 'ci_high'], 'low')).toBe('ci_low')
    expect(detectRangeColumn(['estimate', 'low_95', 'high_95'], 'high')).toBe('high_95')
  })
})

describe('resolveDotPlotMapping', () => {
  const RANGE = { dotStyle: DotStyle.Range }

  it('is single with one numeric column', () => {
    expect(resolveDotPlotMapping(parseData('"a" = 1\n"b" = 2'))).toEqual({ mode: 'single', values: ['value'], ignored: [] })
  })
  it('is a dumbbell with two columns', () => {
    expect(resolveDotPlotMapping(parseData('series = "2015","2024"\n"a" = 1,2')).mode).toBe('dumbbell')
  })
  it('keeps range-like column names as dots unless the style is range', () => {
    expect(resolveDotPlotMapping(POLLS)).toEqual({ mode: 'dumbbell', values: ['Poll', 'High', 'Low'], ignored: [] })
    expect(resolveDotPlotMapping(POLLS, { dotStyle: DotStyle.Dumbbell })).toEqual({ mode: 'dumbbell', values: ['Poll', 'High', 'Low'], ignored: [] })
  })
  it('ignores low and high outside range style', () => {
    expect(resolveDotPlotMapping(POLLS, { low: 'Low', high: 'High' }).mode).toBe('dumbbell')
  })
  it('preselects low and high from column names in range style', () => {
    expect(resolveDotPlotMapping(POLLS, RANGE)).toEqual({ mode: 'range', values: ['Poll'], low: 'Low', high: 'High', ignored: [] })
  })
  it('uses explicit column names in range style', () => {
    const data = parseData('series = "Estimate","A","B"\n"a" = 2,1,3')
    expect(resolveDotPlotMapping(data, { ...RANGE, low: 'A', high: 'B' })).toEqual({ mode: 'range', values: ['Estimate'], low: 'A', high: 'B', ignored: [] })
  })
  it('keeps the first unclaimed column as the value and ignores the rest', () => {
    const data = parseData('series = "Poll","Other","High","Low"\n"a" = 1,2,3,0')
    expect(resolveDotPlotMapping(data, RANGE)).toMatchObject({ mode: 'range', values: ['Poll'], ignored: ['Other'] })
  })
  it('draws plain dots of the value when range style cannot find low or high', () => {
    expect(resolveDotPlotMapping(parseData('series = "Poll","Low"\n"a" = 1,2'), RANGE))
      .toEqual({ mode: 'single', values: ['Poll'], ignored: [] })
    expect(resolveDotPlotMapping(POLLS, { ...RANGE, low: 'Nope' }))
      .toEqual({ mode: 'single', values: ['Poll'], ignored: [] })
  })
  it('draws the first column as dots when range style has no column left for the value', () => {
    expect(resolveDotPlotMapping(parseData('series = "Low","High"\n"a" = 1,2'), RANGE))
      .toEqual({ mode: 'single', values: ['Low'], ignored: [] })
  })
})
