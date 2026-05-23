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

  // Update — invariant I4: read live attrs so retween starts from current pixels.
  // snapshotLiveAttrs calls `select(el).interrupt(BC_TRANSITION_NAME)` which cancels
  // any orchestrator-owned tween already in flight on this element. The returned
  // map IS the starting state for the new tween; d3's `.attr()` reads it from
  // the live DOM on the first tick (which is now post-interrupt), so we don't
  // pass `liveAttrs` into `tweenAttrs` directly — but capturing it documents the
  // data flow and prevents a future maintainer from removing the call as dead.
  join.each(function (d) {
    const el = this as Element
    const end = cfg.attrs(d as D)
    if (t) {
      const liveAttrs = snapshotLiveAttrs(el, namesToTween)
      void liveAttrs
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
