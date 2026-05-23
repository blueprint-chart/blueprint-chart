import { ChartType } from '../enums'

export type ColumnType = 'string' | 'number' | 'date'

export type RecommendationFitness = 'best' | 'good' | 'alternative'

export interface ChartRecommendation {
  chartType: string
  label: string
  fitness: RecommendationFitness
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

export function recommendCharts(columnTypes: ColumnType[], rowCount: number): ChartRecommendation[] {
  if (columnTypes.length === 0) return []

  const strings = columnTypes.filter(t => t === 'string').length
  const numbers = columnTypes.filter(t => t === 'number').length
  const dates = columnTypes.filter(t => t === 'date').length

  const result: ChartRecommendation[] = []
  const push = (chartType: string, fitness: RecommendationFitness, reason: string) =>
    result.push({ chartType, label: CHART_LABELS[chartType] ?? chartType, fitness, reason })

  if (dates === 1 && numbers >= 1) {
    if (numbers === 1) {
      push(ChartType.Line, 'best', '1 date + 1 numeric column — ideal for trend')
      push(ChartType.BarVertical, 'alternative', 'Can also show as bars')
    } else {
      push(ChartType.LineMulti, 'best', `1 date + ${numbers} numeric columns — compare trends`)
      push(ChartType.BarMulti, 'alternative', 'Can also show as grouped bars')
    }
  } else if (strings === 1 && numbers === 1) {
    push(ChartType.BarVertical, 'best', '1 categorical + 1 numeric — classic bar chart')
    push(ChartType.BarHorizontal, 'good', 'Horizontal bars work well for long labels')
    if (rowCount <= 8) {
      push(ChartType.Donut, 'good', `${rowCount} items — suitable for part-of-whole`)
      push(ChartType.Pie, 'alternative', 'Pie chart for part-of-whole')
    }
  } else if (strings === 1 && numbers > 1) {
    push(ChartType.BarMulti, 'best', `1 categorical + ${numbers} numeric columns — compare groups`)
    push(ChartType.LineMulti, 'good', 'Can also show as multi-line chart')
  } else if (numbers >= 1 && (strings >= 1 || dates >= 1)) {
    push(ChartType.BarVertical, 'good', 'Default bar chart recommendation')
  }

  return result
}
