import { ChartType, SortDirection } from '@blueprint-chart/lib'
import { renderThumbnailSvg } from './useChartThumbnail'

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
  renderThumbnailSvg(ChartType.BarVertical, DATA, { allowDarkMode }, SortDirection.None, { theme })
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

  it('bakes the frame background the labels were tuned against', () => {
    mockRenderChart.mockImplementationOnce((container: HTMLElement) => {
      container.innerHTML = '<div class="bc-frame" style="background-color: rgb(1, 2, 3)"><svg></svg></div>'
    })
    const svg = renderThumbnailSvg(ChartType.BarVertical, DATA, {}, SortDirection.None, { theme: 'dark' })
    expect(svg).toContain('background: rgb(1, 2, 3)')
  })
})
