/**
 * @deprecated As of the Scene Transition Orchestrator, mark rendering has fully
 * migrated to `packages/lib/src/transitions/` (SceneTransition + featureJoin +
 * tweenFrameGeometry): the legacy `reinsertWithOffset` mark-translate wrapper is
 * gone. What remains here is the cross-type fade path and the transition-duration
 * flag: every renderer and the axis subsystem still call `setRenderTransition` /
 * `getDefaultTransitionMs`, and cross-type transitions use `snapshotForFadeOut` /
 * `commitFadeOut` / `fadeIn`. This file can be deleted once those move too.
 */

/**
 * Returns 0 when the user prefers reduced motion, otherwise returns the input duration.
 */
export function getTransitionDuration(ms: number): number {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return ms
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms
}

export const DEFAULT_TRANSITION_MS = 500

/**
 * Module-level flag: 0 = no transition (initial render), DEFAULT_TRANSITION_MS = scene transition.
 * Set via setRenderTransition() at the start of each renderer's render() function.
 */
let _transitionMs = 0

/**
 * Call at the start of each render() function to control whether transitions play.
 * Pass `true` for scene transitions, `false` (default) for initial / non-scene renders.
 */
export function setRenderTransition(enabled: boolean): void {
  _transitionMs = enabled ? DEFAULT_TRANSITION_MS : 0
}

/**
 * Returns the current scene transition duration, respecting `prefers-reduced-motion`.
 * Returns 0 when not in a scene transition (i.e. setRenderTransition(false) was last called).
 */
export function getDefaultTransitionMs(): number {
  return getTransitionDuration(_transitionMs)
}

/**
 * Fade an element in using the Web Animations API.
 * Respects `prefers-reduced-motion` via `getTransitionDuration`.
 */
export function fadeIn(el: Element, ms?: number): void {
  const duration = getTransitionDuration(ms ?? DEFAULT_TRANSITION_MS)
  if (duration <= 0 || typeof el.animate !== 'function') {
    return
  }
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: 'ease-in-out' })
}

/**
 * Capture a visual snapshot of the container's current content as a
 * detached overlay element.  Call this *before* clearing the container.
 *
 * After the new chart is rendered, append the returned overlay to the
 * container via `commitFadeOut()` — it will sit on top and fade to
 * transparent, then self-remove.
 *
 * Returns `null` when reduced-motion is active or the container is empty.
 */
export function snapshotForFadeOut(container: HTMLElement, ms?: number): HTMLElement | null {
  const duration = getTransitionDuration(ms ?? DEFAULT_TRANSITION_MS)

  // Remove any prior fade overlays before measuring/cloning — otherwise a
  // rapid re-trigger mid-fade would clone the previous overlay into the new
  // one, causing visual doubling and N² DOM growth.  Also cancel each
  // overlay's in-flight Web Animations API animations so they don't keep
  // running detached.
  container.querySelectorAll<HTMLElement>('[data-bc-fade-overlay]').forEach((el) => {
    if (typeof el.getAnimations === 'function') {
      el.getAnimations().forEach(a => a.cancel())
    }
    el.remove()
  })

  if (duration <= 0 || container.children.length === 0) {
    return null
  }

  const overlay = document.createElement('div')
  overlay.style.position = 'absolute'
  overlay.style.inset = '0'
  overlay.style.pointerEvents = 'none'
  // Flex column so cloned `.bc-frame--constrained` (which uses `flex: 1`)
  // lays out at full overlay dimensions instead of collapsing to 0x0.
  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  overlay.dataset.bcFadeOverlay = 'true'

  // Clone (not move) children so the originals remain available for
  // axis extraction and are properly cleaned up by replaceChildren().
  Array.from(container.childNodes).forEach((node) => {
    overlay.appendChild(node.cloneNode(true))
  })

  // Strip axis clones — real axes will morph smoothly underneath the
  // overlay, so duplicating them in the snapshot causes visual doubling.
  overlay.querySelectorAll('.bc-axis-vertical, .bc-axis-horizontal').forEach((el) => {
    el.remove()
  })

  // Strip footer and note clones — the footer contains teleported UI (e.g.
  // scene player buttons) that must not appear twice during the fade. The
  // cloned frame loses its constrained-mode positioning so the footer would
  // render in normal flow (below the description) instead of at the bottom.
  overlay.querySelectorAll('.bc-frame-footer, .bc-frame-note').forEach((el) => {
    el.remove()
  })

  // Defensive: strip nested fade overlays and prior fade-snapshot frames in
  // case any slipped through the container-level cleanup above (e.g. when a
  // caller cloned them under a custom wrapper).
  overlay.querySelectorAll('[data-bc-fade-overlay], .bc-frame--fade-snapshot').forEach((el) => {
    el.remove()
  })

  // Rename .bc-frame in the overlay so selectors like `.bc-frame` only
  // match the live chart, not the fading snapshot.
  overlay.querySelectorAll('.bc-frame').forEach((el) => {
    el.classList.remove('bc-frame')
    el.classList.add('bc-frame--fade-snapshot')
  })

  return overlay
}

/**
 * Append a previously-created fade-out overlay to the container and
 * start its opacity animation.  The overlay removes itself on finish.
 */
export function commitFadeOut(container: HTMLElement, overlay: HTMLElement, ms?: number): void {
  const duration = getTransitionDuration(ms ?? DEFAULT_TRANSITION_MS)

  // Ensure the container is a positioning context
  const pos = getComputedStyle(container).position
  if (pos === 'static') {
    container.style.position = 'relative'
  }

  container.appendChild(overlay)

  if (duration > 0 && typeof overlay.animate === 'function') {
    const anim = overlay.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration, easing: 'ease-in-out' },
    )
    anim.onfinish = () => overlay.remove()
  }
  else {
    overlay.remove()
  }
}
