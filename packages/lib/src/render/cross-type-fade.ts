/**
 * @deprecated As of the Scene Transition Orchestrator (Stage 1+), this module
 * is being retired in favour of `packages/lib/src/transitions/` (the
 * SceneTransition lifecycle and the role-matcher's per-feature crossfade
 * fallback). Currently still used as the cross-type transition mechanism while
 * the role-matcher scaffolding (Stage 7) is wired but not yet driving
 * cross-feature exit behaviour. Delete when every renderer uses featureJoin
 * AND the role-matcher fully handles cross-type exits.
 */
import { snapshotForFadeOut, commitFadeOut, fadeIn } from '../charts/motion'

const prevChartType = new WeakMap<HTMLElement, string>()

/**
 * Cancel and remove any in-flight fade-out overlays inside `container`.
 *
 * Safe to call at any time — when no overlay is present this is a no-op.
 * Use as an explicit cleanup hook (e.g. when tearing down a chart or before
 * starting a brand-new fade) to prevent stacked overlays and zombie WAAPI
 * animations from accumulating on rapid re-triggers.
 */
export function cancelInflightFade(container: HTMLElement): void {
  container.querySelectorAll<HTMLElement>('[data-bc-fade-overlay]').forEach((el) => {
    if (typeof el.getAnimations === 'function') {
      el.getAnimations().forEach(a => a.cancel())
    }
    el.remove()
  })
}

export function snapshotIfTypeChanged(
  container: HTMLElement,
  newChartType: string,
  transition: boolean,
): HTMLElement | null {
  if (!transition) {
    return null
  }
  const prev = prevChartType.get(container)
  if (!prev || prev === newChartType) {
    return null
  }
  // Symmetric guard: cancel any in-flight fade before snapshotting the new
  // state.  `snapshotForFadeOut` also performs this cleanup, but doing it
  // here keeps the invariant explicit at the call site.
  cancelInflightFade(container)
  return snapshotForFadeOut(container)
}

export function commitCrossTypeFade(
  container: HTMLElement,
  newChartType: string,
  overlay: HTMLElement | null,
): void {
  prevChartType.set(container, newChartType)
  if (overlay) {
    // Fade only the chart area (`.bc-frame-body`), not the whole frame.
    // Frame chrome — header text, source/credit, and the footer's teleported
    // scene-player nav — must stay at opacity 1 throughout the cross-type
    // transition. This mirrors `snapshotForFadeOut` stripping the footer
    // from the overlay clone for the same reason: chrome doesn't crossfade.
    const newBody = container.querySelector('.bc-frame .bc-frame-body')
    if (newBody) {
      fadeIn(newBody)
    }
    commitFadeOut(container, overlay)
  }
}

export function clearCrossTypeMarker(container: HTMLElement): void {
  prevChartType.delete(container)
  cancelInflightFade(container)
}
