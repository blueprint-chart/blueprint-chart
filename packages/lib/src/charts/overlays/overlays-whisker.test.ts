import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseData } from '../parse-data'
import type { OverlayConfig } from '../types'
import { render as renderBarVertical } from '../types/bar-vertical/bar-vertical'
import { render as renderBarHorizontal } from '../types/bar-horizontal/bar-horizontal'
import { render as renderBarGrouped } from '../types/bar-grouped/bar-grouped'
import { render as renderColumnStacked } from '../types/column-stacked/column-stacked'

const RAW = 'series = "Value","Low","High"\n"A" = 10,0,10\n"B" = 6,0,6'
const GROUPED_RAW = 'series = "Value","Other","Low","High"\n"A" = 10,4,0,10\n"B" = 6,3,0,6'
const overlays: OverlayConfig[] = [{ columns: ['Low', 'High'], pattern: 'whisker' }]

type Render = (container: HTMLElement, data: ReturnType<typeof parseData>, options: Record<string, unknown>) => void

let container: HTMLElement

beforeEach(() => {
  vi.useFakeTimers()
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  vi.useRealTimers()
  container.remove()
})

function points(el: Element): number[] {
  return el.getAttribute('d')!.match(/-?[\d.]+/g)!.map(Number)
}

function whiskerFor(label: string): Element {
  return container.querySelector(`.bc-overlay-whisker[data-bc-key$="|${label}"]`)!
}

function valueBar(): Element {
  return container.querySelector('.bc-bar[data-series="Value"]') ?? container.querySelector('.bc-bar')!
}

function attr(el: Element, name: string): number {
  return Number(el.getAttribute(name))
}

function expectVerticalWhisker(): void {
  const bar = valueBar()
  const [left, , right, , cx, top, , bottom] = points(whiskerFor('A'))
  const width = attr(bar, 'width')
  const cap = Math.min(width * 0.4, 12)
  expect(cx).toBeCloseTo(attr(bar, 'x') + width / 2)
  expect(right - left).toBeCloseTo(cap)
  expect(top).toBeCloseTo(attr(bar, 'y'))
  expect(bottom).toBeCloseTo(attr(bar, 'y') + attr(bar, 'height'))
}

function expectHorizontalWhisker(): void {
  const bar = valueBar()
  const [, upper, , lower, high, cy, low] = points(whiskerFor('A'))
  const height = attr(bar, 'height')
  const cap = Math.min(height * 0.4, 12)
  expect(cy).toBeCloseTo(attr(bar, 'y') + height / 2)
  expect(lower - upper).toBeCloseTo(cap)
  expect(low).toBeCloseTo(attr(bar, 'x'))
  expect(high).toBeCloseTo(attr(bar, 'x') + attr(bar, 'width'))
}

describe.each([
  { name: 'bar-vertical', render: renderBarVertical as Render, expectWhisker: expectVerticalWhisker },
  { name: 'bar-horizontal', render: renderBarHorizontal as Render, expectWhisker: expectHorizontalWhisker },
])('whisker overlay on $name', ({ render, expectWhisker }) => {
  const data = parseData(RAW)

  it('draws one whisker per row, centered on the bar, from low to high', () => {
    render(container, data, { overlays })
    expect(container.querySelectorAll('g.bc-overlays-whiskers path.bc-overlay.bc-overlay-whisker')).toHaveLength(2)
    expectWhisker()
  })

  it('strokes the whisker in the text color at full opacity, with no fill', () => {
    render(container, data, { overlays })
    const whisker = whiskerFor('A')
    expect(whisker.getAttribute('stroke')).toBe('currentColor')
    expect(whisker.getAttribute('stroke-width')).toBe('2')
    expect(whisker.getAttribute('stroke-opacity')).toBe('1')
    expect(whisker.getAttribute('fill')).toBe('none')
  })

  it('never masks the bars', () => {
    render(container, data, { overlays })
    expect(container.querySelector('.bc-bar[mask]')).toBeNull()
    expect(container.querySelector('mask')).toBeNull()
  })

  it('draws no whisker on a row with an empty cell', () => {
    const gap = parseData('series = "Value","Low","High"\n"A" = 10,0,10\n"B" = 6,,6')
    render(container, gap, { overlays })
    expect(container.querySelectorAll('.bc-overlay-whisker')).toHaveLength(1)
  })

  it('applies color and opacity to the stroke', () => {
    render(container, data, { overlays: [{ ...overlays[0], color: '#f00', opacity: 40 }] })
    const whisker = whiskerFor('A')
    expect(whisker.getAttribute('stroke')).toBe('#f00')
    expect(whisker.getAttribute('stroke-opacity')).toBe('0.4')
  })

  it('draws a small whisker as the legend key', () => {
    const titled = [{ ...overlays[0], title: 'Range', color: '#f00' }]
    render(container, data, { overlays: titled, legend: true, directLabelling: false })
    const item = container.querySelector('.bc-legend-item[data-series="Range"]')!
    const key = item.querySelector('path.bc-overlay-key-whisker')!
    expect(key.getAttribute('stroke')).toBe('#f00')
    expect(item.querySelector('rect')!.getAttribute('fill')).toBe('none')
  })
})

describe('whisker overlay on bar-grouped', () => {
  it('sits on the slot of its target bar', () => {
    const groupedOverlays = [{ ...overlays[0], bar: 'Value' }]
    renderBarGrouped(container, parseData(GROUPED_RAW), { overlays: groupedOverlays })
    expectHorizontalWhisker()
  })
})

describe('whisker overlay on column-stacked', () => {
  it('draws one whisker per column, centered on the stack', () => {
    renderColumnStacked(container, parseData(RAW), { overlays })
    expectVerticalWhisker()
  })
})
