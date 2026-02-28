import { reactive, toRefs } from 'vue'

export type PanelMode = 'docked' | 'floating' | 'collapsed'
export type ViewMode = 'preview' | 'dsl'

const state = reactive({
  panelMode: 'docked' as PanelMode,
  activeTab: 'type',
  viewMode: 'preview' as ViewMode,
  floatingPosition: { x: -1, y: 16 },
  floatingSize: { width: 340, height: 500 },
})

let lastOpenMode: 'docked' | 'floating' = 'docked'

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

function setViewMode(mode: ViewMode) {
  state.viewMode = mode
}

function reset() {
  state.panelMode = 'docked'
  state.activeTab = 'type'
  state.viewMode = 'preview'
  state.floatingPosition = { x: -1, y: 16 }
  state.floatingSize = { width: 340, height: 500 }
  lastOpenMode = 'docked'
}

export function useEditorPanel() {
  return {
    ...toRefs(state),
    dock,
    float,
    collapse,
    toggleMode,
    selectTab,
    setViewMode,
    reset,
  }
}
