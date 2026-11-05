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
    await wait(500)
    expect(points(container).map(c => c.dataset.key).sort()).toEqual(['Chad', 'France', 'Peru'])
    expect(points(container).map(c => c.getAttribute('opacity'))).toEqual(['1', '1', '1'])
  })
})
