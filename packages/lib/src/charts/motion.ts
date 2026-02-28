/**
 * Returns 0 when the user prefers reduced motion, otherwise returns the input duration.
 */
export function getTransitionDuration(ms: number): number {
  if (typeof window === 'undefined') { return ms }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms
}
