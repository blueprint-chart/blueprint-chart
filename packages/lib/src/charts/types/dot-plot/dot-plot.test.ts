import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { parseData } from '../../parse-data'
import { DotStyle, ScaleType, SortMode } from '../../../enums'
import { HIGHLIGHT_DIM_OPACITY } from '../../plugins/highlight'
import { render } from './dot-plot'

const RANGE = parseData('series = "Poll","High","Low"\n"CDU/CSU" = 29,32,27\n"Greens" = 22,25,20\n"SPD" = 14,16,12')
const RANGE_STYLE = { dotStyle: DotStyle.Range }
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
    render(container, RANGE, RANGE_STYLE)
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
    render(container, RANGE, RANGE_STYLE)
    const bar = container.querySelector('.bc-dot-range[data-key="SPD"]')!
    const dot = container.querySelector('.bc-dot[data-key="SPD|Poll"]')!
    const x = Number(bar.getAttribute('x'))
    expect(x).toBeLessThan(Number(dot.getAttribute('cx')))
    expect(x + Number(bar.getAttribute('width'))).toBeGreaterThan(Number(dot.getAttribute('cx')))
  })

  it('never writes NaN geometry on a log axis with a non-positive row', () => {
    render(container, parseData('series = "Poll","High","Low"\n"a" = 14,16,0\n"b" = 5,6,4'), { ...RANGE_STYLE, horizontalAxis: { scaleType: ScaleType.Log } })
    expect(container.innerHTML).not.toContain('NaN')
    expect(all(container, '.bc-dot')).toHaveLength(1)
  })

  const head = (c: HTMLElement, row: string) => c.querySelector(`.bc-dot-line[data-key="${row}"]`)!.getAttribute('d')!.split('M')[2].match(/-?[\d.]+/g)!.map(Number)
  const collapsed = (h: number[]) => h[0] === h[2] && h[1] === h[3] && h[4] === h[2] && h[5] === h[3]

  it('keeps the arrowhead collapsed when arrows is off', () => {
    render(container, DUMBBELL, {})
    expect(collapsed(head(container, 'a'))).toBe(true)
  })

  it('opens the arrowhead when arrows is on', () => {
    render(container, DUMBBELL, { arrows: true })
    const h = head(container, 'a')
    expect(collapsed(h)).toBe(false)
    expect(h[1]).not.toBe(h[5])
  })

  it('points the arrow from the first column to the last, even when it decreases', () => {
    render(container, DUMBBELL, { arrows: true })
    const h = head(container, 'b')
    expect(h[0]).toBeGreaterThan(h[2])
  })

  it('keeps the arrowhead collapsed when first and last values are equal', () => {
    render(container, parseData('series = "2015","2024"\n"a" = 10,10\n"b" = 1,2'), { arrows: true })
    expect(collapsed(head(container, 'a'))).toBe(true)
    expect(container.querySelector('.bc-dot-line[data-key="a"]')!.getAttribute('d')).not.toContain('NaN')
  })

  it('ignores arrows in range mode', () => {
    render(container, RANGE, { ...RANGE_STYLE, arrows: true })
    expect(container.querySelector('.bc-dot-line')).toBeNull()
  })

  it('labels the lowest and highest dot of a dumbbell row', () => {
    render(container, DUMBBELL, { valueLabels: true })
    expect(all(container, '.bc-dot-label[data-key^="a|"]').map(l => l.textContent)).toEqual(['10', '30'])
  })

  it('labels a range row once, past the high end', () => {
    render(container, RANGE, { ...RANGE_STYLE, valueLabels: true })
    const label = container.querySelector('.bc-dot-label[data-key="SPD|range"]')!
    const bar = container.querySelector('.bc-dot-range[data-key="SPD"]')!
    expect(label.textContent).toBe('14')
    expect(Number(label.getAttribute('x'))).toBeGreaterThan(Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')))
  })

  it('dims every mark of rows that are not highlighted', () => {
    render(container, DUMBBELL, { highlights: [{ target: 'a' }], valueLabels: true })
    const opacity = (s: string) => container.querySelector(s)!.getAttribute('opacity')
    expect(opacity('.bc-dot[data-key="a|2015"]')).toBe('1')
    expect(opacity('.bc-dot[data-key="b|2015"]')).toBe(String(HIGHLIGHT_DIM_OPACITY))
    expect(opacity('.bc-dot-line[data-key="b"]')).toBe(String(HIGHLIGHT_DIM_OPACITY))
    expect(opacity('.bc-dot-label[data-key="b|2015"]')).toBe(String(HIGHLIGHT_DIM_OPACITY))
  })

  it('dims range bars of rows that are not highlighted', () => {
    render(container, RANGE, { ...RANGE_STYLE, highlights: [{ target: 'SPD' }] })
    expect(container.querySelector('.bc-dot-range[data-key="Greens"]')!.getAttribute('opacity')).toBe(String(HIGHLIGHT_DIM_OPACITY))
  })

  it('dims nothing when the highlight names no row', () => {
    render(container, DUMBBELL, { highlights: [{ target: 'Nope' }] })
    expect(all(container, '[opacity]').filter(el => el.getAttribute('opacity') === String(HIGHLIGHT_DIM_OPACITY))).toEqual([])
  })

  it('colors a colorized row', () => {
    render(container, RANGE, { ...RANGE_STYLE, colorizes: [{ target: 'SPD', color: '#123456' }] })
    expect(container.querySelector('.bc-dot[data-key="SPD|Poll"]')!.getAttribute('fill')).toBe('#123456')
  })

  it('spans the range bar over swapped bounds', () => {
    render(container, parseData('series = "Poll","High","Low"\n"a" = 14,12,16\n"b" = 5,4,6'), RANGE_STYLE)
    const bar = container.querySelector('.bc-dot-range[data-key="a"]')!
    const cx = Number(container.querySelector('.bc-dot[data-key="a|Poll"]')!.getAttribute('cx'))
    const x = Number(bar.getAttribute('x'))
    expect(Number(bar.getAttribute('width'))).toBeGreaterThan(0)
    expect(x).toBeLessThan(cx)
    expect(x + Number(bar.getAttribute('width'))).toBeGreaterThan(cx)
  })
})
