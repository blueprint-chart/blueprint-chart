/** Opacity applied to non-targeted marks when a highlight is active. */
export const HIGHLIGHT_DIM_OPACITY = 0.35

/**
 * Build the set of highlighted target keys from the DSL highlight directives,
 * keeping only the ones present in `keys` (the mark keys the caller will draw).
 * A target naming a renamed or misspelled category would otherwise leave a
 * non-empty set that matches no mark, and `highlightOpacity` would dim
 * everything instead of emphasising anything.
 */
export function highlightTargetSet(highlights: { target: string }[] | undefined, keys: Iterable<string>): Set<string> {
  const known = new Set(keys)
  return new Set((highlights ?? []).map(h => h.target).filter(t => known.has(t)))
}

/**
 * Opacity for a mark given the active highlight targets:
 * no targets → `base`; this key targeted → `base`; otherwise → HIGHLIGHT_DIM_OPACITY.
 * `base` lets area/line charts pass their own fill/stroke opacity for the
 * emphasised mark while non-targeted marks dim to the shared constant.
 */
export function highlightOpacity(targets: Set<string>, key: string, base = 1): number {
  return targets.size === 0 || targets.has(key) ? base : HIGHLIGHT_DIM_OPACITY
}
