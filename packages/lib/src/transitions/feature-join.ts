import * as d3 from 'd3'
import type { SceneTransition } from './scene-transition'
import { roleScan, tagsCompatible } from './role-matcher'
import { snapshotLiveAttrs } from './snapshot'
import { interpolatePath } from './interpolate-path'
import type { AttrMap, FeatureJoinConfig } from './types'

const DEFAULT_EXIT: AttrMap = { opacity: 0 }

/**
 * Attributes whose values are numeric strings (path data, transforms) that
 * d3's default `attr` string-interpolation mangles — observed fusing area
 * coordinates into ~1e11 garbage. These are tweened with the point-wise
 * `interpolatePath` instead, reading the live value at tween start (I4).
 */
const POINTWISE_ATTRS = new Set(['d', 'transform'])

/**
 * Idempotent keyed data-join for a single visual feature.
 *
 * Behaviour by orchestrator state:
 *   - `idle` / `animating` — plain d3 data-join; attrs applied directly.
 *     A featureJoin during `animating` cannot piggyback on the in-flight
 *     transition (it has no place to register), so we snap.  Mid-tween
 *     featureJoin calls should be rare in normal flow; tests cover them.
 *   - `committing` — buffer enter / update / exit for the next commit.
 */
export function featureJoin<D>(
  orchestrator: SceneTransition,
  cfg: FeatureJoinConfig<D>,
): void {
  // `cfg.role` drives the cross-feature predecessor lookup in
  // `applyBuffered` (see `roleScan`). It is also stamped onto every
  // entered element as `data-bc-role` so future commits can find it.
  if (orchestrator.state === 'idle' || orchestrator.state === 'animating') {
    applyIdle(cfg)
    return
  }
  // committing — buffer for the next commit.
  orchestrator.register(() => applyBuffered(orchestrator, cfg))
}

function applyIdle<D>(cfg: FeatureJoinConfig<D>): void {
  const parent = d3.select<SVGElement, unknown>(cfg.parent)
  // D3's bindKey calls this with `node.__data__` for existing nodes and
  // with the new data item for incoming ones, so `cfg.key(d)` works for
  // both branches.
  const join = parent.selectAll<Element, D>(cfg.selector).data(cfg.data, (d: D) => cfg.key(d))

  join.exit().remove()

  const entered = cfg.insert(join.enter())
  tagRole(entered, cfg)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged = entered.merge(join as any)
  merged.each(function (d) {
    applyAttrs(this as Element, cfg.attrs(d as D))
  })
}

function applyBuffered<D>(orchestrator: SceneTransition, cfg: FeatureJoinConfig<D>): void {
  const t = orchestrator.activeTransition
  const parent = d3.select<SVGElement, unknown>(cfg.parent)
  const join = parent.selectAll<Element, D>(cfg.selector).data(cfg.data, (d: D) => cfg.key(d))

  const namesToTween = collectAttrNames(cfg)

  // Exit
  const exitSel = join.exit<D>()
  if (t) {
    exitSel.each(function () {
      const el = this as Element
      const datum = d3.select(el).datum() as D
      const target = cfg.exitTo ? cfg.exitTo(datum) : DEFAULT_EXIT
      tweenAttrs(el, target, t)
        .on('end.featureJoin-exit', () => el.parentNode?.removeChild(el))
    })
  }
  else {
    exitSel.remove()
  }

  // Role index for cross-feature predecessor lookup. When the new commit's
  // selector differs from the prior's (cross-type morph), d3's same-parent
  // data-join can't find the predecessor, but a same-role/same-key element
  // may still live elsewhere in the container.
  const roleIndex = roleScan(orchestrator.container, cfg.role)

  // Enter
  const entered = cfg.insert(join.enter())
  tagRole(entered, cfg)
  entered.each(function (d) {
    const el = this as Element
    const end = cfg.attrs(d as D)
    if (t) {
      // Cross-feature predecessor lookup: a same-role, same-key element
      // already in the container can act as the morph-from state when the
      // selector-based data-join missed it (cross-type transition). The
      // roleIndex is keyed by the encoded attribute value (see
      // `encodeKeyForAttr`), so encode before looking up.
      const predecessor = roleIndex.get(encodeKeyForAttr(cfg.key(d as D)))
      if (predecessor && tagsCompatible(predecessor, el)) {
        const start = snapshotLiveAttrs(predecessor, namesToTween)
        applyAttrs(el, start)
        tweenAttrs(el, end, t)
        return
      }
      const start = cfg.enterFrom ? cfg.enterFrom(d as D) : end
      applyAttrs(el, start)
      tweenAttrs(el, end, t)
    }
    else {
      applyAttrs(el, end)
    }
  })

  // Update — invariant I4: cancel the orchestrator's named tween on each
  // surviving element so d3's first tick reads the live DOM (current pixels)
  // as the starting state, not the target of the previous tween. The call
  // looks like a value-discarding read but is load-bearing — DO NOT remove
  // even if linters flag it.
  join.each(function (d) {
    const el = this as Element
    const end = cfg.attrs(d as D)
    if (t) {
      snapshotLiveAttrs(el, namesToTween)
      tweenAttrs(el, end, t)
    }
    else {
      applyAttrs(el, end)
    }
  })
}

/**
 * Stamp the role + key attributes on freshly entered elements so the
 * cross-feature role-matcher can find them on subsequent commits. The
 * attributes are namespaced (`data-bc-*`) to avoid colliding with any
 * `data-*` attributes a renderer might already be using.
 */
function tagRole<D>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entered: d3.Selection<any, D, any, any>,
  cfg: FeatureJoinConfig<D>,
): void {
  entered.attr('data-bc-role', cfg.role)
  entered.attr('data-bc-key', (d: D) => encodeKeyForAttr(cfg.key(d)))
}

/**
 * `data-bc-key` must survive a round-trip through an XML attribute: sample
 * thumbnails and SVG export serialize the live chart, and XML 1.0 forbids
 * control characters in attribute values — a single `\0` (the composite-key
 * separator used by multi-series chart types) invalidates the whole
 * document. Encode control characters to the printable "symbol for unit
 * separator" (␟, U+241F) before stamping. The roleIndex lookup applies the
 * same encoding, so cross-feature key matching is unaffected. Tab, LF and
 * CR are valid in attributes and left alone.
 */
function encodeKeyForAttr(key: string): string {
  // eslint-disable-next-line no-control-regex
  return key.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '␟')
}

function collectAttrNames<D>(cfg: FeatureJoinConfig<D>): string[] {
  if (cfg.data.length === 0) {
    return []
  }
  return Object.keys(cfg.attrs(cfg.data[0]))
}

function applyAttrs(el: Element, attrs: AttrMap): void {
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v))
  }
}

function tweenAttrs(
  el: Element,
  to: AttrMap,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
) {
  const sel = d3.select(el).transition(t)
  for (const [k, v] of Object.entries(to)) {
    if (POINTWISE_ATTRS.has(k)) {
      const target = String(v)
      // Read the "from" value live at tween start so an interrupted retween
      // starts from the current visible state (invariant I4).
      sel.attrTween(k, function (this: Element) {
        const from = this.getAttribute(k) ?? target
        return interpolatePath(from, target)
      })
    }
    else {
      sel.attr(k, String(v))
    }
  }
  return sel
}
