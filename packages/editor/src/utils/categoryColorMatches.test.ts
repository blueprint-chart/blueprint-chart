import { describe, expect, it } from 'vitest'
import type { ChartData } from '@blueprint-chart/lib'
import { findCategoryColorMatches } from './categoryColorMatches'

const labelsData: ChartData = { labels: ['France', 'Spain'], values: [1, 2] }
const seriesData: ChartData = {
  labels: ['2020'],
  values: [1],
  series: [{ name: 'Democrats', values: [1] }],
}

const base = {
  chartType: 'bar',
  data: labelsData,
  colorizes: [],
  seriesOverrides: [],
  categoryColors: [{ name: ' france', color: '#0055A4' }],
}

describe('findCategoryColorMatches', () => {
  it('matches labels ignoring case and spaces', () => {
    expect(findCategoryColorMatches(base)).toEqual([{ target: 'France', color: '#0055A4' }])
  })

  it('uses series names when the data has series', () => {
    const result = findCategoryColorMatches({
      ...base,
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
      seriesOverrides: [{ name: 'Democrats', color: '#123456' }],
    })
    expect(result).toEqual([])
  })

  it('does not skip a series override without color', () => {
    const result = findCategoryColorMatches({
      ...base,
      data: seriesData,
      categoryColors: [{ name: 'democrats', color: '#0015BC' }],
      seriesOverrides: [{ name: 'Democrats', lineWidth: 2 }],
    })
    expect(result).toEqual([{ target: 'Democrats', color: '#0015BC' }])
  })

  it.each(['area', 'line', 'pie'])('returns [] for %s', (chartType) => {
    expect(findCategoryColorMatches({ ...base, chartType })).toEqual([])
  })
})
