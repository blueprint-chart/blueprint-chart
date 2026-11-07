import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { parseData } from '../../parse-data'
import { AnnotationKind, ArrowDirection, CompassDirection, DotStyle, Orientation, ScaleType, SortMode } from '../../../enums'
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

  it('puts the largest last value on top by default', () => {
    render(container, DUMBBELL, {})
    const cy = (row: string) => Number(container.querySelector(`.bc-dot[data-key="${row}|2015"]`)!.getAttribute('cy'))
    expect(cy('c')).toBeLessThan(cy('b'))
    expect(cy('b')).toBeLessThan(cy('a'))
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

  const heads = (c: HTMLElement, row: string) => c.querySelector(`.bc-dot-line[data-key="${row}"]`)!.getAttribute('d')!.split('M').slice(2).map(h => h.match(/-?[\d.]+/g)!.map(Number))
  const head = (c: HTMLElement, row: string) => heads(c, row)[0]
  const tail = (c: HTMLElement, row: string) => heads(c, row)[1]
  const collapsed = (h: number[]) => h[0] === h[2] && h[1] === h[3] && h[4] === h[2] && h[5] === h[3]
  const dotX = (c: HTMLElement, key: string) => Number(c.querySelector(`.bc-dot[data-key="${key}"]`)!.getAttribute('cx'))

  it('keeps both arrowheads collapsed by default', () => {
    render(container, DUMBBELL, {})
    expect(collapsed(head(container, 'a'))).toBe(true)
    expect(collapsed(tail(container, 'a'))).toBe(true)
  })

  it('keeps both arrowheads collapsed with none', () => {
    render(container, DUMBBELL, { arrows: ArrowDirection.None })
    expect(collapsed(head(container, 'a'))).toBe(true)
    expect(collapsed(tail(container, 'a'))).toBe(true)
  })

  it('opens only the head at the last column going forward', () => {
    render(container, DUMBBELL, { arrows: ArrowDirection.Forward })
    const h = head(container, 'a')
    expect(collapsed(h)).toBe(false)
    expect(h[1]).not.toBe(h[5])
    expect(collapsed(tail(container, 'a'))).toBe(true)
  })

  it('points the arrow from the first column to the last, even when it decreases', () => {
    render(container, DUMBBELL, { arrows: ArrowDirection.Forward })
    const h = head(container, 'b')
    expect(h[0]).toBeGreaterThan(h[2])
  })

  it('points the arrow back at the first column going backward', () => {
    render(container, DUMBBELL, { arrows: ArrowDirection.Backward })
    expect(collapsed(head(container, 'a'))).toBe(true)
    const t = tail(container, 'a')
    expect(collapsed(t)).toBe(false)
    expect(Math.abs(t[2] - dotX(container, 'a|2015'))).toBeLessThan(Math.abs(t[2] - dotX(container, 'a|2024')))
  })

  it('opens both arrowheads with both', () => {
    render(container, DUMBBELL, { arrows: ArrowDirection.Both })
    expect(collapsed(head(container, 'a'))).toBe(false)
    expect(collapsed(tail(container, 'a'))).toBe(false)
  })

  it('keeps the arrowheads collapsed when first and last values are equal', () => {
    render(container, parseData('series = "2015","2024"\n"a" = 10,10\n"b" = 1,2'), { arrows: ArrowDirection.Both })
    expect(collapsed(head(container, 'a'))).toBe(true)
    expect(collapsed(tail(container, 'a'))).toBe(true)
    expect(container.querySelector('.bc-dot-line[data-key="a"]')!.getAttribute('d')).not.toContain('NaN')
  })

  it('puts the forward arrowhead at the line end when the last column is in the middle', () => {
    render(container, parseData('series = "2000","2010","2022"\n"a" = 10,30,20\n"b" = 0,40,5'), { arrows: ArrowDirection.Forward })
    expect(head(container, 'a')[2]).toBeGreaterThan(dotX(container, 'a|2022'))
  })

  it('ignores arrows in range mode', () => {
    render(container, RANGE, { ...RANGE_STYLE, arrows: ArrowDirection.Both })
    expect(container.querySelector('.bc-dot-line')).toBeNull()
  })

  it('labels the lowest and highest dot of a dumbbell row', () => {
    render(container, DUMBBELL, { valueLabels: true })
    expect(all(container, '.bc-dot-label[data-key^="a|"]').map(l => l.textContent)).toEqual(['10', '30'])
  })

  it('labels only the first column dot with dotLabels start', () => {
    render(container, DUMBBELL, { valueLabels: true, dotLabels: 'start' })
    expect(all(container, '.bc-dot-label[data-key^="b|"]').map(l => l.textContent)).toEqual(['50'])
  })

  it('labels only the last column dot with dotLabels end', () => {
    render(container, DUMBBELL, { valueLabels: true, dotLabels: 'end' })
    expect(all(container, '.bc-dot-label[data-key^="b|"]').map(l => l.textContent)).toEqual(['40'])
  })

  it('labels the difference past the rightmost dot with dotLabels difference', () => {
    render(container, DUMBBELL, { valueLabels: true, dotLabels: 'difference', horizontalAxis: { numberFormat: '$,.0f' } })
    const texts = (row: string) => all(container, `.bc-dot-label[data-key^="${row}|"]`).map(l => l.textContent)
    expect(texts('a')).toEqual(['+$20'])
    expect(texts('b')).toEqual(['−$10'])
    const label = container.querySelector('.bc-dot-label[data-key^="b|"]')!
    expect(Number(label.getAttribute('x'))).toBeGreaterThan(dotX(container, 'b|2015'))
  })

  it('labels the percent change with dotLabels change', () => {
    render(container, DUMBBELL, { valueLabels: true, dotLabels: 'change' })
    expect(all(container, '.bc-dot-label').map(l => l.textContent)).toEqual(['+200%', '−20%', '+200%'])
  })

  it('rounds floating-point noise out of the difference label', () => {
    render(container, parseData('series = "2015","2024"\n"a" = 1.1,1.3'), { valueLabels: true, dotLabels: 'difference' })
    expect(container.querySelector('.bc-dot-label')!.textContent).toBe('+0.2')
  })

  it('skips the percent change label when the first value is 0', () => {
    render(container, parseData('series = "2015","2024"\n"a" = 0,50\n"b" = 10,20'), { valueLabels: true, dotLabels: 'change' })
    expect(all(container, '.bc-dot-label').map(l => l.textContent)).toEqual(['+100%'])
  })

  it('labels a range row once, past the high end', () => {
    render(container, RANGE, { ...RANGE_STYLE, valueLabels: true })
    const label = container.querySelector('.bc-dot-label[data-key="SPD|range"]')!
    const bar = container.querySelector('.bc-dot-range[data-key="SPD"]')!
    expect(label.textContent).toBe('14')
    expect(Number(label.getAttribute('x'))).toBeGreaterThan(Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')))
  })

  it('reserves room inside the plot for value labels at both ends', () => {
    const extent = () => all(container, '.bc-dot').map(d => Number(d.getAttribute('cx')))
    render(container, DUMBBELL, {})
    const bare = extent()
    container.replaceChildren()
    render(container, DUMBBELL, { valueLabels: true })
    const labelled = extent()
    expect(Math.min(...labelled)).toBeGreaterThan(Math.min(...bare))
    expect(Math.max(...labelled)).toBeLessThan(Math.max(...bare))
  })

  it('reserves room only on the right for range labels', () => {
    const extent = () => all(container, '.bc-dot-range').map(d => Number(d.getAttribute('x')))
    render(container, RANGE, RANGE_STYLE)
    const bare = Math.min(...extent())
    container.replaceChildren()
    render(container, RANGE, { ...RANGE_STYLE, valueLabels: true })
    expect(Math.min(...extent())).toBe(bare)
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

  describe('annotations', () => {
    const dot = (row: string, col: string) => container.querySelector(`.bc-dot[data-key="${row}|${col}"]`)!
    const circle = () => container.querySelector('.bc-annotation-circle')!
    const pt = (target: string) => ({ kind: AnnotationKind.Point as const, target, text: target, showCircle: true, anchorDirection: CompassDirection.N })

    it('anchors a point on the rightmost dot of a dumbbell row', () => {
      render(container, DUMBBELL, { annotations: [pt('a')] })
      expect(Number(circle().getAttribute('cx'))).toBeCloseTo(Number(dot('a', '2024').getAttribute('cx')))
      expect(Number(circle().getAttribute('cy'))).toBeCloseTo(Number(dot('a', '2024').getAttribute('cy')) - 2)
    })

    it('anchors on the first column when its value is the larger one', () => {
      render(container, DUMBBELL, { annotations: [pt('b')] })
      expect(Number(circle().getAttribute('cx'))).toBeCloseTo(Number(dot('b', '2015').getAttribute('cx')))
    })

    it('anchors on the value dot in range style, not the bar end', () => {
      render(container, RANGE, { ...RANGE_STYLE, annotations: [pt('SPD')] })
      expect(Number(circle().getAttribute('cx'))).toBeCloseTo(Number(dot('SPD', 'Poll').getAttribute('cx')))
    })

    it('follows the dots when category labels sit on their own line', () => {
      render(container, DUMBBELL, { categoryLabelLine: true, annotations: [pt('c')] })
      expect(Number(circle().getAttribute('cy'))).toBeCloseTo(Number(dot('c', '2024').getAttribute('cy')) - 2)
    })

    it('draws a row range from the top dot line to the bottom one', () => {
      render(container, DUMBBELL, { annotations: [{ kind: AnnotationKind.Range, start: 'b', end: 'a' }] })
      const rect = container.querySelector('.bc-annotation-range')!
      expect(Number(rect.getAttribute('y'))).toBeCloseTo(Number(dot('b', '2015').getAttribute('cy')))
    })

    it('draws a value range across the plot height', () => {
      render(container, DUMBBELL, { annotations: [{ kind: AnnotationKind.Range, orientation: Orientation.Horizontal, start: 20, end: 40 }] })
      const rect = container.querySelector('.bc-annotation-range')!
      expect(Number(rect.getAttribute('x'))).toBeCloseTo(Number(dot('c', '2015').getAttribute('cx')))
      expect(Number(rect.getAttribute('y'))).toBe(0)
    })

    it('writes no NaN for a value range from 0 on a log axis', () => {
      render(container, DUMBBELL, { horizontalAxis: { scaleType: ScaleType.Log }, annotations: [{ kind: AnnotationKind.Range, orientation: Orientation.Horizontal, start: 0, end: 40 }] })
      expect(container.querySelector('.bc-annotations-range')!.innerHTML).not.toContain('NaN')
    })

    it('places a free annotation by plot percentage', () => {
      render(container, DUMBBELL, { annotations: [{ kind: AnnotationKind.Free, x: '50%', y: '50%', text: 'note' }] })
      expect(container.querySelector('.bc-annotation-text')).not.toBeNull()
    })

    it('skips a point on a row the log axis dropped', () => {
      const data = parseData('"a" = 0\n"b" = 10')
      expect(() => render(container, data, { horizontalAxis: { scaleType: ScaleType.Log }, annotations: [pt('a')] })).not.toThrow()
      expect(container.querySelector('.bc-annotations')).not.toBeNull()
      expect(container.querySelector('.bc-annotations [data-annotation-index]')).toBeNull()
    })
  })
})
