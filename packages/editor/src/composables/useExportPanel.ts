import { reactive, toRefs } from 'vue'

export type ExportTab = 'embed' | 'download'
export type DownloadFormat = 'png' | 'svg' | 'bpc'

const state = reactive({
  exportTab: 'embed' as ExportTab,
  selectedFormat: 'png' as DownloadFormat,
  pngScale: 2,
  svgInlineFonts: false,
  svgMinify: false,
  bpcIncludeData: true,
  bpcCompact: false,
})

export function useExportPanel() {
  function setExportTab(tab: ExportTab) {
    state.exportTab = tab
  }

  function setSelectedFormat(format: DownloadFormat) {
    state.selectedFormat = format
  }

  function reset() {
    state.exportTab = 'embed'
    state.selectedFormat = 'png'
    state.pngScale = 2
    state.svgInlineFonts = false
    state.svgMinify = false
    state.bpcIncludeData = true
    state.bpcCompact = false
  }

  return {
    ...toRefs(state),
    setExportTab,
    setSelectedFormat,
    reset,
  }
}
