import { TransformType, FilterCondition } from '@/enums'
import { SortDirection } from '@blueprint-chart/lib'

export function describeStep(step: { type: string, config: Record<string, string> }): string {
  if (step.type === TransformType.Sort && step.config.column) {
    return `${step.config.column} ${step.config.direction ?? SortDirection.Ascending}`
  }
  if (step.type === TransformType.Filter && step.config.column) {
    return `${step.config.column} ${step.config.condition ?? FilterCondition.Equals} ${step.config.value ?? ''}`
  }
  if (step.type === TransformType.HideColumns) {
    const cols = step.config.columns ? step.config.columns.split(',').map(c => c.trim()).filter(Boolean) : []
    return cols.length > 0 ? `Hiding ${cols.join(', ')}` : 'Configure...'
  }
  if (step.type === TransformType.Transpose) {
    return 'Swap rows \u2194 columns'
  }
  if (step.type === TransformType.Parse && step.config.column && step.config.operation) {
    return `${step.config.column} → ${step.config.operation}`
  }
  if (step.type === TransformType.Rename && step.config.column && step.config.newName) {
    return `${step.config.column} → ${step.config.newName}`
  }
  if (step.type === TransformType.GroupBy && step.config.groupColumns && step.config.aggregates) {
    const groups = step.config.groupColumns.split(',').map(c => c.trim()).filter(Boolean).join(', ')
    const aggs = step.config.aggregates.split(',').map((a) => {
      const sep = a.lastIndexOf(':')
      if (sep < 0) {
        return a.trim()
      }
      return `${a.slice(sep + 1).trim()}(${a.slice(0, sep).trim()})`
    }).join(', ')
    return `Group by ${groups} — ${aggs}`
  }
  return 'Configure...'
}
