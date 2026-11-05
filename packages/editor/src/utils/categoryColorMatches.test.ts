import { describe, expect, it } from 'vitest'
import { ChartType, type ChartData } from '@blueprint-chart/lib'
import { findCategoryColorMatches } from './categoryColorMatches'

const labelsData: ChartData = { labels: ['France', 'Spain'], values: [1, 2] }
const seriesData: ChartData = {
  labels: ['2020'],
  values: [1],
  series: [{ name: 'Democrats', values: [1] }],
}

const base = {
  chartType: ChartType.BarVertical as string,
  data: labelsData,
  colorizes: [],
  seriesOverrides: [],
  categoryColors: [{ name: ' france', color: '#0055A4' }],
}

describe('findCategoryColorMatches', () => {
  it('matches labels ignoring case and spaces', () => {
    expect(findCategoryColorMatches(base)).toEqual([{ target: 'France', color: '#0055A4' }])
  })

  it('uses series names for a series-keyed chart', () => {
    const result = findCategoryColorMatches({
      ...base,
      chartType: ChartType.BarGrouped,
      data: seriesData,
      categoryColors: [{ name: 'democrats', color: '#0015BC' }],
    })
    expect(result).toEqual([{ target: 'Democrats', color: '#0015BC' }])
  })

  it('skips names that already have a colorize', () => {
    const colorizes = [{ target: 'france', color: '#ff0000' }]
    expect(findCategoryColorMatches({ ...base, colorizes })).toEqual([])
  })

  it('skips names with a hand-picked series color', () => {
    const result = findCategoryColorMatches({
      ...base,
      data: seriesData,
      categoryColors: [{ name: 'democrats', color: '#0015BC' }],
      chartType: ChartType.BarGrouped,
      seriesOverrides: [{ name: 'Democrats', color: '#123456' }],
    })
    expect(result).toEqual([])
  })

  it('does not skip a series override without color', () => {
    const result = findCategoryColorMatches({
      ...base,
      data: seriesData,
      categoryColors: [{ name: 'democrats', color: '#0015BC' }],
      chartType: ChartType.BarGrouped,
      seriesOverrides: [{ name: 'Democrats', lineWidth: 2 }],
    })
    expect(result).toEqual([{ target: 'Democrats', color: '#0015BC' }])
  })

  it.each([
    ChartType.BarMulti,
    ChartType.BarSplit,
    ChartType.BarGrouped,
    ChartType.BarStacked,
    ChartType.ColumnStacked,
    ChartType.LineMulti,
    ChartType.AreaStacked,
  ])('returns [] for %s with label-only data', (chartType) => {
    expect(findCategoryColorMatches({ ...base, chartType })).toEqual([])
  })

  it.each([
    ChartType.BarVertical,
    ChartType.BarHorizontal,
    ChartType.VerticalBar,
    ChartType.HorizontalBar,
    ChartType.Donut,
  ])('matches labels, not series names, for %s', (chartType) => {
    const result = findCategoryColorMatches({
      ...base,
      chartType,
      data: seriesData,
      categoryColors: [
        { name: 'democrats', color: '#0015BC' },
        { name: '2020', color: '#abcdef' },
      ],
    })
    expect(result).toEqual([{ target: '2020', color: '#abcdef' }])
  })

  it.each([ChartType.Area, ChartType.Line, ChartType.Pie])('returns [] for %s', (chartType) => {
    expect(findCategoryColorMatches({ ...base, chartType })).toEqual([])
  })
})
