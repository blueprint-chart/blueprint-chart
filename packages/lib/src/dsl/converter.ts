import type { PropertyNode, DataNode } from './types'
import { getChartOptions } from '../charts/registry'

/**
 * Convert an array of AST property nodes into a key→value map.
 */
export function propertyMap(properties: PropertyNode[]): Map<string, string | number | boolean> {
  return new Map(properties.map(p => [p.key, p.value]))
}

/**
 * Extract typed chart-type options from AST properties by using the registry's
 * option definitions to determine the correct type for each key.
 */
function coerceOptionValue(raw: string | number | boolean, type: string): unknown {
  if (type === 'colors') {
    return String(raw).split(',').map(s => s.trim()).filter(Boolean)
  }
  if (type === 'boolean') {
    return raw === 'true' || raw === true
  }
  return String(raw)
}

export function extractChartTypeOptions(
  chartType: string,
  properties: PropertyNode[],
): Record<string, unknown> {
  const propMap = propertyMap(properties)
  const defs = getChartOptions(chartType)
  const opts: Record<string, unknown> = {}

  for (const def of defs) {
    const raw = propMap.get(def.key)
    if (raw === undefined) {
      continue
    }
    opts[def.key] = coerceOptionValue(raw, def.type)
  }

  return opts
}

/**
 * Convert data entries from the AST back to the editor's raw data string format.
 * Preserves percentage syntax and _series metadata.
 */
export function dataEntriesToString(data: DataNode): string {
  return data.entries
    .map((e) => {
      const val = e.isPercentage ? `${e.value}%` : String(e.value)
      if (e.key === '_series') {
        return `_series = "${val}"`
      }
      if (typeof e.value === 'string' && e.value.includes(',')) {
        return `"${e.key}" = "${val}"`
      }
      return `"${e.key}" = ${val}`
    })
    .join('\n')
}
