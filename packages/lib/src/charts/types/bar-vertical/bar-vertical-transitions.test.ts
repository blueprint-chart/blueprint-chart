import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getSceneTransition } from '../../../transitions'
import { SortDirection } from '../../../enums'
import { render as renderVertical } from './bar-vertical'
import { render as renderHorizontal } from '../bar-horizontal/bar-horizontal'
import { parseData } from '../../parse-data'

// Kept apart from bar-vertical.test.ts: its fake timers freeze d3-timer, so tweens never tick.
const DATA = { labels: ['A', 'B', 'C'], values: [10, 30, 20] }
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

describe.each([
  { name: 'bar-vertical', render: renderVertical, axis: 'x', valueAxis: 'y', rangeKey: 'verticalAxis' },
  { name: 'bar-horizontal', render: renderHorizontal, axis: 'y', valueAxis: 'x', rangeKey: 'horizontalAxis' },
])('$name value labels across scenes', ({ render, axis, valueAxis, rangeKey }) => {
  let container: HTMLElement

  // jsdom has no SVGElement.transform; d3 reads it to tween axis transforms.
  beforeAll(() => {
    Object.defineProperty(window.SVGElement.prototype, 'transform', { configurable: true, get: () => ({ baseVal: { consolidate: () => null } }) })
  })

  afterAll(() => {
    delete (window.SVGElement.prototype as { transform?: unknown }).transform
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('slides a value label along with its bar when the bars are sorted', async () => {
    render(container, DATA, { valueLabels: true })
    const before = container.querySelector('.bc-value-label[data-bc-key="A"]')!
    const start = Number(before.getAttribute(axis))
    getSceneTransition(container).run(() => render(container, DATA, { valueLabels: true, sort: SortDirection.Descending }, true), { duration: 1500 })
    const after = container.querySelector('.bc-value-label[data-bc-key="A"]')!
    await wait(150)
    const mid = Number(after.getAttribute(axis))
    await wait(1600)
    const end = Number(after.getAttribute(axis))
    expect(after).toBe(before)
    expect(mid).toBeGreaterThan(Math.min(start, end))
    expect(mid).toBeLessThan(Math.max(start, end))
  })

  it('slides a whisker-pushed value label when the high value changes', async () => {
    const whisker = (high: number) => parseData(`series = "Value","Low","High"\n"A" = 5,2,${high}`)
    const options = { valueLabels: true, overlays: [{ columns: ['Low', 'High'], pattern: 'whisker' as const }], [rangeKey]: { range: { min: 0, max: 15 } } }
    render(container, whisker(8), options)
    const before = container.querySelector('.bc-value-label[data-bc-key="A"]')!
    const start = Number(before.getAttribute(valueAxis))
    getSceneTransition(container).run(() => render(container, whisker(12), options, true), { duration: 1500 })
    const after = container.querySelector('.bc-value-label[data-bc-key="A"]')!
    await wait(150)
    const mid = Number(after.getAttribute(valueAxis))
    await wait(1600)
    const end = Number(after.getAttribute(valueAxis))
    expect(after).toBe(before)
    expect(end).not.toBeCloseTo(start)
    expect(mid).toBeGreaterThan(Math.min(start, end))
    expect(mid).toBeLessThan(Math.max(start, end))
  })
})
