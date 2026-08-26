import type { ColumnType } from '../recommendations/types'
import type { TransformType } from '../enums'

/** The value flowing through the pipeline: one tabular snapshot. */
export interface TransformResult {
  columns: string[]
  rows: string[][]
  columnTypes: ColumnType[]
}

/** One step in the pipeline. Config keys are the ones the `apply*` functions read. */
export interface TransformStep {
  type: TransformType
  config: Record<string, string>
}
