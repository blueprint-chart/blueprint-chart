import { SortDirection } from '../enums'

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
