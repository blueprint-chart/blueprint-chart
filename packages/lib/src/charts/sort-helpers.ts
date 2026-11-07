import { SortDirection, SortMode } from '../enums'

export function sortByValue<T>(items: readonly T[], value: (item: T, index: number) => number, direction: SortDirection | undefined): T[] {
  if (direction !== SortDirection.Ascending && direction !== SortDirection.Descending) {
    return [...items]
  }
  const sign = direction === SortDirection.Ascending ? 1 : -1
  return items
    .map((item, index) => ({ item, key: value(item, index) }))
    .sort((a, b) => sign * (a.key - b.key))
    .map(({ item }) => item)
}

export function labelTotal(series: readonly { values: number[] }[], index: number): number {
  return series.reduce((sum, s) => sum + (s.values[index] ?? 0), 0)
}

interface CategorySortOptions {
  sortMode?: SortMode
  sortSeries?: string
  sortReverse?: boolean
}

export function sortCategories(labels: readonly string[], series: readonly { name: string, values: number[] }[], { sortMode, sortSeries, sortReverse }: CategorySortOptions): readonly string[] {
  const chosen = series.find(s => s.name === sortSeries) ?? series[0]
  const sorted = sortMode === SortMode.Total
    ? sortByValue(labels, (_, i) => labelTotal(series, i), SortDirection.Descending)
    : sortMode === SortMode.Series && chosen
      ? sortByValue(labels, (_, i) => chosen.values[i] ?? 0, SortDirection.Descending)
      : labels
  return sortReverse ? [...sorted].reverse() : sorted
}

export function withinGroupSlots(labels: readonly string[], series: readonly { name: string, values: number[] }[]): (label: string, seriesName: string) => string {
  const slots = new Map<string, string>()
  labels.forEach((label, i) => {
    sortByValue(series, s => s.values[i] ?? 0, SortDirection.Descending).forEach((s, rank) => {
      slots.set(`${label}\0${s.name}`, series[rank].name)
    })
  })
  return (label, seriesName) => slots.get(`${label}\0${seriesName}`) ?? seriesName
}
