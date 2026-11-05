import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parseData } from '../../parse-data'
import { ScaleType } from '../../../enums'
import { render, DOT_RADIUS, DEFAULT_COLOR } from './scatter'

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
  const legendLabels = () => Array.from(container.querySelectorAll('.bc-legend text')).map(t => t.textContent)

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
})
