import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { parseData } from '../../parse-data'
import { getSceneTransition } from '../../../transitions'
import { SortMode } from '../../../enums'
import { HIGHLIGHT_DIM_OPACITY } from '../../plugins/highlight'
import { render as renderBarVertical } from '../bar-vertical/bar-vertical'
import { render } from './dot-plot'

// Kept apart from dot-plot.test.ts: its fake timers leave d3-timer waiting on a frame that never fires, so tweens here would freeze.
const RANGE = parseData('series = "Poll","High","Low"\n"CDU/CSU" = 29,32,27\n"Greens" = 22,25,20\n"SPD" = 14,16,12')
const RANGE_SCENE_2 = parseData('series = "Poll","High","Low"\n"CDU/CSU" = 25,28,22\n"Greens" = 12,15,10\n"SPD" = 26,29,23')
const DUMBBELL = parseData('series = "2015","2024"\n"a" = 10,30\n"b" = 50,40\n"c" = 20,60')
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

describe('dot plot scene transitions', () => {
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

  it('keeps the same dot element across scenes', async () => {
    render(container, RANGE, {})
    const before = container.querySelector('.bc-dot[data-key="SPD|Poll"]')
    render(container, RANGE_SCENE_2, {}, true)
    expect(container.querySelector('.bc-dot[data-key="SPD|Poll"]')).toBe(before)
  })

  it('fades range bars out when the next scene is a dumbbell', async () => {
    render(container, RANGE, {})
    render(container, parseData('series = "2017","2021"\n"SPD" = 20,26\n"Greens" = 9,15'), {}, true)
    await wait(1200)
    expect(container.querySelectorAll('.bc-dot-range')).toHaveLength(0)
    expect(container.querySelectorAll('.bc-dot-line')).toHaveLength(2)
  })

  it('cross-fades from another chart type', () => {
    renderBarVertical(container, parseData('"a" = 1'), {})
    render(container, RANGE, {}, true)
    expect(container.querySelectorAll('.bc-dot')).toHaveLength(3)
  })

  it('glides a kept dot mid-transition', async () => {
    const orch = getSceneTransition(container)
    render(container, RANGE, {})
    const dot = container.querySelector('.bc-dot[data-key="SPD|Poll"]')!
    const start = Number(dot.getAttribute('cx'))
    orch.run(() => render(container, RANGE_SCENE_2, {}, true), { duration: 1500 })
    await wait(150)
    const mid = Number(dot.getAttribute('cx'))
    await wait(1700)
    const end = Number(dot.getAttribute('cx'))
    expect(mid).toBeGreaterThan(Math.min(start, end))
    expect(mid).toBeLessThan(Math.max(start, end))
  })

  it('glides a dumbbell line, arrowhead included, when a gap opens', async () => {
    const orch = getSceneTransition(container)
    render(container, parseData('series = "2015","2024"\n"a" = 10,10\n"b" = 1,2'), { arrows: true })
    const line = container.querySelector('.bc-dot-line[data-key="a"]')!
    const start = line.getAttribute('d')
    orch.run(() => render(container, parseData('series = "2015","2024"\n"a" = 10,30\n"b" = 1,2'), { arrows: true }, true), { duration: 1500 })
    await wait(150)
    const mid = line.getAttribute('d')
    await wait(1700)
    expect(mid).not.toBe(start)
    expect(mid).not.toBe(line.getAttribute('d'))
    expect(mid).not.toContain('NaN')
  })

  it('moves the dim to the newly highlighted row, then clears it', async () => {
    const orch = getSceneTransition(container)
    const opacity = (row: string) => container.querySelector(`.bc-dot[data-key="${row}|Poll"]`)!.getAttribute('opacity')
    render(container, RANGE, { highlights: [{ target: 'SPD' }] })
    orch.run(() => render(container, RANGE, { highlights: [{ target: 'Greens' }] }, true), { duration: 300 })
    await wait(800)
    expect(opacity('SPD')).toBe(String(HIGHLIGHT_DIM_OPACITY))
    expect(opacity('Greens')).toBe('1')
    orch.run(() => render(container, RANGE, {}, true), { duration: 300 })
    await wait(800)
    expect(['CDU/CSU', 'Greens', 'SPD'].map(opacity)).toEqual(['1', '1', '1'])
  })

  it('updates value label text on kept and entering rows', () => {
    render(container, RANGE, { valueLabels: true })
    const kept = container.querySelector('.bc-dot-label[data-key="SPD|range"]')!
    render(container, parseData('series = "Poll","High","Low"\n"SPD" = 20,22,18\n"FDP" = 10,12,8'), { valueLabels: true }, true)
    expect(kept.textContent).toBe('20')
    expect(container.querySelector('.bc-dot-label[data-key="FDP|range"]')!.textContent).toBe('10')
  })

  it('moves a kept row when the sort order changes', () => {
    render(container, DUMBBELL, {})
    const dot = container.querySelector('.bc-dot[data-key="a|2015"]')!
    const cy0 = dot.getAttribute('cy')
    render(container, DUMBBELL, { sortMode: SortMode.Gap }, true)
    expect(container.querySelector('.bc-dot[data-key="a|2015"]')).toBe(dot)
    expect(dot.getAttribute('cy')).not.toBe(cy0)
  })

  it('leaves no ghost marks after rapid scene changes', async () => {
    const orch = getSceneTransition(container)
    render(container, RANGE, {})
    for (const scene of [DUMBBELL, RANGE, DUMBBELL]) {
      orch.run(() => render(container, scene, {}, true), { duration: 300 })
      await wait(100)
    }
    await wait(1000)
    expect(container.querySelectorAll('.bc-dot')).toHaveLength(6)
    expect(container.querySelectorAll('.bc-dot-range')).toHaveLength(0)
    expect([...container.querySelectorAll('.bc-dot, .bc-dot-line')].map(el => el.getAttribute('opacity'))).toEqual(Array(9).fill('1'))
  })
})
