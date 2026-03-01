import { reactive, toRefs } from 'vue'

export type PanelMode = 'docked' | 'floating' | 'collapsed'
export type ViewMode = 'preview' | 'dsl'
export type CanvasMode = 'blueprint' | 'auto' | 'light' | 'dark'

const state = reactive({
  panelMode: 'docked' as PanelMode,
  activeTab: 'type',
  viewMode: 'preview' as ViewMode,
  canvasMode: 'blueprint' as CanvasMode,
  floatingPosition: { x: -1, y: 16 },
  floatingSize: { width: 340, height: 500 },
  pendingAnnotationIndex: null as number | null,
})

let lastOpenMode: 'docked' | 'floating' = 'docked'

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

  function reset() {
    state.panelMode = 'docked'
    state.activeTab = 'type'
    state.viewMode = 'preview'
    state.canvasMode = 'blueprint'
    state.floatingPosition = { x: -1, y: 16 }
    state.floatingSize = { width: 340, height: 500 }
    state.pendingAnnotationIndex = null
    lastOpenMode = 'docked'
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
    reset,
  }
}
