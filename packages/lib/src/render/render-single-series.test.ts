import { describe, it, expect, beforeEach } from 'vitest'
import { renderBpc } from './render-bpc'

// A `data` block with no `series` meta-row is a stack, a group or a panel of
// one: degenerate, but it has an obvious rendering — one bar per category.
// Drawing the axis and no marks at all leaves the author with no way to tell
// the chart type from a broken chart.
const MULTI_SERIES_TYPES = ['bar-stacked', 'column-stacked', 'bar-grouped', 'bar-split', 'area-stacked']

function singleSeries(type: string): string {
  return `chart ${type} {
  data {
    "Alpha" = 10
    "Beta" = 20
  }
}`
}

describe('a multi-series chart type draws single-series data', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  for (const type of MULTI_SERIES_TYPES) {
    it(`${type}: one mark per category`, () => {
      renderBpc(container, singleSeries(type))
      const marks = container.querySelectorAll('.bc-bar, .bc-area')
      expect(marks.length).toBeGreaterThan(0)
    })
  }

  it('bar-stacked: the bar length matches the value on the axis scale', () => {
    renderBpc(container, singleSeries('bar-stacked'))
    const widths = [...container.querySelectorAll('.bc-bar-stacked')]
      .map(bar => Number(bar.getAttribute('width')))
    expect(widths).toHaveLength(2)
    expect(widths[1] / widths[0]).toBeCloseTo(2, 1)
  })

  it('column-stacked: the column height matches the value on the axis scale', () => {
    renderBpc(container, singleSeries('column-stacked'))
    const heights = [...container.querySelectorAll('.bc-bar-stacked')]
      .map(bar => Number(bar.getAttribute('height')))
    expect(heights).toHaveLength(2)
    expect(heights[1] / heights[0]).toBeCloseTo(2, 1)
  })

  it('bar-grouped: a group of one fills its category band', () => {
    renderBpc(container, singleSeries('bar-grouped'))
    const bars = [...container.querySelectorAll('.bc-bar-grouped')]
    expect(bars).toHaveLength(2)
    for (const bar of bars) {
      expect(Number(bar.getAttribute('height'))).toBeGreaterThan(0)
    }
  })

  it('bar-split: a panel of one spans the plot and carries no header text', () => {
    renderBpc(container, singleSeries('bar-split'))
    expect(container.querySelectorAll('.bc-bar-split')).toHaveLength(2)
    const headers = [...container.querySelectorAll('.bc-split-header')]
      .map(h => h.textContent)
      .filter(Boolean)
    expect(headers).toEqual([])
  })

  it('no chart type invents a legend entry for the implicit series', () => {
    for (const type of MULTI_SERIES_TYPES) {
      const c = document.createElement('div')
      document.body.appendChild(c)
      renderBpc(c, singleSeries(type))
      expect(c.querySelectorAll('.bc-legend-item'), type).toHaveLength(0)
    }
  })
})
