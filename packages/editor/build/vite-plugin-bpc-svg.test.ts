import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LineThumb from '../src/assets/chart-thumbnails/line.bpc'
import AreaThumb from '../src/assets/chart-thumbnails/area.bpc'
import { extractOptions, extractData, extractColors, niceTicks, renderToSvg, ID_TOKEN, THEME_COLORS, type ChartNode } from './vite-plugin-bpc-svg'

function prop(key: string, value: string | number): ChartNode['properties'][0] {
  return { type: 'property', key, value, isPercentage: false }
}

const singleData = extractData([
  prop('A', 4), prop('B', 10), prop('C', 7),
  prop('D', 16), prop('E', 13), prop('F', 20),
])

const multiData = extractData([
  { type: 'property' as const, key: 'series', value: 'X,Y,Z', values: ['X', 'Y', 'Z'], isPercentage: false },
  { type: 'property' as const, key: 'A', value: '4,14,8', values: [4, 14, 8], isPercentage: false },
  { type: 'property' as const, key: 'B', value: '10,11,12', values: [10, 11, 12], isPercentage: false },
  { type: 'property' as const, key: 'C', value: '7,18,10', values: [7, 18, 10], isPercentage: false },
  { type: 'property' as const, key: 'D', value: '16,9,15', values: [16, 9, 15], isPercentage: false },
  { type: 'property' as const, key: 'E', value: '13,16,18', values: [13, 16, 18], isPercentage: false },
])

const marksOf = (svg: string) => svg.split('<g class="bpc-marks">')[1]

function pathXCoords(svg: string): number[] {
  const d = marksOf(svg).match(/<path d="([^"]+)" fill="none"/)
  return d ? d[1].split(/[ML]/).filter(Boolean).map(p => parseFloat(p.split(',')[0])) : []
}

function allLineXCoords(svg: string): number[][] {
  return [...marksOf(svg).matchAll(/<path d="([^"]+)" fill="none"/g)]
    .map(m => m[1].split(/[ML]/).filter(Boolean).map(p => parseFloat(p.split(',')[0])))
}

describe('extractOptions', () => {
  it('defaults edgePadding to false when not specified', () => {
    const chart: ChartNode = { type: 'chart', chartType: 'line', properties: [], data: null }
    expect(extractOptions(chart)).toEqual({ edgePadding: false, compact: false })
  })

  it('parses edgePadding = false', () => {
    const chart: ChartNode = {
      type: 'chart', chartType: 'area',
      properties: [prop('edgePadding', 'false')],
      data: null,
    }
    expect(extractOptions(chart).edgePadding).toBe(false)
  })

  it('parses edgePadding = true', () => {
    const chart: ChartNode = {
      type: 'chart', chartType: 'line',
      properties: [prop('edgePadding', 'true')],
      data: null,
    }
    expect(extractOptions(chart).edgePadding).toBe(true)
  })

  it('marks charts with explicit colors as compact', () => {
    const chart: ChartNode = { type: 'chart', chartType: 'bar-multi', properties: [prop('colors', '#111,#222')], data: null }
    expect(extractOptions(chart)).toEqual({ edgePadding: false, compact: true })
  })
})

describe('extractColors', () => {
  it('uses theme variables when no colors are given', () => {
    const chart: ChartNode = { type: 'chart', chartType: 'line', properties: [prop('colorPalette', 'Blueprint')], data: null }
    expect(extractColors(chart)).toEqual(THEME_COLORS)
  })

  it('keeps explicit colors literal', () => {
    const chart: ChartNode = { type: 'chart', chartType: 'bar-multi', properties: [prop('colors', '#111,#222')], data: null }
    expect(extractColors(chart)).toEqual(['#111', '#222'])
  })
})

describe('niceTicks', () => {
  it.each([
    [28, [0, 10, 20, 30]],
    [24, [0, 10, 20, 30]],
    [8, [0, 3, 6, 9]],
    [6, [0, 2, 4, 6]],
    [0, [0, 1, 2, 3]],
  ])('rounds %d to four ticks', (max, ticks) => {
    expect(niceTicks(max)).toEqual(ticks)
  })
})

describe('line thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('line', singleData, THEME_COLORS, { edgePadding: false, compact: false })
    const xs = pathXCoords(svg)
    expect(xs[0]).toBeCloseTo(12)
    expect(xs.at(-1)).toBeCloseTo(90)
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('line', singleData, THEME_COLORS, { edgePadding: true, compact: false })
    const xs = pathXCoords(svg)
    expect(xs[0]).toBeGreaterThan(14)
    expect(xs.at(-1)).toBeLessThan(88)
  })

  it('puts the end-point circle on the last point when edgePadding is true', () => {
    const svg = renderToSvg('line', singleData, THEME_COLORS, { edgePadding: true, compact: false })
    const xs = pathXCoords(svg)
    const cx = parseFloat(marksOf(svg).match(/<circle cx="([^"]+)"/)![1])
    expect(cx).toBeCloseTo(xs.at(-1)!)
  })
})

describe('line-multi thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('line-multi', multiData, THEME_COLORS, { edgePadding: false, compact: false })
    const lines = allLineXCoords(svg)
    expect(lines.length).toBeGreaterThan(0)
    for (const xs of lines) {
      expect(xs[0]).toBeCloseTo(12)
      expect(xs.at(-1)).toBeCloseTo(90)
    }
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('line-multi', multiData, THEME_COLORS, { edgePadding: true, compact: false })
    const lines = allLineXCoords(svg)
    expect(lines.length).toBeGreaterThan(0)
    for (const xs of lines) {
      expect(xs[0]).toBeGreaterThan(14)
      expect(xs.at(-1)).toBeLessThan(88)
    }
  })

  it('glows only the hero line of a multi line chart', () => {
    const marks = marksOf(renderToSvg('line-multi', multiData, THEME_COLORS))
    expect(marks.match(/filter=/g)).toHaveLength(1)
  })
})

describe('area thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('area', singleData, THEME_COLORS, { edgePadding: false, compact: false })
    const xs = pathXCoords(svg)
    expect(xs[0]).toBeCloseTo(12)
    expect(xs.at(-1)).toBeCloseTo(90)
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('area', singleData, THEME_COLORS, { edgePadding: true, compact: false })
    const xs = pathXCoords(svg)
    expect(xs[0]).toBeGreaterThan(14)
    expect(xs.at(-1)).toBeLessThan(88)
  })

  it('fills the area with the per-instance gradient and glows the line', () => {
    const marks = marksOf(renderToSvg('area', singleData, THEME_COLORS))
    expect(marks).toContain(`fill="url(#${ID_TOKEN}g)"`)
    expect(marks).toContain(`filter="url(#${ID_TOKEN}f)"`)
  })
})

describe('area-stacked thumbnails respect edgePadding', () => {
  const firstXs = (svg: string) => [...marksOf(svg).matchAll(/d="M([^"]+)"/g)]
    .map(m => parseFloat(m[1].split(/[ML]\s*/).filter(Boolean)[0].split(',')[0]))

  it('renders edge-to-edge when edgePadding is false', () => {
    const xs = firstXs(renderToSvg('area-stacked', multiData, THEME_COLORS, { edgePadding: false, compact: false }))
    expect(xs.length).toBeGreaterThan(0)
    for (const x of xs) {
      expect(x).toBeCloseTo(12)
    }
  })

  it('adds padding when edgePadding is true', () => {
    const xs = firstXs(renderToSvg('area-stacked', multiData, THEME_COLORS, { edgePadding: true, compact: false }))
    expect(xs.length).toBeGreaterThan(0)
    for (const x of xs) {
      expect(x).toBeGreaterThan(14)
    }
  })

  it('does not glow stacked areas', () => {
    expect(marksOf(renderToSvg('area-stacked', multiData, THEME_COLORS))).not.toContain('filter=')
  })
})

describe('bar-split thumbnails', () => {
  it('renders one rect group per series panel', () => {
    const marks = marksOf(renderToSvg('bar-split', multiData, THEME_COLORS))
    // 3 series × 5 labels (A–E) = 15 rects
    expect(marks.match(/<rect/g)).toHaveLength(15)
  })

  it('returns empty string for single-series data', () => {
    const svg = renderToSvg('bar-split', singleData, ['#f00'])
    expect(svg).toBe('')
  })

  it('panels are positioned left-to-right without overlap', () => {
    const marks = marksOf(renderToSvg('bar-split', multiData, THEME_COLORS))
    const xValues = [...marks.matchAll(/x="([^"]+)"/g)].map(m => parseFloat(m[1]))
    const uniqueXOrigins = [...new Set(xValues.map(x => Math.round(x)))]
    expect(uniqueXOrigins.length).toBeGreaterThan(1)
  })
})

describe('bar-grouped thumbnails', () => {
  it('renders one rect per series per label', () => {
    const marks = marksOf(renderToSvg('bar-grouped', multiData, THEME_COLORS))
    // 3 series × 5 labels (A–E) = 15 rects
    expect(marks.match(/<rect/g)).toHaveLength(15)
  })

  it('returns empty string for single-series data', () => {
    const svg = renderToSvg('bar-grouped', singleData, ['#f00'])
    expect(svg).toBe('')
  })

  it('bars within each group use distinct y positions', () => {
    const marks = marksOf(renderToSvg('bar-grouped', multiData, THEME_COLORS))
    const yValues = [...marks.matchAll(/y="([^"]+)"/g)].map(m => parseFloat(m[1]))
    const uniqueYs = new Set(yValues.map(y => Math.round(y)))
    expect(uniqueYs.size).toBeGreaterThan(5)
  })

  it('uses series colors', () => {
    const marks = marksOf(renderToSvg('bar-grouped', multiData, THEME_COLORS))
    expect(marks).toContain('var(--bc-thumb-series-0)')
    expect(marks).toContain('var(--bc-thumb-series-1)')
    expect(marks).toContain('var(--bc-thumb-series-2)')
  })
})

describe('bar thumbnails are unaffected by edgePadding', () => {
  it('bar-vertical produces identical SVG regardless of edgePadding', () => {
    const svgA = renderToSvg('bar-vertical', singleData, ['#000'], { edgePadding: false, compact: false })
    const svgB = renderToSvg('bar-vertical', singleData, ['#000'], { edgePadding: true, compact: false })
    expect(svgA).toBe(svgB)
  })

  it('bar-horizontal produces identical SVG regardless of edgePadding', () => {
    const svgA = renderToSvg('bar-horizontal', singleData, ['#000'], { edgePadding: false, compact: false })
    const svgB = renderToSvg('bar-horizontal', singleData, ['#000'], { edgePadding: true, compact: false })
    expect(svgA).toBe(svgB)
  })
})

describe('renderToSvg scatter', () => {
  const row = (key: string, values: (string | number)[]) => (
    { type: 'property' as const, key, value: values.join(','), values, isPercentage: false }
  )
  const scatterData = extractData([
    row('series', ['x', 'y', 'size', 'group']),
    row('a', [1, 2, 10, 'north']),
    row('b', [3, 4, 20, 'south']),
    row('c', [5, 1, 30, 'north']),
  ])

  it('renders one translucent circle per point', () => {
    const marks = marksOf(renderToSvg('scatter', scatterData, THEME_COLORS))
    expect(marks.match(/<circle/g)).toHaveLength(3)
    expect(marks).toContain('fill-opacity="0.85"')
  })

  it('colors circles by group', () => {
    const marks = marksOf(renderToSvg('scatter', scatterData, THEME_COLORS))
    expect(marks.match(/fill="var\(--bc-thumb-series-0\)"/g)).toHaveLength(2)
    expect(marks.match(/fill="var\(--bc-thumb-series-1\)"/g)).toHaveLength(1)
  })

  it('labels the x axis with nice ticks', () => {
    expect(renderToSvg('scatter', scatterData, THEME_COLORS)).toContain('>6</text>')
  })

  it('draws no circle for a row with a missing y', () => {
    const data = extractData([
      row('series', ['x', 'y', 'group']),
      row('a', [1, 2, 'north']),
      row('b', [3, 'n/a', 'south']),
    ])
    expect(marksOf(renderToSvg('scatter', data, ['#111'])).match(/<circle/g)).toHaveLength(1)
  })
})

describe('dot-plot thumbnails', () => {
  it('draws a dot per value and a line per row', () => {
    const marks = marksOf(renderToSvg('dot-plot', multiData, THEME_COLORS))
    expect(marks.match(/<circle/g)).toHaveLength(15)
    expect(marks.match(/<line/g)).toHaveLength(5)
  })

  it('returns empty string for single-series data', () => {
    expect(renderToSvg('dot-plot', singleData, ['#f00'])).toBe('')
  })
})

describe('bar-vertical thumbnails', () => {
  const data = extractData([prop('2023', 13), prop('2024', 28), prop('2025', 19)])
  const svg = renderToSvg('bar-vertical', data, THEME_COLORS)

  it('uses the 96 by 64 viewBox', () => {
    expect(svg).toContain('viewBox="0 0 96 64"')
  })

  it('labels categories and four value ticks', () => {
    for (const text of ['2023', '2024', '2025', '0', '10', '20', '30']) {
      expect(svg).toContain(`>${text}</text>`)
    }
  })

  it('draws the largest bar as the glowing hero and the others in the second color', () => {
    const marks = marksOf(svg)
    expect(marks.match(/fill="var\(--bc-thumb-series-0\)"/g)).toHaveLength(2)
    expect(marks.match(/fill="var\(--bc-thumb-series-1\)"[^>]*fill-opacity="0.6"/g)).toHaveLength(2)
    expect(marks).toContain(`filter="url(#${ID_TOKEN}f)"`)
  })

  it('picks a single hero when two bars tie for the maximum', () => {
    const tie = extractData([prop('A', 20), prop('B', 20), prop('C', 5)])
    const marks = marksOf(renderToSvg('bar-vertical', tie, THEME_COLORS))
    expect(marks.match(/filter=/g)).toHaveLength(1)
  })

  it('renders all-zero data without NaN', () => {
    const zeros = extractData([prop('A', 0), prop('B', 0)])
    expect(renderToSvg('bar-vertical', zeros, THEME_COLORS)).not.toContain('NaN')
  })
})

describe('bar-multi and column-stacked thumbnails', () => {
  it('draws one rect per value in series colors, without glow', () => {
    for (const type of ['bar-multi', 'column-stacked']) {
      const marks = marksOf(renderToSvg(type, multiData, THEME_COLORS))
      expect(marks.match(/<rect/g)).toHaveLength(15)
      expect(marks).toContain('var(--bc-thumb-series-2)')
      expect(marks).not.toContain('filter=')
    }
  })

  it('stacks columns up to the nice maximum', () => {
    const svg = renderToSvg('column-stacked', multiData, THEME_COLORS)
    expect(svg).toContain('>60</text>')
  })
})

describe('horizontal thumbnails', () => {
  it('draws a left axis and category labels', () => {
    const data = extractData([prop('FR', 18), prop('US', 28), prop('UK', 12), prop('DE', 23)])
    const svg = renderToSvg('bar-horizontal', data, THEME_COLORS)
    expect(svg).toContain('x1="12" x2="12"')
    for (const text of ['FR', 'US', 'UK', 'DE', '30']) {
      expect(svg).toContain(`>${text}</text>`)
    }
    expect(marksOf(svg).match(/filter=/g)).toHaveLength(1)
  })

  it('labels each bar-split panel with its series name', () => {
    const svg = renderToSvg('bar-split', multiData, THEME_COLORS)
    for (const name of ['X', 'Y', 'Z']) {
      expect(svg).toContain(`>${name}</text>`)
    }
  })

  it('draws the dot-plot hero series larger', () => {
    const marks = marksOf(renderToSvg('dot-plot', multiData, THEME_COLORS))
    expect(marks.match(/r="2.6"/g)).toHaveLength(5)
  })
})

describe('thumbnail ids', () => {
  it('gives each mounted instance its own ids', () => {
    const wrappers = [mount(LineThumb), mount(LineThumb), mount(AreaThumb)]
    const ids = wrappers.flatMap(w => [...w.html().matchAll(/id="([^"]+)"/g)].map(m => m[1]))
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
    expect(wrappers.map(w => w.html()).join('')).not.toContain(ID_TOKEN)
  })
})

describe('pie and donut thumbnails', () => {
  const shares = extractData([prop('A', 35), prop('B', 25), prop('C', 22), prop('D', 18)])

  it('shows a percentage legend and no axis', () => {
    const svg = renderToSvg('pie', shares, THEME_COLORS)
    for (const text of ['35%', '25%', '22%', '18%']) {
      expect(svg).toContain(`>${text}</text>`)
    }
    expect(svg).not.toContain('<line')
    expect(marksOf(svg).match(/<path/g)).toHaveLength(4)
  })

  it('shows the main share in the donut center', () => {
    const svg = renderToSvg('donut', shares, THEME_COLORS)
    expect(svg).toMatch(/font-weight="700"[^>]*>35%<\/text>/)
  })
})
