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
