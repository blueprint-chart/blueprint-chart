/**
 * LINE_PAD is the minimum gap (in SVG user-space pixels) between a bounding
 * box edge and the start/end of a connecting line.  It keeps lines from
 * visually touching the text rectangle.
 */
export const LINE_PAD = 4

/**
 * 1 / tan(40°) ≈ 1.19.  A 40° threshold produces elbows that look balanced —
 * shallow angles get a longer first segment while steep angles turn earlier.
 * 40° sits between 30° (too long first leg) and 45° (turn at the midpoint,
 * which reads as a diagonal).  Hoisted to module scope to avoid recomputing
 * the trig on every drag frame.
 */
const COT_40 = 1 / Math.tan(40 * Math.PI / 180)

/**
 * Generate an SVG elbow (two-segment right-angle) path from `from` to `to`.
 *
 * The first segment departs either vertically or horizontally (controlled by
 * `departVertical`), then turns 90° toward the target.
 */
export function computeElbowPath(
  from: { x: number, y: number },
  to: { x: number, y: number },
  departVertical: boolean,
): string {
  if (departVertical) {
    const vSign = to.y >= from.y ? 1 : -1
    const dy = Math.abs(to.y - from.y)
    const dx = Math.abs(to.x - from.x)
    const segLen = Math.max(dy - dx * COT_40, 12)
    const midX = from.x
    const midY = from.y + vSign * segLen
    return `M ${from.x} ${from.y} L ${midX} ${midY} L ${to.x} ${to.y}`
  }

  const hSign = to.x >= from.x ? 1 : -1
  const dx = Math.abs(to.x - from.x)
  const dy = Math.abs(to.y - from.y)
  const segLen = Math.max(dx - dy * COT_40, 12)
  const midX = from.x + hSign * segLen
  const midY = from.y
  return `M ${from.x} ${from.y} L ${midX} ${midY} L ${to.x} ${to.y}`
}

/**
 * Build an SVG path `d` attribute for a connecting line.
 *
 * Supports three styles:
 *  - `'curve-left'` / `'curve-right'` — a single SVG arc.
 *    The radius is `0.8 × straight-line distance`.  Using 80 % of the
 *    chord length keeps the arc visually tight — a full 1.0× would be a
 *    semicircle, while smaller ratios produce arcs that are nearly straight.
 *  - `'elbow'` — two-segment right-angle path (delegates to computeElbowPath).
 *  - anything else (default / `'direct'`) — a straight line.
 */
export function buildPathD(
  from: { x: number, y: number },
  to: { x: number, y: number },
  style: string,
  departVertical: boolean,
): string {
  switch (style) {
    case 'curve-left':
    case 'curve-right': {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = dist * 0.8
      const sweep = style === 'curve-right' ? 1 : 0
      return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${to.x} ${to.y}`
    }
    case 'elbow':
      return computeElbowPath(from, to, departVertical)
    default:
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  }
}

/**
 * Move a point (`anchor`) back toward `from` by `distance` pixels.
 *
 * Used to shorten a connecting line so it stops before overlapping a circle
 * marker at the anchor position.
 */
export function shortenToward(
  anchor: { x: number, y: number },
  from: { x: number, y: number },
  distance: number,
): { x: number, y: number } {
  const dx = anchor.x - from.x
  const dy = anchor.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0 || distance <= 0) {
    return anchor
  }
  return {
    x: anchor.x - (dx / len) * distance,
    y: anchor.y - (dy / len) * distance,
  }
}

/**
 * Find the point on a bounding-box edge closest to an external target.
 *
 * Returns the midpoint of the nearest edge (top / bottom / left / right),
 * offset outward by LINE_PAD so the connecting line starts outside the box.
 */
export function bboxEdgeToward(
  bbox: { x: number, y: number, width: number, height: number },
  targetX: number,
  targetY: number,
): { x: number, y: number } {
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2

  if (targetX === cx && targetY === cy) {
    return {
      x: cx, y: cy }
  }

  const canNS = targetX >= bbox.x && targetX <= bbox.x + bbox.width
  const canEW = targetY >= bbox.y && targetY <= bbox.y + bbox.height

  type Side = { x: number, y: number, dist: number }
  const candidates: Side[] = []

  if (canNS) {
    if (targetY < cy) {
      candidates.push({
        x: cx, y: bbox.y - LINE_PAD, dist: Math.abs(cy - targetY) })
    }
    else { candidates.push({ x: cx, y: bbox.y + bbox.height + LINE_PAD, dist: Math.abs(targetY - cy) }) }
  }
  if (canEW) {
    if (targetX > cx) {
      candidates.push({
        x: bbox.x + bbox.width + LINE_PAD, y: cy, dist: Math.abs(targetX - cx) })
    }
    else { candidates.push({ x: bbox.x - LINE_PAD, y: cy, dist: Math.abs(cx - targetX) }) }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist)
    return { x: candidates[0].x, y: candidates[0].y }
  }

  const midpoints = [
    { x: cx, y: bbox.y - LINE_PAD },
    { x: cx, y: bbox.y + bbox.height + LINE_PAD },
    { x: bbox.x + bbox.width + LINE_PAD, y: cy },
    { x: bbox.x - LINE_PAD, y: cy },
  ]
  let best = midpoints[0]
  let bestDist = (best.x - targetX) ** 2 + (best.y - targetY) ** 2
  for (let i = 1; i < midpoints.length; i++) {
    const d = (midpoints[i].x - targetX) ** 2 + (midpoints[i].y - targetY) ** 2
    if (d < bestDist) {
      best = midpoints[i]
      bestDist = d
    }
  }
  return best
}
