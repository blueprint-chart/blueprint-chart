import * as d3 from 'd3'
import 'd3-transition'

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
 * Returns the default scene transition duration, respecting `prefers-reduced-motion`.
 */
export function getDefaultTransitionMs(): number {
  return getTransitionDuration(DEFAULT_TRANSITION_MS)
}

/**
 * Reinsert prior elements into a parent, wrapping them in a compensating
 * `<g translate(dx,dy)>` that transitions to identity over the default
 * duration.  This corrects for chartArea origin shifts (e.g. when legend
 * toggles change margins) so that prior elements don't visually jump.
 *
 * When dx/dy are both 0, elements are appended directly without a wrapper.
 */
export function reinsertWithOffset(
  parent: Element,
  elements: Element[],
  dx: number,
  dy: number,
): void {
  if (elements.length === 0) {
    return
  }
  if (dx === 0 && dy === 0) {
    elements.forEach(el => parent.appendChild(el))
    return
  }
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  wrapper.setAttribute('transform', `translate(${dx},${dy})`)
  elements.forEach(el => wrapper.appendChild(el))
  parent.appendChild(wrapper)
  const duration = getDefaultTransitionMs()
  if (duration > 0) {
    // Use attrTween with string interpolation to avoid D3's SVG
    // transform parsing (which reads baseVal, unsupported in jsdom)
    d3.select(wrapper)
      .transition()
      .duration(duration)
      .attrTween('transform', () => {
        const ix = d3.interpolateNumber(dx, 0)
        const iy = d3.interpolateNumber(dy, 0)
        return (t: number) => `translate(${ix(t)},${iy(t)})`
      })
      .on('end', () => {
        while (wrapper.firstChild) {
          parent.appendChild(wrapper.firstChild)
        }
        wrapper.remove()
      })
  }
  else {
    while (wrapper.firstChild) {
      parent.appendChild(wrapper.firstChild)
    }
    wrapper.remove()
  }
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
  if (duration <= 0 || container.children.length === 0) {
    return null
  }

  const overlay = document.createElement('div')
  overlay.style.position = 'absolute'
  overlay.style.inset = '0'
  overlay.style.pointerEvents = 'none'
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
