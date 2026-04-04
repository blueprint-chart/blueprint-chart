import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseDslSceneCount, renderDsl } from './useChartFromDsl'
import * as lib from '@blueprint-chart/lib'

const mockRenderer = vi.fn()

// Mock @blueprint-chart/lib — we test the orchestration logic, not the chart renderer
vi.mock('@blueprint-chart/lib', () => ({
  parse: vi.fn((bpc: string) => {
    const hasScene = bpc.includes('scene')
    return {
      chartType: 'bar-vertical',
      data: [{ label: 'A', values: [10] }, { label: 'B', values: [20] }],
      properties: bpc.includes('title:')
        ? [{ key: 'title', value: 'Test Title' }]
        : [],
      scenes: hasScene
        ? [{ properties: [{ key: 'title', value: 'Scene 1' }], data: null, chartType: null }]
        : [],
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
    }
  }),
  parseData: vi.fn((dataStr: string) => {
    if (!dataStr) {
      return { labels: [], values: [] }
    }
    return { labels: ['A', 'B'], values: [10, 20] }
  }),
  buildChartOptions: vi.fn((opts: Record<string, unknown>) => ({ ...opts })),
  getChart: vi.fn(() => mockRenderer),
  resolveBackgroundColor: vi.fn(() => '#ffffff'),
  propertyMap: vi.fn((props: { key: string, value: unknown }[]) => {
    const map = new Map<string, unknown>()
    for (const p of props) {
      map.set(p.key, p.value)
    }
    return map
  }),
  extractChartTypeOptions: vi.fn(() => ({})),
  extractSceneOverrides: vi.fn(() => ({
    chartType: null,
    data: null,
    properties: new Map(),
    chartTypeOptions: null,
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],
    seriesOverrides: [],
    series: [],
  })),
  dataEntriesToString: vi.fn((data: unknown) => data ? 'A\t10\nB\t20' : ''),
  convertColorizes: vi.fn(() => []),
  convertHighlights: vi.fn(() => []),
  convertAreaFills: vi.fn(() => []),
  convertAnnotations: vi.fn(() => []),
  convertSeriesOverrides: vi.fn(() => []),
}))

const mockedLib = vi.mocked(lib)

describe('parseDslSceneCount', () => {
  it('returns 0 for empty string', () => {
    expect(parseDslSceneCount('')).toBe(0)
  })

  it('returns scene count from parsed BPC', () => {
    expect(parseDslSceneCount('scene: test')).toBe(1)
  })

  it('returns 0 when no scenes in BPC', () => {
    expect(parseDslSceneCount('bar-vertical\nA\t10')).toBe(0)
  })
})

describe('renderDsl', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    vi.clearAllMocks()
    // Restore default getChart to return the mock renderer
    mockedLib.getChart.mockReturnValue(mockRenderer as unknown as ReturnType<typeof lib.getChart>)
  })

  it('clears the container on render', () => {
    container.innerHTML = '<p>old content</p>'
    renderDsl(container, 'bar-vertical\nA\t10')
    expect(container.querySelector('p')).toBeNull()
  })

  it('does nothing for empty DSL', () => {
    renderDsl(container, '')
    expect(mockedLib.getChart).not.toHaveBeenCalled()
  })

  it('calls the chart renderer with parsed data', () => {
    renderDsl(container, 'bar-vertical\nA\t10')
    expect(mockRenderer).toHaveBeenCalledTimes(1)
    expect(mockRenderer).toHaveBeenCalledWith(
      container,
      expect.objectContaining({ labels: ['A', 'B'] }),
      expect.any(Object),
      false,
    )
  })

  it('passes transition flag to renderer', () => {
    renderDsl(container, 'bar-vertical\nA\t10', { transition: true })
    expect(mockRenderer).toHaveBeenCalledWith(
      container,
      expect.any(Object),
      expect.any(Object),
      true,
    )
  })

  it('does not clear container when transition is true', () => {
    container.innerHTML = '<svg></svg>'
    renderDsl(container, 'bar-vertical\nA\t10', { transition: true })
    // replaceChildren not called, so SVG should persist (renderer would normally modify it)
  })

  it('strips colors when stripColors option is set', () => {
    mockedLib.parse.mockReturnValueOnce({
      chartType: 'bar-vertical',
      data: [{ label: 'A', values: [10] }],
      properties: [
        { key: 'colors', value: 'red,blue' },
        { key: 'colorPalette', value: 'warm' },
        { key: 'title', value: 'Test' },
      ],
      scenes: [],
      colorizes: [],
      highlights: [],
      areaFills: [],
      annotations: [],
      series: [],
    } as ReturnType<typeof lib.parse>)

    renderDsl(container, 'bar-vertical\nA\t10', { stripColors: true })
    const calledWith = mockedLib.propertyMap.mock.calls[0][0]
    expect(calledWith.some((p: { key: string }) => p.key === 'colors')).toBe(false)
    expect(calledWith.some((p: { key: string }) => p.key === 'colorPalette')).toBe(false)
  })

  it('applies aspect-ratio height constraint', () => {
    mockedLib.propertyMap.mockReturnValueOnce(
      new Map([['heightMode', 'aspect-ratio'], ['aspectRatio', '16:9']]) as ReturnType<typeof lib.propertyMap>,
    )

    renderDsl(container, 'bar-vertical\nA\t10')
    expect(container.style.aspectRatio).toBe('16 / 9')
    expect(container.style.height).toBe('auto')
    expect(container.style.display).toBe('flex')
  })

  it('applies fixed height constraint', () => {
    mockedLib.propertyMap.mockReturnValueOnce(
      new Map([['heightMode', 'fixed'], ['fixedHeight', 300]]) as ReturnType<typeof lib.propertyMap>,
    )

    renderDsl(container, 'bar-vertical\nA\t10')
    expect(container.style.height).toBe('300px')
  })

  it('ignores layout properties when ignoreLayout is set', () => {
    mockedLib.propertyMap.mockReturnValueOnce(
      new Map([['heightMode', 'fixed'], ['fixedHeight', 300]]) as ReturnType<typeof lib.propertyMap>,
    )

    renderDsl(container, 'bar-vertical\nA\t10', { ignoreLayout: true })
    expect(container.style.height).toBe('')
  })

  it('extracts scene overrides when sceneIndex is provided', () => {
    renderDsl(container, 'scene: test\nA\t10', { sceneIndex: 0 })
    expect(mockedLib.extractSceneOverrides).toHaveBeenCalledTimes(1)
  })

  it('does not extract scene overrides for out-of-range index', () => {
    renderDsl(container, 'bar-vertical\nA\t10', { sceneIndex: 5 })
    expect(mockedLib.extractSceneOverrides).not.toHaveBeenCalled()
  })

  it('returns early when getChart returns null', () => {
    mockedLib.getChart.mockReturnValueOnce(null as unknown as ReturnType<typeof lib.getChart>)
    renderDsl(container, 'bar-vertical\nA\t10')
    expect(mockRenderer).not.toHaveBeenCalled()
  })

  it('returns early when data has no labels', () => {
    mockedLib.parseData.mockReturnValueOnce({ labels: [], values: [] } as ReturnType<typeof lib.parseData>)
    renderDsl(container, 'bar-vertical\nA\t10')
    expect(mockRenderer).not.toHaveBeenCalled()
  })

  it('does not throw for malformed DSL', () => {
    expect(() => renderDsl(container, '???invalid???')).not.toThrow()
  })
})
