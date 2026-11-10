import { ChartType } from '@blueprint-chart/lib'
import type { OverlayConfig } from '@blueprint-chart/lib'

export function chartTypeForColumns(chartType: string, columnCount: number, hasDateLabels: boolean, overlays: Pick<OverlayConfig, 'columns'>[] = []): string {
  const keepsType = chartType.includes('multi') || chartType.includes('stacked')
    || chartType === ChartType.BarSplit || chartType === ChartType.BarGrouped || chartType === ChartType.Scatter
    || chartType === ChartType.DotPlot
  const overlayColumns = new Set(overlays.flatMap(overlay => overlay.columns))
  const barColumnCount = columnCount - overlayColumns.size
  if (barColumnCount <= 2 || keepsType) {
    return chartType
  }
  return hasDateLabels ? ChartType.LineMulti : ChartType.BarMulti
}
