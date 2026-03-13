import { describe, it, expect } from 'vitest'
import { extractOptions, extractData, renderToSvg, type ChartNode } from './vite-plugin-bpc-svg'

function prop(key: string, value: string | number): ChartNode['properties'][0] {
  return { type: 'property', key, value, isPercentage: false }
}

const singleData = extractData([
  prop('A', 4), prop('B', 10), prop('C', 7),
  prop('D', 16), prop('E', 13), prop('F', 20),
])

const multiData = extractData([
  { type: 'property' as const, key: '_series', value: 'X,Y,Z', values: ['X', 'Y', 'Z'], isPercentage: false },
  { type: 'property' as const, key: 'A', value: '4,14,8', values: [4, 14, 8], isPercentage: false },
  { type: 'property' as const, key: 'B', value: '10,11,12', values: [10, 11, 12], isPercentage: false },
  { type: 'property' as const, key: 'C', value: '7,18,10', values: [7, 18, 10], isPercentage: false },
  { type: 'property' as const, key: 'D', value: '16,9,15', values: [16, 9, 15], isPercentage: false },
  { type: 'property' as const, key: 'E', value: '13,16,18', values: [13, 16, 18], isPercentage: false },
])

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
    expect(extractOptions(chart)).toEqual({ edgePadding: false })
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
})

describe('line thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('line', singleData, ['#000'], { edgePadding: false })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeCloseTo(2)
    expect(xs[xs.length - 1]).toBeCloseTo(46)
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('line', singleData, ['#000'], { edgePadding: true })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeGreaterThan(4)
    expect(xs[xs.length - 1]).toBeLessThan(44)
  })
})

describe('line-multi thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('line-multi', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: false })
    const allPolylines = [...svg.matchAll(/points="([^"]+)"/g)]
    for (const match of allPolylines) {
      const xs = match[1].split(' ').map(p => parseFloat(p.split(',')[0]))
      expect(xs[0]).toBeCloseTo(2)
      expect(xs[xs.length - 1]).toBeCloseTo(46)
    }
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('line-multi', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: true })
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
    const svg = renderToSvg('area', singleData, ['#000'], { edgePadding: false })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeCloseTo(2)
    expect(xs[xs.length - 1]).toBeCloseTo(46)
  })

  it('adds padding when edgePadding is true', () => {
    const svg = renderToSvg('area', singleData, ['#000'], { edgePadding: true })
    const xs = parsePolylineXCoords(svg)
    expect(xs[0]).toBeGreaterThan(4)
    expect(xs[xs.length - 1]).toBeLessThan(44)
  })
})

describe('area-stacked thumbnails respect edgePadding', () => {
  it('renders edge-to-edge when edgePadding is false', () => {
    const svg = renderToSvg('area-stacked', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: false })
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
    const svg = renderToSvg('area-stacked', multiData, ['#f00', '#0f0', '#00f'], { edgePadding: true })
    const paths = [...svg.matchAll(/d="M ([^"]+)"/g)]
    expect(paths.length).toBeGreaterThan(0)
    for (const match of paths) {
      const coords = match[1].split(/[ML]\s*/).filter(Boolean)
      const firstX = parseFloat(coords[0].split(',')[0])
      expect(firstX).toBeGreaterThan(4)
    }
  })
})

describe('bar thumbnails are unaffected by edgePadding', () => {
  it('bar-vertical produces identical SVG regardless of edgePadding', () => {
    const svgA = renderToSvg('bar-vertical', singleData, ['#000'], { edgePadding: false })
    const svgB = renderToSvg('bar-vertical', singleData, ['#000'], { edgePadding: true })
    expect(svgA).toBe(svgB)
  })

  it('bar-horizontal produces identical SVG regardless of edgePadding', () => {
    const svgA = renderToSvg('bar-horizontal', singleData, ['#000'], { edgePadding: false })
    const svgB = renderToSvg('bar-horizontal', singleData, ['#000'], { edgePadding: true })
    expect(svgA).toBe(svgB)
  })
})
