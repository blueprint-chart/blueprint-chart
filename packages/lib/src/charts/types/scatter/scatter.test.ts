import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { parseData } from '../../parse-data'
import { AnnotationKind, LegendPosition, ScaleType } from '../../../enums'
import { HIGHLIGHT_DIM_OPACITY } from '../../plugins/highlight'
import { getCachedChart } from '../../transition-cache'
import * as d3 from 'd3'
import { render, DOT_RADIUS, DEFAULT_COLOR, maxBubbleRadius } from './scatter'
import { scatterKeyWidth, sizeLegendValues } from './legend'

const DATA = parseData([
  'series = "GDP per capita","Life expectancy","Population","Continent"',
  '"France" = 44000, 82.3, 68, "Europe"',
  '"Germany" = 50000, 81.0, 84, "Europe"',
  '"Chad" = 1500, 52.8, 18, "Africa"',
  '"Nigeria" = 5000, 53.9, 213, "Africa"',
  '"Japan" = 42000, 84.5, 125, "Asia"',
].join('\n'))
const points = (c: HTMLElement) => Array.from(c.querySelectorAll<SVGCircleElement>('.bc-scatter-point'))

describe('scatter chart', () => {
  let container: HTMLElement

  beforeAll(() => {
    // jsdom does not implement SVGElement.getBBox; the annotation plugin calls it.
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

  it('draws one circle per valid point, keyed by name', () => {
    render(container, DATA, {})
    expect(points(container).map(c => c.dataset.key).sort()).toEqual(['Chad', 'France', 'Germany', 'Japan', 'Nigeria'])
  })

  it('uses translucent fills with a background outline', () => {
    render(container, DATA, {})
    const c = points(container)[0]
    expect(c.getAttribute('fill-opacity')).toBe('0.7')
    expect(c.getAttribute('stroke-width')).toBe('1')
  })

  it('uses uniform dots without a size column', () => {
    render(container, DATA, { size: 'none' })
    expect(new Set(points(container).map(c => c.getAttribute('r')))).toEqual(new Set(['4.5']))
  })

  it('insets the plot by the dot radius when the size column yields no values', () => {
    render(container, parseData('series = "x","y"\n"a" = 0, 0\n"b" = 10, 10'), { size: 'missing' })
    expect(container.querySelector('[data-key="a"]')!.getAttribute('cx')).toBe(String(DOT_RADIUS + 1))
  })

  it('encodes size as area and draws the largest first', () => {
    render(container, DATA, {})
    const radii = points(container).map(c => Number(c.getAttribute('r')))
    expect(radii).toEqual([...radii].sort((a, b) => b - a))
    const r = (k: string) => Number(container.querySelector(`[data-key="${k}"]`)!.getAttribute('r'))
    expect(r('Nigeria') / r('Chad')).toBeCloseTo(Math.sqrt(213 / 18))
  })

  it('places 5000 halfway between 500 and 50000 on a log10 x-axis', () => {
    const d = parseData('series = "x","y"\n"a" = 500, 1\n"b" = 5000, 2\n"c" = 50000, 3')
    render(container, d, { horizontalAxis: { scaleType: ScaleType.Log } })
    const cx = (k: string) => Number(container.querySelector(`[data-key="${k}"]`)!.getAttribute('cx'))
    expect(cx('b')).toBeCloseTo((cx('a') + cx('c')) / 2)
  })

  it('ignores a string range min of 0 on a log x-axis', () => {
    const d = parseData('series = "x","y"\n"a" = 10, 1\n"b" = 100, 2\n"c" = 1000, 3')
    const cxs = (range?: { min: string }) => {
      const c = document.createElement('div')
      render(c, d, { horizontalAxis: { scaleType: ScaleType.Log, range } })
      return ['a', 'b', 'c'].map(k => Number(c.querySelector(`[data-key="${k}"]`)!.getAttribute('cx')))
    }
    expect(cxs({ min: '0' })).toEqual(cxs())
  })

  it('does not force zero onto the y-axis', () => {
    render(container, DATA, {})
    const ticks = Array.from(container.querySelectorAll('.bc-axis-vertical .tick text')).map(t => t.textContent)
    expect(ticks.length).toBeGreaterThan(0)
    expect(ticks).not.toContain('0')
  })

  it('draws an empty plot without throwing when y cannot be mapped', () => {
    expect(() => render(container, parseData('"a" = 1\n"b" = 2'), {})).not.toThrow()
    expect(points(container)).toHaveLength(0)
  })

  it('keeps every point finite when all x values are equal', () => {
    render(container, parseData('series = "x","y"\n"a" = 5, 1\n"b" = 5, 2\n"c" = 5, 3'), {})
    expect(points(container).every(c => Number.isFinite(Number(c.getAttribute('cx'))))).toBe(true)
  })
  const swatch = (group: string) => container.querySelector(`.bc-legend-item[data-series="${group}"] rect`)!
  const legendLabels = () => Array.from(container.querySelectorAll('.bc-legend text')).map(t => t.textContent)

  it('tags each point with its group so a legend hover dims the other groups', () => {
    render(container, DATA, {})
    const groups = Object.fromEntries(points(container).map(c => [c.dataset.key, c.getAttribute('data-series')]))
    expect(groups).toEqual({ France: 'Europe', Germany: 'Europe', Chad: 'Africa', Nigeria: 'Africa', Japan: 'Asia' })
  })

  it('lists groups in the legend in first-appearance order', () => {
    render(container, DATA, {})
    expect(legendLabels()).toEqual(['Europe', 'Africa', 'Asia'])
  })

  it('shows no group legend without a group column', () => {
    render(container, DATA, { group: 'none' })
    expect(container.querySelector('.bc-legend')).toBeNull()
  })

  it('draws a size legend titled with the size column', () => {
    render(container, DATA, {})
    expect(container.querySelector('.bc-size-legend')!.textContent).toContain('Population')
  })

  it('hides the size legend without a size column', () => {
    render(container, DATA, { size: 'none' })
    expect(container.querySelector('.bc-size-legend')).toBeNull()
  })

  it('colors an ungrouped point with the default color and no legend entry', () => {
    const d = parseData('series = "x","y","g"\n"a" = 1, 1, "G"\n"b" = 2, 2, ""')
    render(container, d, {})
    expect(container.querySelector('[data-key="b"]')!.getAttribute('fill')).toBe(DEFAULT_COLOR)
    expect(legendLabels()).toEqual(['G'])
  })
  const cached = () => getCachedChart(container) as Required<NonNullable<ReturnType<typeof getCachedChart>>>
  const translate = (el: Element) => {
    const [x, y] = /translate\(([^,)]+),?([^)]*)\)/.exec(el.getAttribute('transform')!)!.slice(1).map(Number)
    return { x, y }
  }

  it('moves the group legend to the right margin', () => {
    render(container, DATA, { legendPosition: LegendPosition.Right, size: 'none' })
    const { plotRect, margin } = cached()
    expect(translate(container.querySelector('.bc-legend')!).x).toBeGreaterThanOrEqual(plotRect.width)
    expect(margin.right).toBeGreaterThan(20)
  })

  it('moves the group legend below the plot', () => {
    render(container, DATA, { legendPosition: LegendPosition.Bottom, size: 'none' })
    const { plotRect } = cached()
    expect(translate(container.querySelector('.bc-legend')!).y).toBeGreaterThanOrEqual(plotRect.height)
  })

  it('draws the size key outside the plot rect', () => {
    render(container, DATA, {})
    const { plotRect, margin } = cached()
    const key = container.querySelector('.bc-scatter-key')!
    expect(translate(key).x).toBeGreaterThanOrEqual(plotRect.width)
    expect(margin.right).toBeGreaterThan(translate(key).x - plotRect.width)
  })

  it('ends the size key at the right edge, a small gap from the plot', () => {
    render(container, DATA, {})
    const { plotRect, margin } = cached()
    const key = container.querySelector('.bc-scatter-key')!
    const radius = d3.scaleSqrt().domain([0, 213]).range([0, maxBubbleRadius(plotRect.width, plotRect.height)])
    const keyWidth = scatterKeyWidth({ sizeLabel: 'Population', sizeValues: sizeLegendValues(213), radius, trend: false })
    expect(translate(key).x - plotRect.width).toBe(16)
    expect(translate(key).x + keyWidth).toBeCloseTo(plotRect.width + margin.right, 0)
  })

  it('keeps a gap between a wrapping group legend and the plot', () => {
    const groups = ['Latin America and Caribbean', 'East Asia and Pacific', 'South Asia', 'Sub-Saharan Africa', 'Europe and Central Asia', 'Middle East and North Africa']
    const data = parseData([
      'series = "x","y","Population","Region"',
      ...groups.map((g, i) => `"P${i}" = ${i + 1}, ${i + 2}, ${(i + 1) * 100}, "${g}"`),
    ].join('\n'))
    render(container, data, {})
    const legend = container.querySelector('.bc-legend')!
    const lastRowY = Math.max(...Array.from(legend.querySelectorAll('.bc-legend-item'), item => translate(item).y))
    expect(translate(legend).y + lastRowY + 14).toBeLessThanOrEqual(-8)
  })

  it('labels no point by default', () => {
    render(container, DATA, {})
    expect(container.querySelectorAll('.bc-point-label')).toHaveLength(0)
  })

  it('labels a highlighted point and dims the rest', () => {
    render(container, DATA, { highlights: [{ target: 'Chad' }] })
    expect(Array.from(container.querySelectorAll('.bc-point-label')).map(t => t.textContent)).toEqual(['Chad'])
    expect(container.querySelector('[data-key="France"]')!.getAttribute('fill-opacity')).toBe(String(HIGHLIGHT_DIM_OPACITY))
    expect(container.querySelector('[data-key="Chad"]')!.getAttribute('fill-opacity')).toBe('0.7')
  })

  it('labels every point with showLabels', () => {
    render(container, DATA, { showLabels: true })
    expect(container.querySelectorAll('.bc-point-label').length).toBeGreaterThan(0)
  })

  it('colorizes a group', () => {
    render(container, DATA, { colorizes: [{ target: 'Africa', color: '#000000' }] })
    expect(container.querySelector('[data-key="Chad"]')!.getAttribute('fill')).toBe('#000000')
    expect(container.querySelector('[data-key="France"]')!.getAttribute('fill')).not.toBe('#000000')
    expect(swatch('Africa').getAttribute('fill')).toBe('#000000')
  })

  it('lets a point name beat a group name in colorize', () => {
    const d = parseData([
      'series = "x","y","Continent"',
      '"Chad" = 1, 1, "Africa"',
      '"Africa" = 2, 2, "Other"',
    ].join('\n'))
    render(container, d, { colorizes: [{ target: 'Africa', color: '#000000' }] })
    expect(container.querySelector('[data-key="Africa"]')!.getAttribute('fill')).toBe('#000000')
    expect(container.querySelector('[data-key="Chad"]')!.getAttribute('fill')).not.toBe('#000000')
    expect(swatch('Africa').getAttribute('fill')).not.toBe('#000000')
  })

  it('draws a vertical range annotation on the numeric x-axis', () => {
    render(container, DATA, { annotations: [{ kind: AnnotationKind.Range, start: 10000, end: 30000 }] })
    expect(container.querySelector('.bc-annotations-range rect')).not.toBeNull()
  })

  it('anchors a point annotation on its point', () => {
    render(container, DATA, { annotations: [{ kind: AnnotationKind.Point, target: 'Chad', text: 'Outlier' }] })
    expect(container.querySelector('[data-annotation-index="0"]')).not.toBeNull()
  })

  it('labels a point annotation target', () => {
    render(container, DATA, { annotations: [{ kind: AnnotationKind.Point, target: 'Chad', text: 'Outlier' }] })
    expect(Array.from(container.querySelectorAll('.bc-point-label')).map(t => t.textContent)).toEqual(['Chad'])
  })

  describe('tooltips', () => {
    afterEach(() => {
      document.querySelectorAll('.bc-tooltip').forEach(t => t.remove())
    })

    const hoverAt = (c: HTMLElement, clientX: number, clientY: number) => {
      c.querySelector('.bc-proximity-overlay')!.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }))
      return document.querySelector('.bc-tooltip')!.textContent
    }
    const hoverTooltip = (c: HTMLElement, key: string) => {
      const circle = points(c).find(p => p.dataset.key === key)!
      return hoverAt(c, Number(circle.getAttribute('cx')), Number(circle.getAttribute('cy')))
    }

    it('shows the hovered point with column-labelled values', () => {
      render(container, DATA, { tooltips: true })
      expect(hoverTooltip(container, 'Chad')).toBe('Chad\nGDP per capita: 1500\nLife expectancy: 52.8\nPopulation: 18\nContinent: Africa')
    })

    it('rings the hovered bubble just outside its edge', () => {
      render(container, DATA, { tooltips: true })
      const nigeria = points(container).find(p => p.dataset.key === 'Nigeria')!
      hoverTooltip(container, 'Nigeria')
      const ring = container.querySelector('.bc-proximity-dot')!
      expect(Number(ring.getAttribute('r'))).toBe(Number(nigeria.getAttribute('r')) + 3)
    })

    it('keeps each tooltip tied to its own row when names repeat', () => {
      const dupes = { ...DATA, labels: ['Same', 'Same'], series: [{ name: 'X', values: [1, 100] }, { name: 'Y', values: [10, 90] }], textColumns: [] }
      render(container, dupes, { tooltips: true })
      expect(hoverAt(container, -1e6, 1e6)).toContain('Y: 10')
      expect(hoverAt(container, 1e6, -1e6)).toContain('Y: 90')
    })
  })

  describe('trend line', () => {
    it('draws no trend line by default', () => {
      render(container, DATA, {})
      expect(container.querySelector('.bc-trend-line')).toBeNull()
    })

    it('draws one dashed overall trend beneath the points', () => {
      render(container, DATA, { trend: 'overall' })
      const lines = container.querySelectorAll('.bc-trend-line')
      expect(lines).toHaveLength(1)
      expect(lines[0].getAttribute('stroke-dasharray')).toBe('6 4')
      const first = container.querySelector('.bc-scatter-point')!
      expect(lines[0].compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(container.querySelector('.bc-trend-key')).not.toBeNull()
    })

    it('spans only the fitted x-extent', () => {
      render(container, DATA, { trend: 'overall' })
      const xs = points(container).map(c => Number(c.getAttribute('cx')))
      const d = container.querySelector('.bc-trend-line')!.getAttribute('d')!
      const [x1, x2] = [...d.matchAll(/[ML]([-\d.]+),/g)].map(m => Number(m[1]))
      expect(Math.min(x1, x2)).toBeCloseTo(Math.min(...xs))
      expect(Math.max(x1, x2)).toBeCloseTo(Math.max(...xs))
    })

    it('skips per-group fits with fewer than 3 points', () => {
      render(container, DATA, { trend: 'per-group' })
      expect(container.querySelectorAll('.bc-trend-line')).toHaveLength(0)
    })
  })
})
