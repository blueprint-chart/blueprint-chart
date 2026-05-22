export type ExportTab = 'embed' | 'download'
export type DownloadFormat = 'png' | 'svg' | 'bpc'

export const useExportPanelStore = defineStore('exportPanel', () => {
  const exportTab = shallowRef<ExportTab>('embed')
  const selectedFormat = shallowRef<DownloadFormat>('png')
  const pngScale = shallowRef(2)
  const svgInlineFonts = shallowRef(false)
  const svgMinify = shallowRef(false)
  const bpcIncludeData = shallowRef(true)
  const bpcCompact = shallowRef(false)
  const lastNarrowExportTab = shallowRef<ExportTab>('embed')

  function setExportTab(tab: ExportTab) {
    exportTab.value = tab
  }

  function setSelectedFormat(format: DownloadFormat) {
    selectedFormat.value = format
  }

  function setLastNarrowExportTab(tab: ExportTab) {
    lastNarrowExportTab.value = tab
  }

  function reset() {
    exportTab.value = 'embed'
    selectedFormat.value = 'png'
    pngScale.value = 2
    svgInlineFonts.value = false
    svgMinify.value = false
    bpcIncludeData.value = true
    bpcCompact.value = false
    lastNarrowExportTab.value = 'embed'
  }

  return {
    exportTab,
    selectedFormat,
    pngScale,
    svgInlineFonts,
    svgMinify,
    bpcIncludeData,
    bpcCompact,
    lastNarrowExportTab,
    setExportTab,
    setSelectedFormat,
    setLastNarrowExportTab,
    reset,
  }
})

export function useExportPanel() {
  const store = useExportPanelStore()
  const {
    exportTab,
    selectedFormat,
    pngScale,
    svgInlineFonts,
    svgMinify,
    bpcIncludeData,
    bpcCompact,
    lastNarrowExportTab,
  } = storeToRefs(store)
  return {
    exportTab,
    selectedFormat,
    pngScale,
    svgInlineFonts,
    svgMinify,
    bpcIncludeData,
    bpcCompact,
    lastNarrowExportTab,
    setExportTab: store.setExportTab,
    setSelectedFormat: store.setSelectedFormat,
    setLastNarrowExportTab: store.setLastNarrowExportTab,
    reset: store.reset,
  }
}
