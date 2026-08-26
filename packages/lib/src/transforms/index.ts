import type { ChartData } from '../charts/types'
import type { ColumnType } from '../recommendations/types'
import type { TransformNode } from '../dsl/types'
import type { TransformResult, TransformStep } from './types'
import { TransformType } from '../enums'
import { propertyMap } from '../dsl/converter'
import { parseData } from '../charts/parse-data'
import { applyFilter } from './applyFilter'
import { applyGroupBy } from './applyGroupBy'
import { applyHideColumns } from './applyHideColumns'
import { applyParse } from './applyParse'
import { applyRename } from './applyRename'
import { applySort } from './applySort'
import { applyTranspose } from './applyTranspose'
import { chartDataToTable, parseBpcData, serializeTableData } from './table'

export type { TransformResult, TransformStep } from './types'
export type { ParseOperation } from './parseOperations'
export { parseOperations, parseOperationMap, isTypeCompatible, getOutputType } from './parseOperations'
export { NULL_VALUE } from './applyParse'
export { transformValue } from './transformValue'
export { applyFilter, applyGroupBy, applyHideColumns, applyParse, applyRename, applySort, applyTranspose }
export {
  chartDataToTable,
  cleanNumericValue,
  detectColumnTypes,
  isDateValue,
  isNumberValue,
  parseBpcData,
  serializeTableData,
} from './table'

/**
 * The transform types the pipeline knows. `computed` is reserved: it carries
 * through the DSL and the editor's step list but applies nothing yet.
 */
export const TRANSFORM_TYPES: ReadonlySet<string> = new Set<string>(Object.values(TransformType))

export function applyTransformSteps(
  steps: TransformStep[],
  columns: string[],
  rows: string[][],
  columnTypes: ColumnType[],
): TransformResult {
  let result: TransformResult = { columns: [...columns], rows: rows.map(r => [...r]), columnTypes: [...columnTypes] }
  for (const step of steps) {
    switch (step.type) {
      case TransformType.Sort:
        result = applySort(result, step.config)
        break
      case TransformType.Filter:
        result = applyFilter(result, step.config)
        break
      case TransformType.HideColumns:
        result = applyHideColumns(result, step.config)
        break
      case TransformType.Transpose:
        result = applyTranspose(result)
        break
      case TransformType.Parse:
        result = applyParse(result, step.config)
        break
      case TransformType.Rename:
        result = applyRename(result, step.config)
        break
      case TransformType.GroupBy:
        result = applyGroupBy(result, step.config)
        break
      // computed is not yet implemented
    }
  }
  return result
}

/** Read `transform <type> { … }` nodes as pipeline steps, dropping unknown types. */
export function transformNodesToSteps(nodes: TransformNode[]): TransformStep[] {
  return nodes
    .filter(node => TRANSFORM_TYPES.has(node.transformType))
    .map((node) => {
      const config: Record<string, string> = {}
      for (const [key, value] of propertyMap(node.properties)) {
        config[key] = String(value)
      }
      return { type: node.transformType as TransformType, config }
    })
}

/** Run the pipeline over a `data { … }` body, returning the body the chart renders. */
export function applyTransformNodes(dataStr: string, nodes: TransformNode[]): string {
  const steps = transformNodesToSteps(nodes)
  if (steps.length === 0) {
    return dataStr
  }
  const table = parseBpcData(dataStr)
  if (table.columns.length === 0) {
    return dataStr
  }
  const out = applyTransformSteps(steps, table.columns, table.rows, table.columnTypes)
  return serializeTableData(out.columns, out.rows)
}

/** Run the pipeline over already-parsed chart data, for a scene's own steps. */
export function applyTransformNodesToChartData(data: ChartData, nodes: TransformNode[]): ChartData {
  const steps = transformNodesToSteps(nodes)
  if (steps.length === 0 || data.labels.length === 0) {
    return data
  }
  const table = chartDataToTable(data)
  const out = applyTransformSteps(steps, table.columns, table.rows, table.columnTypes)
  return parseData(serializeTableData(out.columns, out.rows))
}
