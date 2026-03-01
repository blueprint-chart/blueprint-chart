import { describe, it, expect, beforeEach } from 'vitest'
import { useDataTable } from './useDataTable'
import { useChartRecommendations } from './useChartRecommendations'

describe('useChartRecommendations', () => {
  beforeEach(() => {
    useDataTable().reset()
  })

  it('returns empty recommendations when no data', () => {
    const { recommendations, dataSummary } = useChartRecommendations()
    expect(recommendations.value).toEqual([])
    expect(dataSummary.value).toBe('No data')
  })

  it('recommends bar chart for 1 string + 1 number', () => {
    const dt = useDataTable()
    dt.loadParsed({
      columns: ['Name', 'Value'],
      rows: [['Apples', '42'], ['Bananas', '58']],
      columnTypes: ['string', 'number'],
    })
    const { recommendations, dataSummary } = useChartRecommendations()
    expect(recommendations.value.length).toBeGreaterThan(0)
    expect(recommendations.value[0].chartType).toBe('bar-vertical')
    expect(recommendations.value[0].fitness).toBe('best')
    expect(dataSummary.value).toContain('1 categorical')
    expect(dataSummary.value).toContain('1 numeric')
  })

  it('recommends line chart for 1 date + 1 number', () => {
    const dt = useDataTable()
    dt.loadParsed({
      columns: ['Date', 'Value'],
      rows: [['2024-01', '42'], ['2024-02', '58']],
      columnTypes: ['date', 'number'],
    })
    const { recommendations } = useChartRecommendations()
    expect(recommendations.value[0].chartType).toBe('line')
    expect(recommendations.value[0].fitness).toBe('best')
  })

  it('recommends grouped bar for 1 string + N numbers', () => {
    const dt = useDataTable()
    dt.loadParsed({
      columns: ['Name', 'Gold', 'Silver', 'Bronze'],
      rows: [['USA', '46', '37', '38']],
      columnTypes: ['string', 'number', 'number', 'number'],
    })
    const { recommendations } = useChartRecommendations()
    expect(recommendations.value[0].chartType).toBe('bar-multi')
    expect(recommendations.value[0].fitness).toBe('best')
  })

  it('recommends multi-line for 1 date + N numbers', () => {
    const dt = useDataTable()
    dt.loadParsed({
      columns: ['Date', 'Chrome', 'Firefox'],
      rows: [['2024-01', '60', '20']],
      columnTypes: ['date', 'number', 'number'],
    })
    const { recommendations } = useChartRecommendations()
    expect(recommendations.value[0].chartType).toBe('line-multi')
  })

  it('includes donut for small datasets with 1 string + 1 number', () => {
    const dt = useDataTable()
    dt.loadParsed({
      columns: ['Name', 'Value'],
      rows: Array.from({ length: 5 }, (_, i) => [`Item ${i}`, String(i * 10)]),
      columnTypes: ['string', 'number'],
    })
    const { recommendations } = useChartRecommendations()
    const types = recommendations.value.map(r => r.chartType)
    expect(types).toContain('donut')
  })
})
