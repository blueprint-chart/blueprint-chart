import { DotStyle } from '../../../enums'
import type { ChartData } from '../../types'
import { MAPPING_NONE, numericColumns } from '../scatter/mapping'

export type DotPlotMode = 'single' | 'dumbbell' | 'range'

export interface DotPlotMapping { dotStyle?: DotStyle, low?: string, high?: string }

export interface ResolvedDotPlot {
  mode: DotPlotMode
  values: string[]
  low?: string
  high?: string
  ignored: string[]
}

const RANGE_PATTERNS = {
  low: /\b(low|lower|min|minimum)\b/i,
  high: /\b(high|upper|max|maximum)\b/i,
}

export function detectRangeColumn(columns: string[], role: 'low' | 'high'): string | undefined {
  return columns.find(name => RANGE_PATTERNS[role].test(name))
}

function resolveRole(columns: string[], role: 'low' | 'high', override?: string): string | undefined {
  if (override === MAPPING_NONE) {
    return undefined
  }
  return override ? columns.find(name => name === override) : detectRangeColumn(columns, role)
}

export function resolveDotPlotMapping(data: ChartData, overrides: DotPlotMapping = {}): ResolvedDotPlot {
  const columns = numericColumns(data)
  if (overrides.dotStyle !== DotStyle.Range) {
    return { mode: columns.length > 1 ? 'dumbbell' : 'single', values: columns, ignored: [] }
  }
  const low = resolveRole(columns, 'low', overrides.low)
  const high = resolveRole(columns.filter(name => name !== low), 'high', overrides.high)
  const [value, ...ignored] = columns.filter(name => name !== low && name !== high)
  if (low && high && value) {
    return { mode: 'range', values: [value], low, high, ignored }
  }
  return { mode: 'single', values: [value ?? columns[0]].filter(Boolean), ignored: [] }
}
