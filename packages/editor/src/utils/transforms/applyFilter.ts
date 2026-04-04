import type { TransformResult } from '@/stores/dataTransforms'

function matchesCondition(value: string, condition: string, target: string): boolean {
  if (!target && condition !== 'equals' && condition !== 'not-equals') {
    return true
  }
  switch (condition) {
    case 'equals':
      return value === target
    case 'not-equals':
      return value !== target
    case 'contains':
      return value.toLowerCase().includes(target.toLowerCase())
    case 'greater-than': {
      const num = Number(value.replace(/[,%$€£¥₹]/g, '').trim())
      const tgt = Number(target)
      return !Number.isNaN(num) && !Number.isNaN(tgt) && num > tgt
    }
    case 'less-than': {
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
    matchesCondition(row[colIndex] ?? '', config.condition ?? 'equals', config.value ?? ''),
  )
  return { ...data, rows: filtered }
}
