import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

export type ExportTab = 'embed' | 'download'
export type DownloadFormat = 'png' | 'svg' | 'bpc'

export const useExportPanelStore = defineStore('exportPanel', () => {
  const exportTab = ref<ExportTab>('embed')
  const selectedFormat = ref<DownloadFormat>('png')
  const pngScale = ref(2)
  const svgInlineFonts = ref(false)
  const svgMinify = ref(false)
  const bpcIncludeData = ref(true)
  const bpcCompact = ref(false)

  function setExportTab(tab: ExportTab) {
    exportTab.value = tab
  }

  function setSelectedFormat(format: DownloadFormat) {
    selectedFormat.value = format
  }

  function reset() {
    exportTab.value = 'embed'
    selectedFormat.value = 'png'
    pngScale.value = 2
    svgInlineFonts.value = false
    svgMinify.value = false
    bpcIncludeData.value = true
    bpcCompact.value = false
  }

  return {
    exportTab,
    selectedFormat,
    pngScale,
    svgInlineFonts,
    svgMinify,
    bpcIncludeData,
    bpcCompact,
    setExportTab,
    setSelectedFormat,
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
  } = storeToRefs(store)
  return {
    exportTab,
    selectedFormat,
    pngScale,
    svgInlineFonts,
    svgMinify,
    bpcIncludeData,
    bpcCompact,
    setExportTab: store.setExportTab,
    setSelectedFormat: store.setSelectedFormat,
    reset: store.reset,
  }
}
