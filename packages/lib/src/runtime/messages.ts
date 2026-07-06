// Blueprint Chart embed message contract.
//
// A rendered chart iframe posts these messages to its parent. Both the
// production embed (runtime.ts) and the docs preview (BpcPreview.vue) consume
// them, so the shape lives in one place to keep the two consumers in sync.

export const RESIZE_MESSAGE = 'blueprint-chart-resize'
export const ERROR_MESSAGE = 'blueprint-chart-error'

/**
 * Validate a `message` event payload as a resize notification and return the
 * measured height, or null if the payload is not a well-formed resize message.
 * Callers must still confirm the event originated from their own iframe.
 */
export function readResizeHeight(data: unknown): number | null {
  if (
    typeof data === 'object'
    && data !== null
    && (data as { type?: unknown }).type === RESIZE_MESSAGE
    && typeof (data as { height?: unknown }).height === 'number'
  ) {
    return (data as { height: number }).height
  }
  return null
}

/** True when the payload is a well-formed render-error notification. */
export function isErrorMessage(data: unknown): boolean {
  return (
    typeof data === 'object'
    && data !== null
    && (data as { type?: unknown }).type === ERROR_MESSAGE
  )
}
