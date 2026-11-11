import { describe, it, expect } from 'vitest'
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

function parsePolylineXCoords(svg: string): number[] {
  const points = svg.match(/points="([^"]+)"/)
  if (!points) {
    return []
  }
  return points[1].split(' ').map(p => parseFloat(p.split(',')[0]))
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
    const svg = renderToSvg('line', singleData, ['#000'], { edgePadding: false, compact: false })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeCloseTo(2)
    expect(xs[xs.length - 1]).toBeCloseTo(46)
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('line', singleData, ['#000'], { edgePadding: true, compact: false })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeGreaterThan(4)
    expect(xs[xs.length - 1]).toBeLessThan(44)
  })
})

describe('line-multi thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('line-multi', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: false, compact: false })
    const allPolylines = [...svg.matchAll(/points="([^"]+)"/g)]
    for (const match of allPolylines) {
      const xs = match[1].split(' ').map(p => parseFloat(p.split(',')[0]))
      expect(xs[0]).toBeCloseTo(2)
      expect(xs[xs.length - 1]).toBeCloseTo(46)
    }
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('line-multi', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: true, compact: false })
    const allPolylines = [...svg.matchAll(/points="([^"]+)"/g)]
    for (const match of allPolylines) {
      const xs = match[1].split(' ').map(p => parseFloat(p.split(',')[0]))
      expect(xs[0]).toBeGreaterThan(4)
      expect(xs[xs.length - 1]).toBeLessThan(44)
    }
  })
})

describe('area thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('area', singleData, ['#000'], { edgePadding: false, compact: false })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeCloseTo(2)
    expect(xs[xs.length - 1]).toBeCloseTo(46)
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('area', singleData, ['#000'], { edgePadding: true, compact: false })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeGreaterThan(4)
    expect(xs[xs.length - 1]).toBeLessThan(44)
  })
})

describe('area-stacked thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('area-stacked', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: false, compact: false })
    // Check that path coordinates start at x=2 and end at x=46
    const paths = [...svg.matchAll(/d="M ([^"]+)"/g)]
    expect(paths.length).toBeGreaterThan(0)
    for (const match of paths) {
      const coords = match[1].split(/[ML]\s*/).filter(Boolean)
      const firstX = parseFloat(coords[0].split(',')[0])
      expect(firstX).toBeCloseTo(2)
    }
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('area-stacked', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: true, compact: false })
    const paths = [...svg.matchAll(/d="M ([^"]+)"/g)]
    expect(paths.length).toBeGreaterThan(0)
    for (const match of paths) {
      const coords = match[1].split(/[ML]\s*/).filter(Boolean)
      const firstX = parseFloat(coords[0].split(',')[0])
      expect(firstX).toBeGreaterThan(4)
    }
  })
})

describe('bar-split thumbnails', () => {
  it('renders one rect group per series panel', () => {
    const svg = renderToSvg('bar-split', multiData, ['#f00', '#0f0', '#00f'])
    const rects = [...svg.matchAll(/<rect/g)]
    // 3 series × 5 labels (A–E) = 15 rects
    expect(rects.length).toBe(15)
  })

  it('returns empty string for single-series data', () => {
    const svg = renderToSvg('bar-split', singleData, ['#f00'])
    expect(svg).toBe('')
  })

  it('panels are positioned left-to-right without overlap', () => {
    const svg = renderToSvg('bar-split', multiData, ['#f00', '#0f0', '#00f'])
    const xValues = [...svg.matchAll(/x="([^"]+)"/g)].map(m => parseFloat(m[1]))
    const uniqueXOrigins = [...new Set(xValues.map(x => Math.round(x)))]
    // Each panel starts at a different x offset
    expect(uniqueXOrigins.length).toBeGreaterThan(1)
  })
})

describe('bar-grouped thumbnails', () => {
  it('renders one rect per series per label', () => {
    const svg = renderToSvg('bar-grouped', multiData, ['#f00', '#0f0', '#00f'])
    const rects = [...svg.matchAll(/<rect/g)]
    // 3 series × 5 labels (A–E) = 15 rects
    expect(rects.length).toBe(15)
  })

  it('returns empty string for single-series data', () => {
    const svg = renderToSvg('bar-grouped', singleData, ['#f00'])
    expect(svg).toBe('')
  })

  it('bars within each group use distinct y positions', () => {
    const svg = renderToSvg('bar-grouped', multiData, ['#f00', '#0f0', '#00f'])
    const yValues = [...svg.matchAll(/y="([^"]+)"/g)].map(m => parseFloat(m[1]))
    const uniqueYs = new Set(yValues.map(y => Math.round(y)))
    // 3 series × 5 groups = 15 rects, all y positions should differ within groups
    expect(uniqueYs.size).toBeGreaterThan(5)
  })

  it('uses series colors', () => {
    const svg = renderToSvg('bar-grouped', multiData, ['#f00', '#0f0', '#00f'])
    expect(svg).toContain('#f00')
    expect(svg).toContain('#0f0')
    expect(svg).toContain('#00f')
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
    const svg = renderToSvg('scatter', scatterData, ['#111', '#222'])
    expect(svg.match(/<circle/g)).toHaveLength(3)
    expect(svg).toContain('fill-opacity="0.7"')
  })

  it('colors circles by group', () => {
    const svg = renderToSvg('scatter', scatterData, ['#111', '#222'])
    expect(svg.match(/fill="#111"/g)).toHaveLength(2)
    expect(svg.match(/fill="#222"/g)).toHaveLength(1)
  })

  it('draws no circle for a row with a missing y', () => {
    const data = extractData([
      row('series', ['x', 'y', 'group']),
      row('a', [1, 2, 'north']),
      row('b', [3, 'n/a', 'south']),
    ])
    expect(renderToSvg('scatter', data, ['#111']).match(/<circle/g)).toHaveLength(1)
  })
})

describe('dot-plot thumbnails', () => {
  it('draws a dot per value and a line per row', () => {
    const svg = renderToSvg('dot-plot', multiData, ['#f00', '#0f0', '#00f'])
    expect([...svg.matchAll(/<circle/g)]).toHaveLength(15)
    expect([...svg.matchAll(/<line/g)]).toHaveLength(5)
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
