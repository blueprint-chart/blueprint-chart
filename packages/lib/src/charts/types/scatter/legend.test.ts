import { describe, it, expect } from 'vitest'
import type { ScatterPoint } from './points'
import { groupColors, sizeLegendValues, renderScatterKey } from './legend'

describe('scatter legend helpers', () => {
  it('assigns palette colors by first appearance', () => {
    const pts = [{ group: 'B' }, { group: 'A' }, { group: 'B' }, {}] as ScatterPoint[]
    expect([...groupColors(pts, ['#1', '#2'])]).toEqual([['B', '#1'], ['A', '#2']])
  })

  it('picks 2 or 3 nice size values', () => {
    const v = sizeLegendValues(213)
    expect(v.length).toBeGreaterThanOrEqual(2)
    expect(v.length).toBeLessThanOrEqual(3)
    expect(v.every((x, i) => x > 0 && x <= 213 && (i === 0 || x > v[i - 1]))).toBe(true)
  })

  it('draws nothing when there is no size and no trend', () => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    expect(renderScatterKey(g, { sizeValues: [], radius: () => 1, trend: false })).toBeNull()
  })

  it('draws a trend key without a size legend', () => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    renderScatterKey(g, { sizeValues: [], radius: () => 1, trend: true })
    expect(g.querySelector('.bc-size-legend')).toBeNull()
    expect(g.querySelector('.bc-trend-key')!.textContent).toBe('Trend')
  })
})
