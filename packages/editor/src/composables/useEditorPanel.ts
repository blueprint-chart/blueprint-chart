import { reactive, toRefs } from 'vue'

export type PanelMode = 'docked' | 'floating' | 'collapsed'
export type ViewMode = 'preview' | 'dsl'
export type CanvasMode = 'blueprint' | 'auto' | 'light' | 'dark'
export type DataView = 'upload' | 'structure'
export type DataPanelTab = 'column' | 'transforms' | 'parsing' | 'reco'

const state = reactive({
  panelMode: 'docked' as PanelMode,
  activeTab: 'type',
  viewMode: 'preview' as ViewMode,
  canvasMode: 'blueprint' as CanvasMode,
  floatingPosition: { x: -1, y: 16 },
  floatingSize: { width: 340, height: 500 },
  pendingAnnotationIndex: null as number | null,
  dataView: 'upload' as DataView,
  dataPanelMode: 'docked' as PanelMode,
  dataPanelTab: '' as DataPanelTab,
  dataPanelOpen: false,
  dataFloatingPosition: { x: -1, y: 16 },
  selectedColumnIndex: -1,
})

let lastOpenMode: 'docked' | 'floating' = 'docked'
let lastDataOpenMode: 'docked' | 'floating' = 'docked'

export function useEditorPanel() {
  function dock() {
    lastOpenMode = 'docked'
    state.panelMode = 'docked'
  }

  function float() {
    lastOpenMode = 'floating'
    state.panelMode = 'floating'
  }

  function collapse() {
    state.panelMode = 'collapsed'
    state.activeTab = ''
  }

  function toggleMode() {
    if (state.panelMode === 'docked') {
      float()
    }
    else if (state.panelMode === 'floating') {
      dock()
    }
    else {
      state.panelMode = lastOpenMode
      if (!state.activeTab) {
        state.activeTab = 'type'
      }
    }
  }

  function selectTab(tab: string) {
    state.activeTab = tab
    if (state.panelMode === 'collapsed') {
      state.panelMode = lastOpenMode
    }
  }

  function selectAnnotation(index: number) {
    state.pendingAnnotationIndex = index
    selectTab('annotate')
  }

  function setViewMode(mode: ViewMode) {
    state.viewMode = mode
  }

  function setCanvasMode(mode: CanvasMode) {
    state.canvasMode = mode
  }

  function setDataView(view: DataView) {
    state.dataView = view
    if (view === 'structure') {
      openDataPanel('column')
    }
  }

  function setDataPanelTab(tab: DataPanelTab) {
    state.dataPanelTab = tab
  }

  function dockDataPanel() {
    lastDataOpenMode = 'docked'
    state.dataPanelMode = 'docked'
  }

  function floatDataPanel() {
    lastDataOpenMode = 'floating'
    state.dataPanelMode = 'floating'
  }

  function collapseDataPanel() {
    state.dataPanelMode = 'collapsed'
  }

  function openDataPanel(tab: DataPanelTab) {
    state.dataPanelTab = tab
    state.dataPanelOpen = true
    if (state.dataPanelMode === 'collapsed') {
      state.dataPanelMode = lastDataOpenMode
    }
  }

  function closeDataPanel() {
    state.dataPanelMode = 'collapsed'
    state.dataPanelOpen = false
    state.dataPanelTab = '' as DataPanelTab
  }

  function toggleDataPanel() {
    state.dataPanelOpen = !state.dataPanelOpen
  }

  function selectColumn(index: number) {
    if (state.selectedColumnIndex === index) {
      state.selectedColumnIndex = -1
      return
    }
    state.selectedColumnIndex = index
    openDataPanel('column')
  }

  function reset() {
    state.panelMode = 'docked'
    state.activeTab = 'type'
    state.viewMode = 'preview'
    state.canvasMode = 'blueprint'
    state.floatingPosition = { x: -1, y: 16 }
    state.floatingSize = { width: 340, height: 500 }
    state.pendingAnnotationIndex = null
    state.dataView = 'upload'
    state.dataPanelMode = 'docked'
    state.dataPanelTab = '' as DataPanelTab
    state.dataPanelOpen = false
    state.dataFloatingPosition = { x: -1, y: 16 }
    state.selectedColumnIndex = -1
    lastOpenMode = 'docked'
    lastDataOpenMode = 'docked'
  }

  return {
    ...toRefs(state),
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
}
