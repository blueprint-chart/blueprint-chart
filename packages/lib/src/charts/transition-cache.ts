import type { Margin } from './types'

export interface CachedChart {
  chartType: string
  margin?: Margin
}

const cache = new WeakMap<HTMLElement, CachedChart>()

export function getCachedChart(container: HTMLElement): CachedChart | undefined {
  return cache.get(container)
}

export function setCachedChart(container: HTMLElement, entry: CachedChart): void {
  cache.set(container, entry)
}

export function clearCachedChart(container: HTMLElement): void {
  cache.delete(container)
}
