import type { TransformResult } from '@/stores/dataTransforms'
import { FilterCondition } from '../../enums'

function matchesCondition(value: string, condition: string, target: string): boolean {
  if (!target && condition !== FilterCondition.Equals && condition !== FilterCondition.NotEquals) {
    return true
  }
  switch (condition) {
    case FilterCondition.Equals:
      return value === target
    case FilterCondition.NotEquals:
      return value !== target
    case FilterCondition.Contains:
      return value.toLowerCase().includes(target.toLowerCase())
    case FilterCondition.GreaterThan: {
      const num = Number(value.replace(/[,%$€£¥₹]/g, '').trim())
      const tgt = Number(target)
      return !Number.isNaN(num) && !Number.isNaN(tgt) && num > tgt
    }
    case FilterCondition.LessThan: {
      const num = Number(value.replace(/[,%$€£¥₹]/g, '').trim())
      const tgt = Number(target)
      return !Number.isNaN(num) && !Number.isNaN(tgt) && num < tgt
    }
    default:
      return true
  }
}

export function applyFilter(data: TransformResult, config: Record<string, string>): TransformResult {
  const colIndex = data.columns.indexOf(config.column)
  if (colIndex < 0 || !config.column) {
    return data
  }
  const filtered = data.rows.filter(row =>
    matchesCondition(row[colIndex] ?? '', config.condition ?? FilterCondition.Equals, config.value ?? ''),
  )
  return { ...data, rows: filtered }
}
