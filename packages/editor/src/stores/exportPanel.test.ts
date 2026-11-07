import { useExportPanelStore, useExportPanelStore as useExportPanel } from './exportPanel'
import { EXPORT_PREVIEW_CONTEXT_KEY } from './storageKeys'

describe('useExportPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts with default state', () => {
    const store = useExportPanel()
    expect(store.exportTab).toBe('embed')
    expect(store.selectedFormat).toBe('png')
    expect(store.pngScale).toBe(2)
    expect(store.svgInlineFonts).toBe(false)
    expect(store.svgMinify).toBe(false)
    expect(store.bpcIncludeData).toBe(true)
    expect(store.bpcCompact).toBe(false)
  })

  it('sets export tab', () => {
    const store = useExportPanel()
    store.setExportTab('download')
    expect(store.exportTab).toBe('download')
  })

  it('sets selected format', () => {
    const store = useExportPanel()
    store.setSelectedFormat('svg')
    expect(store.selectedFormat).toBe('svg')
  })

  it('resets to defaults', () => {
    const store = useExportPanel()
    store.setExportTab('download')
    store.setSelectedFormat('bpc')
    store.pngScale = 4
    store.svgInlineFonts = true
    store.reset()
    expect(store.exportTab).toBe('embed')
    expect(store.selectedFormat).toBe('png')
    expect(store.pngScale).toBe(2)
    expect(store.svgInlineFonts).toBe(false)
  })

  it('keeps the remembered preview context on reset', async () => {
    const store = useExportPanel()
    store.setPreviewContext('card')
    store.reset()
    await nextTick()
    expect(store.previewContext).toBe('card')
    expect(localStorage.getItem(EXPORT_PREVIEW_CONTEXT_KEY)).toBe('card')
  })

  it('falls back to article when the stored preview context is unknown', () => {
    localStorage.setItem(EXPORT_PREVIEW_CONTEXT_KEY, 'page')
    expect(useExportPanel().previewContext).toBe('article')
  })

  it('shares state across calls', () => {
    const a = useExportPanel()
    const b = useExportPanel()
    a.setExportTab('download')
    expect(b.exportTab).toBe('download')
  })

  it('defaults the preview context to article', () => {
    expect(useExportPanel().previewContext).toBe('article')
  })

  it('sets the preview context', () => {
    const store = useExportPanel()
    store.setPreviewContext('card')
    expect(store.previewContext).toBe('card')
  })

  it('remembers the preview context across sessions', async () => {
    useExportPanel().setPreviewContext('card')
    await nextTick()
    setActivePinia(createPinia())
    expect(useExportPanel().previewContext).toBe('card')
  })
})

describe('useExportPanelStore — lastNarrowExportTab', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes lastNarrowExportTab with default "embed"', () => {
    const store = useExportPanelStore()
    expect(store.lastNarrowExportTab).toBe('embed')
  })

  it('setLastNarrowExportTab updates lastNarrowExportTab', () => {
    const store = useExportPanelStore()
    store.setLastNarrowExportTab('download')
    expect(store.lastNarrowExportTab).toBe('download')
  })

  it('reset() clears lastNarrowExportTab to default', () => {
    const store = useExportPanelStore()
    store.setLastNarrowExportTab('download')
    store.reset()
    expect(store.lastNarrowExportTab).toBe('embed')
  })
})
