import { CompassDirection } from '../../types'

// ---------------------------------------------------------------------------
// Direction vector helpers
// ---------------------------------------------------------------------------

export const DIRECTION_VECTORS: Record<CompassDirection, { dx: number, dy: number }> = {
  N: { dx: 0, dy: -1 },
  NE: { dx: 0.707, dy: -0.707 },
  E: { dx: 1, dy: 0 },
  SE: { dx: 0.707, dy: 0.707 },
  S: { dx: 0, dy: 1 },
  SW: { dx: -0.707, dy: 0.707 },
  W: { dx: -1, dy: 0 },
  NW: { dx: -0.707, dy: -0.707 },
  center: { dx: 0, dy: 0 },
}

export const RECT_ANCHOR: Record<CompassDirection, { nx: number, ny: number }> = {
  N: { nx: 0, ny: -1 },
  NE: { nx: 1, ny: -1 },
  E: { nx: 1, ny: 0 },
  SE: { nx: 1, ny: 1 },
  S: { nx: 0, ny: 1 },
  SW: { nx: -1, ny: 1 },
  W: { nx: -1, ny: 0 },
  NW: { nx: -1, ny: -1 },
  center: { nx: 0, ny: 0 },
}

const HORIZONTAL_DIRECTION_MAP: Record<CompassDirection, CompassDirection> = {
  [CompassDirection.N]: CompassDirection.W,
  [CompassDirection.NE]: CompassDirection.NW,
  [CompassDirection.E]: CompassDirection.N,
  [CompassDirection.SE]: CompassDirection.NE,
  [CompassDirection.S]: CompassDirection.E,
  [CompassDirection.SW]: CompassDirection.SE,
  [CompassDirection.W]: CompassDirection.S,
  [CompassDirection.NW]: CompassDirection.SW,
  [CompassDirection.Center]: CompassDirection.Center,
}

export function computeDirectionOffset(
  direction: CompassDirection,
  distance: number,
): { dx: number, dy: number } {
  const v = DIRECTION_VECTORS[direction] ?? DIRECTION_VECTORS.NW
  return { dx: v.dx * distance, dy: v.dy * distance }
}

export function rotateDirectionForHorizontal(dir: CompassDirection): CompassDirection {
  return HORIZONTAL_DIRECTION_MAP[dir] ?? dir
}
