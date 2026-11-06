import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { parseData } from '../../parse-data'
import { getSceneTransition } from '../../../transitions'
import { render as renderBarVertical } from '../bar-vertical/bar-vertical'
import { render } from './scatter'

// Kept apart from scatter.test.ts: its fake timers leave d3-timer waiting on a frame that never fires, so tweens here would freeze.
const DATA = parseData([
  'series = "GDP per capita","Life expectancy","Population","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
  '"Germany" = 50000, 81.0, 84, "Europe"',
  '"Chad" = 1500, 52.8, 18, "Africa"',
  '"Nigeria" = 5000, 53.9, 213, "Africa"',
  '"Japan" = 42000, 84.5, 125, "Asia"',
].join('\n'))
const SCENE_2 = parseData([
  'series = "GDP per capita","Life expectancy","Population","Continent"',
  '"France" = 20000, 77.0, 57, "Europe"',
  '"Chad" = 900, 47.0, 6, "Africa"',
  '"Peru" = 6000, 66.0, 22, "Americas"',
].join('\n'))
const points = (c: HTMLElement) => Array.from(c.querySelectorAll<SVGCircleElement>('.bc-scatter-point'))
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

describe('scatter scene transitions', () => {
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

  it('keeps the same DOM node for a matched point and moves it', () => {
    render(container, DATA, {})
    const before = container.querySelector('[data-key="France"]')!
    const cx0 = before.getAttribute('cx')
    render(container, SCENE_2, {}, true)
    const after = container.querySelector('[data-key="France"]')!
    expect(after).toBe(before)
    expect(after.getAttribute('cx')).not.toBe(cx0)
  })

  it('slides a point label along with its bubble', async () => {
    render(container, DATA, { showLabels: true })
    const before = container.querySelector('.bc-point-label[data-key="France"]')!
    const x0 = Number(before.getAttribute('x'))
    getSceneTransition(container).run(() => render(container, SCENE_2, { showLabels: true }, true), { duration: 1500 })
    const after = container.querySelector('.bc-point-label[data-key="France"]')!
    expect(after).toBe(before)
    await wait(150)
    const mid = Number(after.getAttribute('x'))
    await wait(1600)
    const x1 = Number(after.getAttribute('x'))
    expect(mid).not.toBe(x0)
    expect(mid).not.toBe(x1)
  })

  it('enters new points and removes exited ones', () => {
    render(container, DATA, {})
    render(container, SCENE_2, {}, true)
    expect(container.querySelector('[data-key="Peru"]')).not.toBeNull()
    expect(container.querySelector('[data-key="Japan"]')).toBeNull()
  })

  it('keeps the same trend line node so it morphs', () => {
    render(container, DATA, { trend: 'overall' })
    const before = container.querySelector('.bc-trend-line')
    render(container, SCENE_2, { trend: 'overall' }, true)
    expect(container.querySelector('.bc-trend-line')).toBe(before)
  })

  it('falls back to a fade from another chart type', () => {
    renderBarVertical(container, { labels: ['a'], values: [1] }, {})
    expect(() => render(container, DATA, {}, true)).not.toThrow()
    expect(points(container)).toHaveLength(5)
  })

  it('leaves no ghost points after rapid scene changes', async () => {
    const orch = getSceneTransition(container)
    render(container, DATA, {})
    for (const scene of [SCENE_2, DATA, SCENE_2]) {
      orch.run(() => render(container, scene, {}, true), { duration: 300 })
      await wait(100)
    }
    await wait(1000)
    expect(points(container).map(c => c.dataset.key).sort()).toEqual(['Chad', 'France', 'Peru'])
    expect(points(container).map(c => c.getAttribute('opacity'))).toEqual(['1', '1', '1'])
  })

  it('keeps largest-first draw order when sizes swap rank', () => {
    const before = parseData('series = "x","y","size"\n"France" = 1, 1, 68\n"Chad" = 2, 2, 18')
    const after = parseData('series = "x","y","size"\n"France" = 1, 1, 5\n"Chad" = 2, 2, 100\n"Peru" = 3, 3, 50')
    render(container, before, {})
    render(container, after, {}, true)
    expect(points(container).map(c => c.dataset.key)).toEqual(['Chad', 'Peru', 'France'])
  })

  it('glides matched points and fades exiting ones mid-transition', async () => {
    const orch = getSceneTransition(container)
    render(container, DATA, {})
    const france = container.querySelector('[data-key="France"]')!
    const start = Number(france.getAttribute('cx'))
    orch.run(() => render(container, SCENE_2, {}, true), { duration: 1500 })
    const japan = container.querySelector('[data-key="Japan"]')!
    await wait(150)
    const mid = Number(france.getAttribute('cx'))
    const opacity = Number(japan.getAttribute('opacity'))
    const japanShownMid = japan.isConnected
    await wait(1700)
    const end = Number(france.getAttribute('cx'))
    expect(container.querySelector('[data-key="France"]')).toBe(france)
    expect(mid).toBeGreaterThan(Math.min(start, end))
    expect(mid).toBeLessThan(Math.max(start, end))
    expect(japanShownMid).toBe(true)
    expect(japan.isConnected).toBe(false)
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(1)
  })
})
