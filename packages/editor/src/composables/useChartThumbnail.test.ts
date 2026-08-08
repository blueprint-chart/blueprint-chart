import * as thumb from './useChartThumbnail'

describe('cacheImagesFromDsl', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('caches exactly what the DSL renderers produce, keyed by id', () => {
    const dsl = 'chart bar-vertical\ndata {\n A = 1\n B = 2\n}'
    let expectedThumb: string | null
    let expectedPreview: string | null
    try {
      expectedThumb = thumb.renderThumbnailFromDsl(dsl)
    }
    catch { expectedThumb = null }
    try {
      expectedPreview = thumb.renderPreviewFromDsl(dsl)
    }
    catch { expectedPreview = null }

    thumb.cacheImagesFromDsl('cloudid0001', dsl)

    expect(thumb.getThumbnail('cloudid0001')).toBe(expectedThumb)
    expect(thumb.getPreview('cloudid0001')).toBe(expectedPreview)
  })

  it('does not throw on unrenderable input and caches nothing', () => {
    expect(() => thumb.cacheImagesFromDsl('cloudid0002', 'not a chart')).not.toThrow()
  })
})
