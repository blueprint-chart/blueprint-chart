import { ChartType } from '../enums'

export const CHART_TYPE_LABELS: Partial<Record<ChartType, string>> = {
  [ChartType.BarVertical]: 'Columns',
  [ChartType.BarHorizontal]: 'Bars',
  [ChartType.BarMulti]: 'Grouped columns',
  [ChartType.ColumnStacked]: 'Stacked columns',
  [ChartType.BarStacked]: 'Stacked bars',
  [ChartType.BarSplit]: 'Split bars',
  [ChartType.BarGrouped]: 'Grouped bars',
  [ChartType.Line]: 'Line',
  [ChartType.LineMulti]: 'Lines',
  [ChartType.Area]: 'Area',
  [ChartType.AreaStacked]: 'Areas',
  [ChartType.Donut]: 'Donut',
  [ChartType.Pie]: 'Pie',
  [ChartType.Scatter]: 'Scatter',
  [ChartType.DotPlot]: 'Dot plot',
}

export function getChartTypeLabel(chartType: string): string {
  return CHART_TYPE_LABELS[chartType as ChartType] ?? chartType
}
