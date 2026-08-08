import type { Selection } from 'd3'

/**
 * Name used for every d3 transition created by the orchestrator.
 * Snapshot + interrupt operations target this name so they don't
 * collide with any unrelated transitions a renderer might have.
 */
export const BC_TRANSITION_NAME = 'bc-scene'

/** Transition mode chosen by the caller. Only `'transform'` runs in v1. */
export type TransitionMode = 'transform' | 'fade' | 'slide-x' | 'slide-y'

/** Lifecycle state of a SceneTransition instance. */
export type SceneTransitionState = 'idle' | 'committing' | 'animating'

/**
 * Abstract feature role used for cross-type morph matching.
 *
 * Roles are container-independent: a tick on a vertical axis in one scene
 * and a tick on a horizontal axis in the next can match on
 * `'axis-tick.value'`. The role-matcher (future plan) acts on this tag;
 * v1 stores it without acting on it for cross-type.
 */
export type FeatureRole
  = | 'mark-per-category'
    | 'mark-per-cell'
    | 'series-path'
    | 'series-area'
    | 'series-line'
    | 'axis-tick.value'
    | 'axis-tick.category'
    | 'value-label'
    | 'annotation.point'
    | 'annotation.range'
    | 'annotation.free'

/** Subset of SVG / HTML attribute values we tween. */
export type AttrValue = string | number

/** Map of attribute name → value. */
export type AttrMap = Record<string, AttrValue>

/**
 * Description of a keyed visual feature for the orchestrator.
 *
 * The orchestrator reads `data`, matches existing DOM by `key`, and on
 * commit either snaps every element to `attrs(d)` (idle path) or tweens
 * each entry through enter/update/exit pathways (animating path).
 */
export interface FeatureJoinConfig<D> {
  role: FeatureRole
  parent: SVGElement
  selector: string
  data: D[]
  key: (d: D) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (enterSel: Selection<any, D, any, any>) => Selection<any, D, any, any>
  attrs: (d: D) => AttrMap
  /** Attrs to apply to a brand-new element at the start of its enter tween. Defaults to `attrs(d)` (snap-in). */
  enterFrom?: (d: D) => AttrMap
  /** Attrs to tween an exiting element toward before removal. Default: `{ opacity: 0 }`. */
  exitTo?: (d: D) => AttrMap
}
