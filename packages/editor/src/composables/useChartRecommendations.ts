import { ChartType } from '@blueprint-chart/lib'
import { useDataTable } from './useDataTable'

export interface ChartRecommendation {
  chartType: string
  label: string
  fitness: 'best' | 'good' | 'alternative'
  reason: string
}

const CHART_LABELS: Record<string, string> = {
  [ChartType.BarVertical]: 'Vertical Bar Chart',
  [ChartType.BarHorizontal]: 'Horizontal Bar Chart',
  [ChartType.BarMulti]: 'Grouped Bar Chart',
  [ChartType.Line]: 'Line Chart',
  [ChartType.LineMulti]: 'Multi-Line Chart',
  [ChartType.Pie]: 'Pie Chart',
  [ChartType.Donut]: 'Donut Chart',
}

export function useChartRecommendations() {
  const { displayRows, displayColumnTypes } = useDataTable()

  const dataSummary = computed(() => {
    const types = displayColumnTypes.value
    const strings = types.filter(t => t === 'string').length
    const numbers = types.filter(t => t === 'number').length
    const dates = types.filter(t => t === 'date').length
    const parts: string[] = []
    if (strings > 0) {
      parts.push(`${strings} categorical`)
    }
    if (dates > 0) {
      parts.push(`${dates} date`)
    }
    if (numbers > 0) {
      parts.push(`${numbers} numeric`)
    }
    return parts.length > 0 ? `${parts.join(' + ')} column${types.length !== 1 ? 's' : ''}` : 'No data'
  })

  const recommendations = computed<ChartRecommendation[]>(() => {
    const types = displayColumnTypes.value
    if (types.length === 0) {
      return []
    }

    const strings = types.filter(t => t === 'string').length
    const numbers = types.filter(t => t === 'number').length
    const dates = types.filter(t => t === 'date').length
    const rowCount = displayRows.value.length
    const result: ChartRecommendation[] = []

    function rec(chartType: string, fitness: ChartRecommendation['fitness'], reason: string) {
      result.push({ chartType, label: CHART_LABELS[chartType] ?? chartType, fitness, reason })
    }

    // 1 date + N numbers → line charts
    if (dates === 1 && numbers >= 1) {
      if (numbers === 1) {
        rec(ChartType.Line, 'best', '1 date + 1 numeric column — ideal for trend')
        rec(ChartType.BarVertical, 'alternative', 'Can also show as bars')
      }
      else {
        rec(ChartType.LineMulti, 'best', `1 date + ${numbers} numeric columns — compare trends`)
        rec(ChartType.BarMulti, 'alternative', 'Can also show as grouped bars')
      }
    }
    // 1 string + 1 number
    else if (strings === 1 && numbers === 1) {
      rec(ChartType.BarVertical, 'best', '1 categorical + 1 numeric — classic bar chart')
      rec(ChartType.BarHorizontal, 'good', 'Horizontal bars work well for long labels')
      if (rowCount <= 8) {
        rec(ChartType.Donut, 'good', `${rowCount} items — suitable for part-of-whole`)
        rec(ChartType.Pie, 'alternative', 'Pie chart for part-of-whole')
      }
    }
    // 1 string + N numbers
    else if (strings === 1 && numbers > 1) {
      rec(ChartType.BarMulti, 'best', `1 categorical + ${numbers} numeric columns — compare groups`)
      rec(ChartType.LineMulti, 'good', 'Can also show as multi-line chart')
    }
    // Fallback
    else if (numbers >= 1 && (strings >= 1 || dates >= 1)) {
      rec(ChartType.BarVertical, 'good', 'Default bar chart recommendation')
    }

    return result
  })

  return {
    recommendations,
    dataSummary,
  }
}
