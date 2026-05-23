/**
 * @deprecated As of the Scene Transition Orchestrator (Stage 1+), this module
 * is being retired in favour of `packages/lib/src/transitions/` (the
 * SceneTransition WeakMap registry). Currently still used by migrated renderers
 * for cross-type fade detection (`if cached.chartType !== current` then trigger
 * fade overlay). When the cross-type fade overlay is replaced by the role-matcher
 * (Stage 7) + per-feature crossfade fallback, this module can be deleted.
 */
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
