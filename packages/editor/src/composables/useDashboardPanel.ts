import { reactive, toRefs } from 'vue'

export type DashboardPanelMode = 'docked' | 'floating' | 'collapsed'

const PANEL_MIN_WIDTH = 260
const PANEL_MAX_WIDTH = 660

function defaultPanelWidth() {
  const available = Math.floor(window.innerWidth * 0.3)
  return Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, available))
}

const state = reactive({
  panelMode: 'collapsed' as DashboardPanelMode,
  dockedPanelWidth: defaultPanelWidth(),
  floatingPosition: { x: -1, y: 16 },
  selectedChartId: null as string | null,
})

let lastOpenMode: 'docked' | 'floating' = 'docked'

export function useDashboardPanel() {
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
    state.selectedChartId = null
  }

  function selectChart(id: string) {
    if (state.selectedChartId === id) {
      collapse()
      return
    }
    state.selectedChartId = id
    if (state.panelMode === 'collapsed') {
      state.panelMode = lastOpenMode
    }
  }

  function reset() {
    state.panelMode = 'collapsed'
    state.selectedChartId = null
    state.dockedPanelWidth = defaultPanelWidth()
    state.floatingPosition = { x: -1, y: 16 }
    lastOpenMode = 'docked'
  }

  return {
    ...toRefs(state),
    dock,
    float,
    collapse,
    selectChart,
    reset,
  }
}
