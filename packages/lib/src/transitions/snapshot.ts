import * as d3 from 'd3'
import { BC_TRANSITION_NAME, type AttrMap } from './types'

/**
 * Read the listed attributes off `el` as currently set in the DOM.
 *
 * Before reading, the orchestrator-named d3 transition on the element
 * is interrupted (invariant I4). After interrupt, the attribute values
 * reflect "where the pixels are right now" — exactly what we need as
 * the starting point of a cancel-and-retween.
 *
 * The interrupt targets only the `BC_TRANSITION_NAME` transition so
 * unrelated transitions on the element are unaffected.
 *
 * Attributes that are not present on the element are omitted from the
 * result rather than represented as `null`.
 */
export function snapshotLiveAttrs(el: Element, names: readonly string[]): AttrMap {
  d3.select(el).interrupt(BC_TRANSITION_NAME)
  const out: AttrMap = {}
  for (const name of names) {
    const v = el.getAttribute(name)
    if (v !== null) {
      out[name] = v
    }
  }
  return out
}
