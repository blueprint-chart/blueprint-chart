import { ChartType } from '../enums'

export const CHART_TYPE_LABELS: Partial<Record<ChartType, string>> = {
  [ChartType.BarVertical]: 'Columns',
  [ChartType.BarHorizontal]: 'Bars',
  [ChartType.BarMulti]: 'Grouped Columns',
  [ChartType.ColumnStacked]: 'Stacked Columns',
  [ChartType.BarStacked]: 'Stacked Bars',
  [ChartType.BarSplit]: 'Split Bars',
  [ChartType.BarGrouped]: 'Grouped Bars',
  [ChartType.Line]: 'Line',
  [ChartType.LineMulti]: 'Lines',
  [ChartType.Area]: 'Area',
  [ChartType.AreaStacked]: 'Areas',
  [ChartType.Donut]: 'Donut',
  [ChartType.Pie]: 'Pie',
}

export function getChartTypeLabel(chartType: string): string {
  return CHART_TYPE_LABELS[chartType as ChartType] ?? chartType
}
