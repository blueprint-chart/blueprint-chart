import { ChartType } from '@blueprint-chart/lib'
import { snapshotFromState } from '@/utils/chart/chartRender'
import { parseChartState } from '@/utils/chart/chartState'
import { renderSceneThumbnails, renderThumbnailSvg } from './useChartThumbnail'

const { mockRenderChart } = vi.hoisted(() => ({ mockRenderChart: vi.fn() }))

vi.mock('@blueprint-chart/lib', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@blueprint-chart/lib')>()
  return { ...actual, renderChart: mockRenderChart }
})

const DATA = { labels: ['A'], values: [1] }

function themeAtRender(allowDarkMode: boolean | undefined, theme: 'light' | 'dark') {
  let seen: string | null = null
  mockRenderChart.mockImplementationOnce((container: HTMLElement) => {
    seen = container.getAttribute('data-bs-theme')
    container.innerHTML = '<svg></svg>'
  })
  renderThumbnailSvg({ chartType: ChartType.BarVertical, data: DATA, options: { allowDarkMode } }, theme)
  return seen
}

describe('renderThumbnailSvg', () => {
  it('renders with the given theme', () => {
    expect(themeAtRender(true, 'dark')).toBe('dark')
    expect(themeAtRender(true, 'light')).toBe('light')
  })

  it('renders light when dark mode is not allowed', () => {
    expect(themeAtRender(false, 'dark')).toBe('light')
  })

  it('allows dark mode when the option is unset', () => {
    expect(themeAtRender(undefined, 'dark')).toBe('dark')
  })

  it('paints the themed card surface before rendering the frameless chart', () => {
    let surface = ''
    mockRenderChart.mockImplementationOnce((container: HTMLElement) => {
      surface = container.style.backgroundColor
      container.innerHTML = '<svg></svg>'
    })
    renderThumbnailSvg({ chartType: ChartType.BarVertical, data: DATA }, 'dark')
    expect(surface).toBe('var(--bs-card-bg)')
  })

  it('bakes the container background the labels were tuned against', () => {
    mockRenderChart.mockImplementationOnce((container: HTMLElement) => {
      container.style.backgroundColor = 'rgb(1, 2, 3)'
      container.innerHTML = '<svg></svg>'
    })
    const svg = renderThumbnailSvg({ chartType: ChartType.BarVertical, data: DATA }, 'dark')
    expect(svg).toContain('background: rgb(1, 2, 3)')
  })
})

describe('renderSceneThumbnails', () => {
  it('keeps the bar column and overlays on the base and scene thumbnails', () => {
    const state = parseChartState(`chart bar-vertical {
  overlay "Low" "High" {
    pattern = stripes
  }
  data {
    series = "Value","Low","High"
    "A" = 2,1,3
  }
  scene "First" {
    title = "First"
  }
}`)
    mockRenderChart.mockClear()
    mockRenderChart.mockImplementation((container: HTMLElement) => {
      container.innerHTML = '<svg></svg>'
    })
    renderSceneThumbnails(snapshotFromState(state), 'light')
    const definitions = mockRenderChart.mock.calls.map(call => call[1])
    const seriesNames = definitions.map(d => d.data.series?.map((s: { name: string }) => s.name))
    const overlayColumns = definitions.map(d => d.overlays?.map((o: { columns: string[] }) => o.columns))
    expect(seriesNames).toEqual([['Value', 'Low', 'High'], ['Value', 'Low', 'High']])
    expect(overlayColumns).toEqual([[['Low', 'High']], [['Low', 'High']]])
  })
})
