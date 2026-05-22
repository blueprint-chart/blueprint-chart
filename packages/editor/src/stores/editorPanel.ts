export type ViewMode = 'preview' | 'dsl'
export type CanvasMode = 'blueprint' | 'auto' | 'light' | 'dark'
export type DataView = 'upload' | 'structure'
export type DataPanelTab = 'column' | 'transforms' | 'parsing' | 'reco'

export const useEditorPanelStore = defineStore('editorPanel', () => {
  const activeTab = shallowRef('type')
  const viewMode = shallowRef<ViewMode>('preview')
  const canvasMode = shallowRef<CanvasMode>('blueprint')
  const showDimensions = shallowRef(true)
  const pendingAnnotationIndex = shallowRef<number | string | null>(null)
  const dataView = shallowRef<DataView>('upload')
  const dataPanelTab = shallowRef<DataPanelTab | ''>('')
  const dataPanelOpen = shallowRef(false)
  const selectedColumnIndex = shallowRef(-1)
  const lastNarrowEditTab = shallowRef<string>('type')
  const lastNarrowDataTab = shallowRef<DataPanelTab>('column')

  function selectTab(tab: string) {
    activeTab.value = tab
  }

  function selectAnnotation(index: number | string) {
    pendingAnnotationIndex.value = index
    selectTab('annotate')
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function setCanvasMode(mode: CanvasMode) {
    canvasMode.value = mode
  }

  function setDataView(view: DataView) {
    dataView.value = view
    if (view === 'structure') {
      openDataPanel('column')
    }
  }

  function setDataPanelTab(tab: DataPanelTab) {
    dataPanelTab.value = tab
  }

  function openDataPanel(tab: DataPanelTab) {
    dataPanelTab.value = tab
    dataPanelOpen.value = true
  }

  function closeDataPanel() {
    dataPanelOpen.value = false
    dataPanelTab.value = '' as DataPanelTab
  }

  function toggleDataPanel() {
    dataPanelOpen.value = !dataPanelOpen.value
  }

  function selectColumn(index: number) {
    if (selectedColumnIndex.value === index) {
      selectedColumnIndex.value = -1
      return
    }
    selectedColumnIndex.value = index
    openDataPanel('column')
  }

  function setLastNarrowEditTab(tab: string) {
    lastNarrowEditTab.value = tab
  }

  function setLastNarrowDataTab(tab: DataPanelTab) {
    lastNarrowDataTab.value = tab
  }

  function reset() {
    activeTab.value = 'type'
    viewMode.value = 'preview'
    canvasMode.value = 'blueprint'
    showDimensions.value = true
    pendingAnnotationIndex.value = null
    dataView.value = 'upload'
    dataPanelTab.value = '' as DataPanelTab
    dataPanelOpen.value = false
    selectedColumnIndex.value = -1
    lastNarrowEditTab.value = 'type'
    lastNarrowDataTab.value = 'column'
  }

  return {
    activeTab,
    viewMode,
    canvasMode,
    showDimensions,
    pendingAnnotationIndex,
    dataView,
    dataPanelTab,
    dataPanelOpen,
    selectedColumnIndex,
    lastNarrowEditTab,
    lastNarrowDataTab,
    selectTab,
    selectAnnotation,
    setViewMode,
    setCanvasMode,
    setDataView,
    setDataPanelTab,
    openDataPanel,
    closeDataPanel,
    toggleDataPanel,
    selectColumn,
    setLastNarrowEditTab,
    setLastNarrowDataTab,
    reset,
  }
})

export function useEditorPanel() {
  const store = useEditorPanelStore()
  const {
    activeTab,
    viewMode,
    canvasMode,
    showDimensions,
    pendingAnnotationIndex,
    dataView,
    dataPanelTab,
    dataPanelOpen,
    selectedColumnIndex,
    lastNarrowEditTab,
    lastNarrowDataTab,
  } = storeToRefs(store)
  return {
    activeTab,
    viewMode,
    canvasMode,
    showDimensions,
    pendingAnnotationIndex,
    dataView,
    dataPanelTab,
    dataPanelOpen,
    selectedColumnIndex,
    lastNarrowEditTab,
    lastNarrowDataTab,
    selectTab: store.selectTab,
    selectAnnotation: store.selectAnnotation,
    setViewMode: store.setViewMode,
    setCanvasMode: store.setCanvasMode,
    setDataView: store.setDataView,
    setDataPanelTab: store.setDataPanelTab,
    openDataPanel: store.openDataPanel,
    closeDataPanel: store.closeDataPanel,
    toggleDataPanel: store.toggleDataPanel,
    selectColumn: store.selectColumn,
    setLastNarrowEditTab: store.setLastNarrowEditTab,
    setLastNarrowDataTab: store.setLastNarrowDataTab,
    reset: store.reset,
  }
}
