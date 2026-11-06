import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { parseData } from '../../parse-data'
import { ScaleType, SortMode } from '../../../enums'
import { render } from './dot-plot'

const RANGE = parseData('series = "Poll","High","Low"\n"CDU/CSU" = 29,32,27\n"Greens" = 22,25,20\n"SPD" = 14,16,12')
const DUMBBELL = parseData('series = "2015","2024"\n"a" = 10,30\n"b" = 50,40\n"c" = 20,60')
const all = (c: HTMLElement, s: string) => Array.from(c.querySelectorAll<SVGElement>(s))

describe('dot plot chart', () => {
  let container: HTMLElement

  beforeAll(() => {
    ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
  })

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('draws one dot and one range bar per row in range mode', () => {
    render(container, RANGE, {})
    expect(all(container, '.bc-dot')).toHaveLength(3)
    expect(all(container, '.bc-dot-range')).toHaveLength(3)
    expect(all(container, '.bc-dot-line')).toHaveLength(0)
  })

  it('draws a colored dot per column and one line per row in dumbbell mode', () => {
    render(container, DUMBBELL, { colors: ['#f00', '#00f'] })
    expect(all(container, '.bc-dot')).toHaveLength(6)
    expect(all(container, '.bc-dot-line')).toHaveLength(3)
    expect(container.querySelector('.bc-dot[data-key="a|2024"]')!.getAttribute('fill')).toBe('#00f')
    expect(container.querySelector('.bc-legend')!.textContent).toContain('2015')
  })

  it('draws a lone dot per row and no legend in single mode', () => {
    render(container, parseData('"a" = 1\n"b" = 2'), {})
    expect(all(container, '.bc-dot')).toHaveLength(2)
    expect(container.querySelector('.bc-legend')).toBeNull()
  })

  it('puts the largest first value on top by default', () => {
    render(container, DUMBBELL, {})
    const cy = (row: string) => Number(container.querySelector(`.bc-dot[data-key="${row}|2015"]`)!.getAttribute('cy'))
    expect(cy('b')).toBeLessThan(cy('c'))
    expect(cy('c')).toBeLessThan(cy('a'))
  })

  it('orders rows by gap with sortMode gap', () => {
    render(container, DUMBBELL, { sortMode: SortMode.Gap })
    const cy = (row: string) => Number(container.querySelector(`.bc-dot[data-key="${row}|2015"]`)!.getAttribute('cy'))
    expect(cy('c')).toBeLessThan(cy('a'))
    expect(cy('a')).toBeLessThan(cy('b'))
  })

  it('spans the range bar from low to high', () => {
    render(container, RANGE, {})
    const bar = container.querySelector('.bc-dot-range[data-key="SPD"]')!
    const dot = container.querySelector('.bc-dot[data-key="SPD|Poll"]')!
    const x = Number(bar.getAttribute('x'))
    expect(x).toBeLessThan(Number(dot.getAttribute('cx')))
    expect(x + Number(bar.getAttribute('width'))).toBeGreaterThan(Number(dot.getAttribute('cx')))
  })

  it('never writes NaN geometry on a log axis with a non-positive row', () => {
    render(container, parseData('series = "Poll","High","Low"\n"a" = 14,16,0\n"b" = 5,6,4'), { horizontalAxis: { scaleType: ScaleType.Log } })
    expect(container.innerHTML).not.toContain('NaN')
    expect(all(container, '.bc-dot')).toHaveLength(1)
  })
})
