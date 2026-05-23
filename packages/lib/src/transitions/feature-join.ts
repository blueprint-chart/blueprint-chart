import * as d3 from 'd3'
import type { SceneTransition } from './scene-transition'
import type { AttrMap, FeatureJoinConfig } from './types'

/**
 * Idempotent keyed data-join for a single visual feature.
 *
 * Behaviour by orchestrator state:
 *   - `idle`       — plain d3 data-join; attrs applied directly (this task)
 *   - `committing` — buffer enter/update/exit for the next commit (next task)
 *   - `animating`  — same as committing (mid-tween featureJoin calls are
 *                     ignored at the buffer level; the orchestrator picks
 *                     them up in the next commit). For now we treat
 *                     `animating` the same as `idle` to avoid silently
 *                     no-oping; the next task refines this.
 */
export function featureJoin<D>(
  orchestrator: SceneTransition,
  cfg: FeatureJoinConfig<D>,
): void {
  if (orchestrator.state === 'idle' || orchestrator.state === 'animating') {
    applyIdle(cfg)
    return
  }
  // 'committing' branch lands in the next task.
  applyIdle(cfg)
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

function applyAttrs(el: Element, attrs: AttrMap): void {
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, String(v))
  }
}
