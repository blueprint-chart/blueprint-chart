import { ChartType } from '@blueprint-chart/lib'

export function chartTypeForColumns(chartType: string, columnCount: number, hasDateLabels: boolean): string {
  const keepsType = chartType.includes('multi') || chartType.includes('stacked')
    || chartType === ChartType.BarSplit || chartType === ChartType.BarGrouped || chartType === ChartType.Scatter
  if (columnCount <= 2 || keepsType) {
    return chartType
  }
  return hasDateLabels ? ChartType.LineMulti : ChartType.BarMulti
}
