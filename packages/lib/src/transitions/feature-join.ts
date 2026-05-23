import * as d3 from 'd3'
import type { SceneTransition } from './scene-transition'
import { snapshotLiveAttrs } from './snapshot'
import type { AttrMap, FeatureJoinConfig } from './types'

const DEFAULT_EXIT: AttrMap = { opacity: 0 }

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
  // `cfg.role` is captured but intentionally unread in v1; the role-matcher
  // for cross-type morph (Stage 7) will consume it. See spec §3 for the
  // role catalog. Removing the property here would break Stage 7's seam.
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

  // Enter
  const entered = cfg.insert(join.enter())
  entered.each(function (d) {
    const el = this as Element
    const end = cfg.attrs(d as D)
    if (t) {
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
    sel.attr(k, String(v))
  }
  return sel
}
