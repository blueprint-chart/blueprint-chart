import { getChartOptions } from './registry'
import type { ChartTypeOptions } from './types'

const defaultsCache: Record<string, Partial<ChartTypeOptions>> = Object.create(null)

export function getChartTypeDefaults(chartType: string): Partial<ChartTypeOptions> {
  if (!defaultsCache[chartType]) {
    const cache: Partial<ChartTypeOptions> = {}
    for (const def of getChartOptions(chartType)) {
      if (def.default !== undefined) {
        (cache as Record<string, unknown>)[def.key] = def.default
      }
    }
    defaultsCache[chartType] = cache
  }
  return { ...defaultsCache[chartType] }
}

export function resolveChartTypeOptions(
  chartType: string,
  explicit: Partial<ChartTypeOptions>,
): Partial<ChartTypeOptions> {
  const defaults = getChartTypeDefaults(chartType)
  const hasExplicitColors = explicit.colors?.length
  return hasExplicitColors
    ? { ...defaults, colorPalette: undefined, ...explicit }
    : { ...defaults, ...explicit }
}
