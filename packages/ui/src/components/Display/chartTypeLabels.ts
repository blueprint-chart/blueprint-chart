export const CHART_TYPE_LABELS: Record<string, string> = {
  'bar-vertical': 'Columns',
  'bar-horizontal': 'Bars',
  'bar-multi': 'Grouped Columns',
  'column-stacked': 'Stacked Columns',
  'bar-stacked': 'Stacked Bars',
  'line': 'Line',
  'line-multi': 'Lines',
  'area': 'Area',
  'area-stacked': 'Stacked Area',
  'donut': 'Donut',
  'pie': 'Pie',
}

export function getChartTypeLabel(chartType: string): string {
  return CHART_TYPE_LABELS[chartType] ?? chartType
}
