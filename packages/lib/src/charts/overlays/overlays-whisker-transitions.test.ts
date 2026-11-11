import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getSceneTransition } from '../../transitions'
import { SortDirection } from '../../enums'
import { parseData } from '../parse-data'
import type { OverlayConfig } from '../types'
import { render } from '../types/bar-vertical/bar-vertical'

// Kept apart from overlays-whisker.test.ts: its fake timers freeze d3-timer, so tweens never tick.
const LOW_HIGH = 'series = "Value","Low","High"\n"A" = 10,0,10\n"B" = 30,0,30\n"C" = 20,0,20'
const HIGHER = 'series = "Value","Low","High"\n"A" = 10,0,20\n"B" = 30,0,30\n"C" = 20,0,20'
const whisker: OverlayConfig[] = [{ columns: ['Low', 'High'], pattern: 'whisker' }]
const solid: OverlayConfig[] = [{ columns: ['Low', 'High'] }]
const stripes: OverlayConfig[] = [{ columns: ['Low', 'High'], pattern: 'stripes' }]
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

let container: HTMLElement

function points(el: Element): number[] {
  return el.getAttribute('d')!.match(/-?[\d.]+/g)!.map(Number)
}

function whiskerFor(label: string): Element | null {
  return container.querySelector(`.bc-overlay-whisker[data-bc-key$="|${label}"]`)
}

function opacity(el: Element | null): number {
  return Number(el!.getAttribute('opacity'))
}

function scene(raw: string, options: Record<string, unknown>): void {
  getSceneTransition(container).run(() => render(container, parseData(raw), options, true), { duration: 1500 })
}

describe('whisker overlays across scenes', () => {
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

  afterEach(() => {
    container.remove()
  })

  it('tweens the same whisker to new values', async () => {
    render(container, parseData(LOW_HIGH), { overlays: whisker })
    const before = whiskerFor('A')!
    const start = points(before)[5]
    scene(HIGHER, { overlays: whisker })
    await wait(150)
    const mid = points(whiskerFor('A')!)[5]
    await wait(1600)
    const after = whiskerFor('A')!
    const end = points(after)[5]
    expect(after).toBe(before)
    expect(mid).toBeGreaterThan(Math.min(start, end))
    expect(mid).toBeLessThan(Math.max(start, end))
  })

  it('keeps the whisker centered on its bar while a sort moves it', async () => {
    render(container, parseData(LOW_HIGH), { overlays: whisker })
    scene(LOW_HIGH, { overlays: whisker, sort: SortDirection.Descending })
    await wait(300)
    const bar = container.querySelector('.bc-bar[data-bc-key="A"]')!
    const center = Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')) / 2
    const stem = points(whiskerFor('A')!)[4]
    expect(stem).toBeCloseTo(center, 0)
  })

  it('fades a whisker in when the overlay appears and out when it is hidden', async () => {
    render(container, parseData(LOW_HIGH), {})
    scene(LOW_HIGH, { overlays: whisker })
    await wait(300)
    const fadingIn = opacity(whiskerFor('A'))
    await wait(1500)
    scene(LOW_HIGH, { overlays: [{ ...whisker[0], hidden: true }] })
    await wait(300)
    const fadingOut = opacity(whiskerFor('A'))
    await wait(1500)
    expect(fadingIn).toBeGreaterThan(0)
    expect(fadingIn).toBeLessThan(1)
    expect(fadingOut).toBeGreaterThan(0)
    expect(fadingOut).toBeLessThan(1)
    expect(whiskerFor('A')).toBeNull()
  })

  it('cross-fades a band into a whisker without morphing', async () => {
    render(container, parseData(LOW_HIGH), { overlays: solid })
    scene(LOW_HIGH, { overlays: whisker })
    await wait(300)
    const band = container.querySelector('.bc-overlay-range')
    const midBand = opacity(band)
    const midWhisker = opacity(whiskerFor('A'))
    const midPath = points(whiskerFor('A')!)
    await wait(1500)
    expect(midBand).toBeGreaterThan(0)
    expect(midBand).toBeLessThan(1)
    expect(midWhisker).toBeGreaterThan(0)
    expect(midWhisker).toBeLessThan(1)
    const endPath = points(whiskerFor('A')!)
    midPath.forEach((value, index) => expect(value).toBeCloseTo(endPath[index], 2))
    expect(container.querySelector('.bc-overlay-range')).toBeNull()
  })

  it('cross-fades a whisker back into a band', async () => {
    render(container, parseData(LOW_HIGH), { overlays: whisker })
    scene(LOW_HIGH, { overlays: solid })
    await wait(300)
    const midBand = opacity(container.querySelector('.bc-overlay-range'))
    const midWhisker = opacity(whiskerFor('A'))
    await wait(1500)
    expect(midBand).toBeGreaterThan(0)
    expect(midBand).toBeLessThan(1)
    expect(midWhisker).toBeGreaterThan(0)
    expect(midWhisker).toBeLessThan(1)
    expect(whiskerFor('A')).toBeNull()
  })

  it.each([
    { pattern: 'whisker', overlays: whisker },
    { pattern: 'solid', overlays: solid },
  ])('fades the stripe holes out going from stripes to $pattern', async ({ overlays }) => {
    render(container, parseData(LOW_HIGH), { overlays: stripes })
    scene(LOW_HIGH, { overlays })
    await wait(300)
    const hole = container.querySelector('.bc-overlay-mask-range')
    const bar = container.querySelector('.bc-bar')!
    const midHole = hole ? opacity(hole) : null
    const midMaskId = bar.getAttribute('mask')?.slice(5, -1)
    const midMask = container.querySelector(`mask[id="${midMaskId}"]`)
    await wait(1500)
    expect(midHole).toBeGreaterThan(0)
    expect(midHole).toBeLessThan(1)
    expect(midMask).not.toBeNull()
    expect(container.querySelector('.bc-overlay-mask-range')).toBeNull()
  })

  it('drops the bar mask once the faded stripe holes are gone', async () => {
    render(container, parseData(LOW_HIGH), { overlays: stripes })
    scene(LOW_HIGH, { overlays: whisker })
    await wait(1800)
    scene(LOW_HIGH, { overlays: whisker })
    await wait(1800)
    const masked = container.querySelectorAll('.bc-bar[mask]')
    expect(masked).toHaveLength(0)
  })
})
