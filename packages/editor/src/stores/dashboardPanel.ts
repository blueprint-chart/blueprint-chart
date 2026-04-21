import { usePanelStore } from '@/stores/panel'

export const useDashboardPanelStore = defineStore('dashboardPanel', () => {
  const selectedChartId = shallowRef<string | null>(null)

  function selectChart(id: string) {
    if (selectedChartId.value === id) {
      selectedChartId.value = null
      return
    }
    selectedChartId.value = id
    const panel = usePanelStore()
    if (panel.mode === 'closed') {
      panel.open()
    }
  }

  function reset() {
    selectedChartId.value = null
  }

  return {
    selectedChartId,
    selectChart,
    reset,
  }
})

export function useDashboardPanel() {
  const store = useDashboardPanelStore()
  const { selectedChartId } = storeToRefs(store)
  return {
    selectedChartId,
    selectChart: store.selectChart,
    reset: store.reset,
  }
}
