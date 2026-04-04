export type DashboardPanelMode = 'docked' | 'floating' | 'collapsed'

const PANEL_MIN_WIDTH = 260
const PANEL_MAX_WIDTH = 660

function defaultPanelWidth() {
  const available = Math.floor(window.innerWidth * 0.3)
  return Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, available))
}

export const useDashboardPanelStore = defineStore('dashboardPanel', () => {
  const panelMode = ref<DashboardPanelMode>('docked')
  const dockedPanelWidth = ref(defaultPanelWidth())
  const floatingPosition = ref({ x: -1, y: 16 })
  const selectedChartId = ref<string | null>(null)

  let lastOpenMode: 'docked' | 'floating' = 'docked'

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
    selectedChartId.value = null
  }

  function selectChart(id: string) {
    if (selectedChartId.value === id) {
      selectedChartId.value = null
      return
    }
    selectedChartId.value = id
    if (panelMode.value === 'collapsed') {
      panelMode.value = lastOpenMode
    }
  }

  function reset() {
    panelMode.value = 'collapsed'
    selectedChartId.value = null
    dockedPanelWidth.value = defaultPanelWidth()
    floatingPosition.value = { x: -1, y: 16 }
    lastOpenMode = 'docked'
  }

  return {
    panelMode,
    dockedPanelWidth,
    floatingPosition,
    selectedChartId,
    dock,
    float,
    collapse,
    selectChart,
    reset,
  }
})

export function useDashboardPanel() {
  const store = useDashboardPanelStore()
  const { panelMode, dockedPanelWidth, floatingPosition, selectedChartId } = storeToRefs(store)
  return {
    panelMode,
    dockedPanelWidth,
    floatingPosition,
    selectedChartId,
    dock: store.dock,
    float: store.float,
    collapse: store.collapse,
    selectChart: store.selectChart,
    reset: store.reset,
  }
}
