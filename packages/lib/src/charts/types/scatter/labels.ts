import { measureTextWidth } from '../../text-measure'

export interface LabelCandidate { key: string, text: string, cx: number, cy: number, r: number }

export interface PlacedLabel { key: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

interface Box { left: number, right: number, top: number, bottom: number }

const GAP = 3
// Rendered glyphs run a pixel or two wider than measured, so touching boxes would visibly collide.
const LABEL_PAD = 2
// A browser lays text out in a line box taller than its font size: 13px for 11px
// in DejaVu Sans, 14px in WenQuanYi Zen Hei.
const LINE_HEIGHT_EM = 1.3

function placements(c: LabelCandidate, fontPx: number): PlacedLabel[] {
  const { key, cx, cy, r } = c
  const half = fontPx * LINE_HEIGHT_EM / 2
  return [
    { key, x: cx + r + GAP, y: cy, anchor: 'start' },
    { key, x: cx - r - GAP, y: cy, anchor: 'end' },
    { key, x: cx, y: cy - r - GAP - half, anchor: 'middle' },
    { key, x: cx, y: cy + r + GAP + half, anchor: 'middle' },
  ]
}

function boxOf(label: PlacedLabel, width: number, fontPx: number): Box {
  const shift = { start: 0, middle: width / 2, end: width }[label.anchor]
  const left = label.x - shift
  const half = fontPx * LINE_HEIGHT_EM / 2
  return { left, right: left + width, top: label.y - half, bottom: label.y + half }
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right + LABEL_PAD && b.left < a.right + LABEL_PAD && a.top < b.bottom && b.top < a.bottom
}

export function placePointLabels(candidates: LabelCandidate[], bounds: { width: number, height: number }, fontPx: number): PlacedLabel[] {
  const placed: PlacedLabel[] = []
  const taken: Box[] = []
  for (const candidate of candidates) {
    const width = measureTextWidth(candidate.text, fontPx)
    for (const label of placements(candidate, fontPx)) {
      const box = boxOf(label, width, fontPx)
      const inBounds = box.left >= 0 && box.right <= bounds.width && box.top >= 0 && box.bottom <= bounds.height
      if (inBounds && !taken.some(t => overlaps(t, box))) {
        placed.push(label)
        taken.push(box)
        break
      }
    }
  }
  return placed
}
