import { describe, it, expect, vi } from 'vitest'
import * as barVertical from '../types/bar-vertical/bar-vertical'
import * as barHorizontal from '../types/bar-horizontal/bar-horizontal'
import * as donut from '../types/donut/donut'
import * as pie from '../types/pie/pie'
import * as barMulti from '../types/bar-multi/bar-multi'
import * as barGrouped from '../types/bar-grouped/bar-grouped'
import * as barSplit from '../types/bar-split/bar-split'
import * as barStacked from '../types/bar-stacked/bar-stacked'
import * as columnStacked from '../types/column-stacked/column-stacked'
import * as lineMulti from '../types/line-multi/line-multi'
import * as areaStacked from '../types/area-stacked/area-stacked'
import { HIGHLIGHT_DIM_OPACITY, highlightTargetSet, highlightOpacity } from './highlight'

describe('highlight helper', () => {
  it('HIGHLIGHT_DIM_OPACITY is 0.35', () => {
    expect(HIGHLIGHT_DIM_OPACITY).toBe(0.35)
  })

  it('highlightTargetSet collects targets present in the key universe', () => {
    expect(highlightTargetSet([{ target: 'A' }, { target: 'B' }], ['A', 'B', 'C'])).toEqual(new Set(['A', 'B']))
    expect(highlightTargetSet(undefined, ['A'])).toEqual(new Set())
  })

  it('highlightTargetSet drops a target that matches no key', () => {
    expect(highlightTargetSet([{ target: 'Nope' }], ['A', 'B'])).toEqual(new Set())
    expect(highlightTargetSet([{ target: 'Nope' }, { target: 'B' }], ['A', 'B'])).toEqual(new Set(['B']))
  })

  it('highlightOpacity returns base when no targets', () => {
    expect(highlightOpacity(new Set(), 'A')).toBe(1)
    expect(highlightOpacity(new Set(), 'A', 0.85)).toBe(0.85)
  })

  it('highlightOpacity returns base for a targeted key, dim for others', () => {
    const t = new Set(['A'])
    expect(highlightOpacity(t, 'A')).toBe(1)
    expect(highlightOpacity(t, 'A', 0.85)).toBe(0.85)
    expect(highlightOpacity(t, 'B')).toBe(0.35)
    expect(highlightOpacity(t, 'B', 0.85)).toBe(0.35)
  })
})

describe('a highlight target that matches nothing (#64)', () => {
  const categoryData = { labels: ['Alpha', 'Beta', 'Gamma'], values: [30, 20, 25] }
  const seriesData = {
    labels: ['Q1', 'Q2'],
    values: [],
    series: [
      { name: 'Product A', values: [10, 20] },
      { name: 'Product B', values: [15, 25] },
    ],
  }

  const renderers: Array<[string, (c: HTMLElement, o: object) => void]> = [
    ['bar-vertical', (c, o) => barVertical.render(c, categoryData, o)],
    ['bar-horizontal', (c, o) => barHorizontal.render(c, categoryData, o)],
    ['donut', (c, o) => donut.render(c, categoryData, o)],
    ['pie', (c, o) => pie.render(c, categoryData, o)],
    ['bar-multi', (c, o) => barMulti.render(c, seriesData, o)],
    ['bar-grouped', (c, o) => barGrouped.render(c, seriesData, o)],
    ['bar-split', (c, o) => barSplit.render(c, seriesData, o)],
    ['bar-stacked', (c, o) => barStacked.render(c, seriesData, o)],
    ['column-stacked', (c, o) => columnStacked.render(c, seriesData, o)],
    ['line-multi', (c, o) => lineMulti.render(c, seriesData, o)],
    ['area-stacked', (c, o) => areaStacked.render(c, { ...seriesData, values: [0, 0] }, o)],
  ]

  function dimmedCount(container: HTMLElement): number {
    return Array.from(container.querySelectorAll('*')).filter((el) => {
      const attr = el.getAttribute('opacity')
      const style = (el as SVGElement).style?.opacity
      return Number(attr) === HIGHLIGHT_DIM_OPACITY || Number(style) === HIGHLIGHT_DIM_OPACITY
    }).length
  }

  for (const [name, run] of renderers) {
    it(`${name} renders nothing dimmed`, () => {
      vi.useFakeTimers()
      const container = document.createElement('div')
      document.body.appendChild(container)
      try {
        run(container, { highlights: [{ target: 'Nope' }] })
        expect(dimmedCount(container)).toBe(0)
      }
      finally {
        vi.useRealTimers()
        container.remove()
      }
    })

    it(`${name} still dims when a target does match`, () => {
      vi.useFakeTimers()
      const container = document.createElement('div')
      document.body.appendChild(container)
      try {
        const target = name === 'bar-vertical' || name === 'bar-horizontal' || name === 'donut' || name === 'pie'
          ? 'Alpha'
          : 'Product A'
        run(container, { highlights: [{ target }] })
        expect(dimmedCount(container)).toBeGreaterThan(0)
      }
      finally {
        vi.useRealTimers()
        container.remove()
      }
    })
  }
})
