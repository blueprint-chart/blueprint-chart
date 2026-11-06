import { describe, it, expect } from 'vitest'
import { measureTextWidth } from '../../text-measure'
import { placePointLabels, type LabelCandidate, type PlacedLabel } from './labels'

const FONT = 11

function box(label: PlacedLabel, text: string) {
  const width = measureTextWidth(text, FONT)
  const left = label.anchor === 'start' ? label.x : label.anchor === 'end' ? label.x - width : label.x - width / 2
  return { left, right: left + width, top: label.y - FONT / 2, bottom: label.y + FONT / 2 }
}

function intersects(a: ReturnType<typeof box>, b: ReturnType<typeof box>) {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

describe('placePointLabels', () => {
  it('never returns overlapping label boxes', () => {
    const c: LabelCandidate[] = Array.from({ length: 40 }, (_, i) => ({ key: String(i), text: `Country ${i}`, cx: 100 + (i % 5), cy: 100, r: 4 }))
    const placed = placePointLabels(c, { width: 400, height: 300 }, FONT)
    const text = new Map(c.map(d => [d.key, d.text]))
    const boxes = placed.map(p => box(p, text.get(p.key)!))
    boxes.forEach((a, i) => boxes.slice(i + 1).forEach(b => expect(intersects(a, b)).toBe(false)))
    expect(placed.length).toBeGreaterThan(0)
    expect(placed.length).toBeLessThan(c.length)
  })

  it('keeps the rendered line boxes apart, not just the em boxes', () => {
    const c: LabelCandidate[] = [
      { key: 'a', text: 'China', cx: 100, cy: 100, r: 0 },
      { key: 'b', text: 'Poland', cx: 100, cy: 112, r: 0 },
    ]
    const [a, b] = placePointLabels(c, { width: 400, height: 300 }, FONT)
    // A browser lays an 11px label out in a ~13px line box.
    const lineBox = (label: PlacedLabel, text: string) => ({ ...box(label, text), top: label.y - FONT * 0.6, bottom: label.y + FONT * 0.6 })
    expect(intersects(lineBox(a, 'China'), lineBox(b, 'Poland'))).toBe(false)
  })

  it('places a lone label to the right of its bubble', () => {
    const [label] = placePointLabels([{ key: 'a', text: 'Chad', cx: 50, cy: 50, r: 5 }], { width: 400, height: 300 }, FONT)
    expect(label.anchor).toBe('start')
    expect(label.x).toBeGreaterThan(55)
  })

  it('flips to the left near the right edge', () => {
    const [label] = placePointLabels([{ key: 'a', text: 'Chad', cx: 395, cy: 50, r: 3 }], { width: 400, height: 300 }, FONT)
    expect(label.anchor).toBe('end')
    expect(label.x).toBeLessThan(392)
  })
})
