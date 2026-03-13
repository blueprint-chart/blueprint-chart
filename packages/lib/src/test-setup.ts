/**
 * Stub HTMLCanvasElement.getContext for jsdom which lacks canvas support.
 * The lib uses canvas only for text measurement with a character-count fallback,
 * so returning a minimal mock is safe.
 */
HTMLCanvasElement.prototype.getContext = (() => {
  return {
    font: '',
    measureText: (text: string) => ({ width: text.length * 6 }),
  }
}) as typeof HTMLCanvasElement.prototype.getContext
