import { useSavedChartThumbnails } from './useSavedChartThumbnails'

const saveThumbnail = vi.fn()

vi.mock('@/composables/useChartThumbnail', () => ({
  getThumbnail: (id: string) => (id === 'cached' ? '<svg cached/>' : null),
  renderThumbnailFromStorage: (raw: string) => {
    if (raw === 'broken') {
      throw new Error('render failed')
    }
    return '<svg/>'
  },
  saveThumbnail: (...args: unknown[]) => saveThumbnail(...args),
  svgToDataUrl: (svg: string) => `data:${svg}`,
}))

describe('useSavedChartThumbnails', () => {
  beforeEach(() => {
    localStorage.clear()
    saveThumbnail.mockReset()
  })

  it('uses the cache, renders and caches missing ones, and skips broken or absent charts', () => {
    localStorage.setItem('blueprint-chart:fresh', 'chart line {}')
    localStorage.setItem('blueprint-chart:broken', 'broken')
    const { thumbnails, loadThumbnails } = useSavedChartThumbnails()
    loadThumbnails(['cached', 'fresh', 'broken', 'gone'])
    expect(thumbnails).toEqual({ cached: 'data:<svg cached/>', fresh: 'data:<svg/>' })
    expect(saveThumbnail).toHaveBeenCalledWith('fresh', '<svg/>')
  })
})
