import type { ChartData } from '../../types'

export const MAPPING_NONE = 'none'

export interface ScatterMapping { x?: string, y?: string, size?: string, group?: string }

const NUMERIC_ROLES = ['x', 'y', 'size'] as const

export function numericColumns(data: ChartData): string[] {
  const text = new Set(data.textColumns?.map(c => c.name))
  const names = data.series ? data.series.map(s => s.name) : ['value']
  return names.filter(name => !text.has(name))
}

export function resolveScatterMapping(data: ChartData, overrides: ScatterMapping = {}): ScatterMapping {
  const mapping: ScatterMapping = {}
  const claimed = new Set(NUMERIC_ROLES.map(role => overrides[role]).filter(Boolean))
  const free = numericColumns(data).filter(name => !claimed.has(name))
  for (const role of NUMERIC_ROLES) {
    const column = overrides[role] || free.shift()
    if (column && column !== MAPPING_NONE) {
      mapping[role] = column
    }
  }
  const group = overrides.group || data.textColumns?.[0]?.name
  if (group && group !== MAPPING_NONE) {
    mapping.group = group
  }
  return mapping
}
