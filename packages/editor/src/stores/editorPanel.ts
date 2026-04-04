export type PanelMode = 'docked' | 'floating' | 'collapsed'
export type ViewMode = 'preview' | 'dsl'
export type CanvasMode = 'blueprint' | 'auto' | 'light' | 'dark'
export type DataView = 'upload' | 'structure'
export type DataPanelTab = 'column' | 'transforms' | 'parsing' | 'reco'

const PANEL_MIN_WIDTH = 260
const PANEL_MAX_WIDTH = 660

function defaultPanelWidth() {
  const available = Math.floor(window.innerWidth * 0.35)
  return Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, available))
}

export const useEditorPanelStore = defineStore('editorPanel', () => {
  const panelMode = ref<PanelMode>('docked')
  const activeTab = ref('type')
  const viewMode = ref<ViewMode>('preview')
  const canvasMode = ref<CanvasMode>('blueprint')
  const showDimensions = ref(true)
  const floatingPosition = ref({ x: -1, y: 16 })
  const floatingSize = ref({ width: 340, height: 500 })
  const pendingAnnotationIndex = ref<number | string | null>(null)
  const dataView = ref<DataView>('upload')
  const dataPanelMode = ref<PanelMode>('docked')
  const dataPanelTab = ref<DataPanelTab | ''>('')
  const dataPanelOpen = ref(false)
  const dataFloatingPosition = ref({ x: -1, y: 16 })
  const selectedColumnIndex = ref(-1)
  const dockedPanelWidth = ref(defaultPanelWidth())

  let lastOpenMode: 'docked' | 'floating' = 'docked'
  let lastDataOpenMode: 'docked' | 'floating' = 'docked'

  function dock() {
    lastOpenMode = 'docked'
    panelMode.value = 'docked'
  }

  function float() {
    lastOpenMode = 'floating'
    panelMode.value = 'floating'
  }

  function collapse() {
    panelMode.value = 'collapsed'
    activeTab.value = ''
  }

  function toggleMode() {
    if (panelMode.value === 'docked') {
      float()
    }
    else if (panelMode.value === 'floating') {
      dock()
    }
    else {
      panelMode.value = lastOpenMode
      if (!activeTab.value) {
        activeTab.value = 'type'
      }
    }
  }

  function selectTab(tab: string) {
    activeTab.value = tab
    if (panelMode.value === 'collapsed') {
      panelMode.value = lastOpenMode
    }
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

  function dockDataPanel() {
    lastDataOpenMode = 'docked'
    dataPanelMode.value = 'docked'
  }

  function floatDataPanel() {
    lastDataOpenMode = 'floating'
    dataPanelMode.value = 'floating'
  }

  function collapseDataPanel() {
    dataPanelMode.value = 'collapsed'
  }

  function openDataPanel(tab: DataPanelTab) {
    dataPanelTab.value = tab
    dataPanelOpen.value = true
    if (dataPanelMode.value === 'collapsed') {
      dataPanelMode.value = lastDataOpenMode
    }
  }

  function closeDataPanel() {
    dataPanelMode.value = 'collapsed'
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

  function reset() {
    panelMode.value = 'docked'
    activeTab.value = 'type'
    viewMode.value = 'preview'
    canvasMode.value = 'blueprint'
    showDimensions.value = true
    floatingPosition.value = { x: -1, y: 16 }
    floatingSize.value = { width: 340, height: 500 }
    pendingAnnotationIndex.value = null
    dataView.value = 'upload'
    dataPanelMode.value = 'docked'
    dataPanelTab.value = '' as DataPanelTab
    dataPanelOpen.value = false
    dataFloatingPosition.value = { x: -1, y: 16 }
    selectedColumnIndex.value = -1
    dockedPanelWidth.value = defaultPanelWidth()
    lastOpenMode = 'docked'
    lastDataOpenMode = 'docked'
  }

  return {
    panelMode,
    activeTab,
    viewMode,
    canvasMode,
    showDimensions,
    floatingPosition,
    floatingSize,
    pendingAnnotationIndex,
    dataView,
    dataPanelMode,
    dataPanelTab,
    dataPanelOpen,
    dataFloatingPosition,
    selectedColumnIndex,
    dockedPanelWidth,
    dock,
    float,
    collapse,
    toggleMode,
    selectTab,
    selectAnnotation,
    setViewMode,
    setCanvasMode,
    setDataView,
    setDataPanelTab,
    dockDataPanel,
    floatDataPanel,
    collapseDataPanel,
    openDataPanel,
    closeDataPanel,
    toggleDataPanel,
    selectColumn,
    reset,
  }
})

export function useEditorPanel() {
  const store = useEditorPanelStore()
  const {
    panelMode,
    activeTab,
    viewMode,
    canvasMode,
    showDimensions,
    floatingPosition,
    floatingSize,
    pendingAnnotationIndex,
    dataView,
    dataPanelMode,
    dataPanelTab,
    dataPanelOpen,
    dataFloatingPosition,
    selectedColumnIndex,
    dockedPanelWidth,
  } = storeToRefs(store)
  return {
    panelMode,
    activeTab,
    viewMode,
    canvasMode,
    showDimensions,
    floatingPosition,
    floatingSize,
    pendingAnnotationIndex,
    dataView,
    dataPanelMode,
    dataPanelTab,
    dataPanelOpen,
    dataFloatingPosition,
    selectedColumnIndex,
    dockedPanelWidth,
    dock: store.dock,
    float: store.float,
    collapse: store.collapse,
    toggleMode: store.toggleMode,
    selectTab: store.selectTab,
    selectAnnotation: store.selectAnnotation,
    setViewMode: store.setViewMode,
    setCanvasMode: store.setCanvasMode,
    setDataView: store.setDataView,
    setDataPanelTab: store.setDataPanelTab,
    dockDataPanel: store.dockDataPanel,
    floatDataPanel: store.floatDataPanel,
    collapseDataPanel: store.collapseDataPanel,
    openDataPanel: store.openDataPanel,
    closeDataPanel: store.closeDataPanel,
    toggleDataPanel: store.toggleDataPanel,
    selectColumn: store.selectColumn,
    reset: store.reset,
  }
}
