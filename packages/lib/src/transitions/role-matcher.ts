import type { FeatureRole } from './types'

/**
 * Minimum fraction of new features that must match a prior role-tagged
 * element for per-feature morph to be preferred over whole-chart crossfade.
 *
 * Below this threshold, the visual gap between "old chart" and "new chart"
 * is large enough that morphing a small overlap feels jarring; a clean
 * crossfade reads better. Stage 7 ships this constant as scaffolding; the
 * orchestrator-level wiring lives downstream.
 */
export const ROLE_MATCH_THRESHOLD = 0.5

/**
 * Return all live elements in `container` tagged with the given role,
 * keyed by their `data-bc-key` attribute. Used by featureJoin to find
 * cross-feature predecessors when the new commit's selector differs
 * from the prior's.
 *
 * Elements missing a `data-bc-key` are skipped (they couldn't be matched
 * against the new data anyway).
 */
export function roleScan(container: HTMLElement, role: FeatureRole): Map<string, Element> {
  const out = new Map<string, Element>()
  const elements = container.querySelectorAll<Element>(`[data-bc-role="${role}"]`)
  elements.forEach((el) => {
    const key = el.getAttribute('data-bc-key')
    if (key != null) {
      out.set(key, el)
    }
  })
  return out
}

/**
 * Tag-name compatibility check for cross-type morph.
 *
 * Two elements can morph attribute-to-attribute only when they share a tag
 * (rect → rect, path → path). When the new feature uses a different SVG
 * element than the prior (rect ↔ circle, rect ↔ path), the orchestrator
 * falls back to per-feature crossfade rather than attempting an invalid
 * attribute tween.
 */
export function tagsCompatible(prior: Element, next: Element): boolean {
  return prior.tagName === next.tagName
}

/**
 * Decide whether the orchestrator should escalate a commit from per-feature
 * morph to whole-chart crossfade based on how many of the new features have
 * a same-role predecessor.
 *
 * Returns `true` when there is something to match against (`total > 0`) but
 * the match ratio falls below {@link ROLE_MATCH_THRESHOLD}. When `total` is
 * 0 there is nothing to match — return `false` so the caller treats this as
 * a normal first-render rather than a crossfade.
 */
export function shouldEscalateToFade(matchedCount: number, totalCount: number): boolean {
  if (totalCount <= 0) {
    return false
  }
  return matchedCount / totalCount < ROLE_MATCH_THRESHOLD
}
