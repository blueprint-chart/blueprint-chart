import * as d3 from 'd3'
import type { SceneTransition } from './scene-transition'
import { interpolatePath } from './interpolate-path'

/** Plot rectangle in chart-area coordinates: origin + inner size. */
export interface PlotRect {
  left: number
  top: number
  width: number
  height: number
}

export interface FrameGeometryOptions {
  /** The chart-area `<g>` whose `transform` carries the plot origin. */
  group: SVGGElement
  /** The plot clip rect, if any (width/height interpolate with the plot size). */
  clipRect: SVGRectElement | null
  from: PlotRect
  to: PlotRect
}

/**
 * Ease the plot frame geometry (chart-area group origin + clip size) from the
 * prior scene's rect to the new one on the orchestrator's `bc-scene` clock.
 *
 * The new render has already placed the group/clip at the NEW geometry, so the
 * tween first resets them to `from` and eases to `to`. The group `transform`
 * uses the point-wise interpolator (d3's default string interp mangles it);
 * clip width/height are numeric and use d3's default attr tween.
 *
 * Registers a buffered flush, so call it during `committing` (e.g. inside
 * `SceneTransition.run`). On the snap path (duration 0 / reduced motion) the
 * geometry is set directly to `to`.
 */
export interface PlotFrameOptions {
  /** The chart's `<svg>` (used to find the clip rect by id). */
  svg: SVGSVGElement
  /** The plot clip-path id (its `rect` size interpolates with the plot). */
  clipId: string
  /** The chart-area `<g>` whose `transform` carries the plot origin. */
  group: SVGGElement
  /** The prior scene's plot rect (from the transition cache), if any. */
  from: PlotRect | undefined
  /** This render's plot rect. */
  to: PlotRect
  /** Only ease when true (same-type transition with prior marks to tween from). */
  active: boolean
}

/**
 * Renderer-facing wrapper over {@link tweenFrameGeometry}: resolves the clip
 * rect from `svg`/`clipId` and eases from the cached prior plot rect to this
 * render's rect. No-ops unless `active` and a prior rect exist. Using the cached
 * prior rect (rather than reconstructing it from margins) keeps the `from`
 * geometry exact even when a chart's plot height differs from its inner height
 * (e.g. a category-label band) or carries clip inflation.
 */
export function tweenPlotFrame(orch: SceneTransition, opts: PlotFrameOptions): void {
  if (!opts.active || !opts.from) {
    return
  }
  const clipRect = opts.svg.querySelector(`#${opts.clipId} rect`) as SVGRectElement | null
  tweenFrameGeometry(orch, { group: opts.group, clipRect, from: opts.from, to: opts.to })
}

export function tweenFrameGeometry(orch: SceneTransition, opts: FrameGeometryOptions): void {
  const { group, clipRect, from, to } = opts
  const toTransform = `translate(${to.left},${to.top})`
  const fromTransform = `translate(${from.left},${from.top})`

  orch.register(() => {
    const t = orch.activeTransition
    if (!t) {
      // Snap path.
      group.setAttribute('transform', toTransform)
      if (clipRect) {
        clipRect.setAttribute('width', String(to.width))
        clipRect.setAttribute('height', String(to.height))
      }
      return
    }
    // Animated path: reset to `from`, then tween to `to`.
    group.setAttribute('transform', fromTransform)
    d3.select(group).transition(t).attrTween('transform', function (this: Element) {
      const f = this.getAttribute('transform') ?? fromTransform
      return interpolatePath(f, toTransform)
    })
    if (clipRect) {
      clipRect.setAttribute('width', String(from.width))
      clipRect.setAttribute('height', String(from.height))
      d3.select(clipRect).transition(t)
        .attr('width', to.width)
        .attr('height', to.height)
    }
  })
}
