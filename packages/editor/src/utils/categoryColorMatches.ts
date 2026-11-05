import type { ChartData, SeriesOverride } from '@blueprint-chart/lib'
import type { ChartColorize } from '@/stores/chartConfig'
import { normalizeCategory, type CategoryColor } from '@/stores/categoryColors'

const UNSUPPORTED_CHART_TYPES = ['area', 'line', 'pie']

export function findCategoryColorMatches(input: {
  chartType: string
  data: ChartData
  colorizes: ChartColorize[]
  seriesOverrides: SeriesOverride[]
  categoryColors: readonly CategoryColor[]
}): ChartColorize[] {
  if (UNSUPPORTED_CHART_TYPES.includes(input.chartType)) {
    return []
  }

  const colorByName = new Map(input.categoryColors.map(({ name, color }) => [normalizeCategory(name), color]))
  const taken = new Set([
    ...input.colorizes.map(({ target }) => normalizeCategory(target)),
    ...input.seriesOverrides.filter(({ color }) => color).map(({ name }) => normalizeCategory(name)),
  ])
  const names = input.data.series?.length ? input.data.series.map(({ name }) => name) : input.data.labels

  const matches: ChartColorize[] = []
  for (const name of names) {
    const key = normalizeCategory(name)
    const color = colorByName.get(key)
    if (!color || taken.has(key)) {
      continue
    }
    taken.add(key)
    matches.push({ target: name, color })
  }
  return matches
}
