import type { TransformResult } from './types'

export function applyRename(data: TransformResult, config: Record<string, string>): TransformResult {
  const colIndex = data.columns.indexOf(config.column)
  if (colIndex < 0 || !config.column || !config.newName) {
    return data
  }
  const columns = [...data.columns]
  columns[colIndex] = config.newName
  return { ...data, columns }
}
