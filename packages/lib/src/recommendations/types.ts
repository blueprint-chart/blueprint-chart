export type ColumnType = 'string' | 'number' | 'date'

export type RecommendationFitness = 'best' | 'good' | 'alternative'

export interface ChartRecommendation {
  chartType: string
  label: string
  fitness: RecommendationFitness
  reason: string
}

export type Intent =
  | 'trend'
  | 'comparison'
  | 'ranking'
  | 'composition-over-time'
  | 'part-to-whole'
  | 'range'
  | 'none'

export type ShapeSignature =
  | '1cat+1num'
  | '1cat+Nnum'
  | '1date+1num'
  | '1date+Nnum'
  | 'other'

export const CHART_LABELS: Record<string, string> = {
  'bar-vertical': 'Vertical Bar Chart',
  'bar-horizontal': 'Horizontal Bar Chart',
  'bar-multi': 'Grouped Bar Chart',
  'bar-grouped': 'Grouped Bar Chart',
  'bar-stacked': 'Stacked Bar Chart',
  'bar-split': 'Diverging Bar Chart',
  'column-stacked': 'Stacked Column Chart',
  'line': 'Line Chart',
  'line-multi': 'Multi-Line Chart',
  'area': 'Area Chart',
  'area-stacked': 'Stacked Area Chart',
  'pie': 'Pie Chart',
  'donut': 'Donut Chart',
}
