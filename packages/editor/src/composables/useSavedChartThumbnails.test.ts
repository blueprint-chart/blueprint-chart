import { useSavedChartThumbnails } from './useSavedChartThumbnails'

const saveThumbnail = vi.fn()
const render = vi.fn((raw: string) => {
  if (raw === 'broken') {
    throw new Error('render failed')
  }
  return '<svg/>'
})

vi.mock('@/composables/useChartThumbnail', () => ({
  getThumbnail: (id: string) => (id === 'cached' ? '<svg cached/>' : null),
  renderThumbnailFromStorage: (raw: string) => render(raw),
  saveThumbnail: (...args: unknown[]) => saveThumbnail(...args),
  svgToDataUrl: (svg: string) => `data:${svg}`,
}))

describe('useSavedChartThumbnails', () => {
  beforeEach(() => {
    localStorage.clear()
    saveThumbnail.mockReset()
    render.mockClear()
  })

  it('does not render a broken chart twice', () => {
    localStorage.setItem('blueprint-chart:broken', 'broken')
    const { loadThumbnails } = useSavedChartThumbnails()
    loadThumbnails(['broken'])
    loadThumbnails(['broken'])
    expect(render).toHaveBeenCalledTimes(1)
  })

  it('uses the cache, renders and caches missing ones, and skips broken or absent charts', () => {
    localStorage.setItem('blueprint-chart:fresh', 'chart line {}')
    localStorage.setItem('blueprint-chart:broken', 'broken')
    const { thumbnails, loadThumbnails } = useSavedChartThumbnails()
    loadThumbnails(['cached', 'fresh', 'broken', 'gone'])
    expect(thumbnails).toEqual({ cached: 'data:<svg cached/>', fresh: 'data:<svg/>' })
    expect(saveThumbnail).toHaveBeenCalledWith('fresh', '<svg/>')
  })
  it('renders from the given DSL source', () => {
    const { thumbnails, loadThumbnails } = useSavedChartThumbnails()
    loadThumbnails(['remote'], id => (id === 'remote' ? 'chart bar {}' : null))
    expect(render).toHaveBeenCalledWith('chart bar {}')
    expect(thumbnails).toEqual({ remote: 'data:<svg/>' })
  })
})
