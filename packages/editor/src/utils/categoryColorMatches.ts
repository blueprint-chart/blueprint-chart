import { ChartType, type ChartData, type SeriesOverride } from '@blueprint-chart/lib'
import type { ChartColorize } from '@/stores/chartConfig'
import { normalizeCategory, type CategoryColor } from '@/stores/categoryColors'

const LABEL_KEYED_CHART_TYPES: string[] = [
  ChartType.BarVertical,
  ChartType.BarHorizontal,
  ChartType.VerticalBar,
  ChartType.HorizontalBar,
  ChartType.Donut,
]

const SERIES_KEYED_CHART_TYPES: string[] = [
  ChartType.BarMulti,
  ChartType.BarSplit,
  ChartType.BarGrouped,
  ChartType.BarStacked,
  ChartType.ColumnStacked,
  ChartType.LineMulti,
  ChartType.AreaStacked,
]

function candidateNames(chartType: string, data: ChartData): string[] {
  if (LABEL_KEYED_CHART_TYPES.includes(chartType)) {
    return data.labels
  }
  if (SERIES_KEYED_CHART_TYPES.includes(chartType)) {
    return (data.series ?? []).map(({ name }) => name)
  }
  return []
}

export function findCategoryColorMatches(input: {
  chartType: string
  data: ChartData
  colorizes: ChartColorize[]
  seriesOverrides: SeriesOverride[]
  categoryColors: readonly CategoryColor[]
}): ChartColorize[] {
  const colorByName = new Map(input.categoryColors.map(({ name, color }) => [normalizeCategory(name), color]))
  const taken = new Set([
    ...input.colorizes.map(({ target }) => normalizeCategory(target)),
    ...input.seriesOverrides.filter(({ color }) => color).map(({ name }) => normalizeCategory(name)),
  ])
  const names = candidateNames(input.chartType, input.data)

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

const COLORIZE_LIST_CHART_TYPES: string[] = [
  ChartType.BarVertical,
  ChartType.BarHorizontal,
  ChartType.VerticalBar,
  ChartType.HorizontalBar,
]

export const hasColorizeList = (chartType: string) => COLORIZE_LIST_CHART_TYPES.includes(chartType)

export function findAppliedCategoryColors(colorizes: ChartColorize[], categoryColors: readonly CategoryColor[]): ChartColorize[] {
  const colorByName = new Map(categoryColors.map(({ name, color }) => [normalizeCategory(name), color.toLowerCase()]))
  return colorizes.filter(({ target, color }) => colorByName.get(normalizeCategory(target)) === color.toLowerCase())
}
