import { useExportPanelStore as useExportPanel } from './exportPanel'

describe('useExportPanel', () => {
  beforeEach(() => {
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

  it('shares state across calls', () => {
    const a = useExportPanel()
    const b = useExportPanel()
    a.setExportTab('download')
    expect(b.exportTab).toBe('download')
  })
})
