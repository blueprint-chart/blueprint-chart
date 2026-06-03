import { classifyIntent } from './intent'
import { resolveCell } from './decisionTable'
import { shapeOf } from './shape'
import { CHART_LABELS, type ChartRecommendation, type ColumnType } from './types'

export type { ChartRecommendation, ColumnType, RecommendationFitness } from './types'
export type { Intent, ShapeSignature } from './types'

export function recommendCharts(
  columnTypes: ColumnType[],
  rowCount: number,
  goal?: string,
): ChartRecommendation[] {
  if (columnTypes.length === 0) {
    return []
  }
  const shape = shapeOf(columnTypes, rowCount)
  const intent = classifyIntent(goal)
  return resolveCell(shape, intent, rowCount).map(raw => ({
    chartType: raw.type,
    label: CHART_LABELS[raw.type] ?? raw.type,
    fitness: raw.fitness,
    reason: raw.reason,
  }))
}
