import { useChartSession, generateId } from '@/composables/useChartSession'
import { useDashboardPanel } from '@/composables/useDashboardPanel'
import type { SavedChartSummary } from '@/composables/useChartSession'

export function useDashboardGallery() {
  const { listSavedCharts, deleteChart } = useChartSession()
  const { selectedChartId } = useDashboardPanel()

  const charts = ref<SavedChartSummary[]>([])
  const sortValue = shallowRef('date-desc')

  const sortedCharts = computed(() => {
    const list = [...charts.value]
    if (sortValue.value === 'date-desc') {
      list.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''))
    }
    else if (sortValue.value === 'date-asc') {
      list.sort((a, b) => (a.savedAt ?? '').localeCompare(b.savedAt ?? ''))
    }
    else if (sortValue.value === 'name-asc') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }
    return list
  })

  const selectedChart = computed(() =>
    charts.value.find(c => c.id === selectedChartId.value) ?? null,
  )

  function refresh() {
    charts.value = listSavedCharts()
  }

  function duplicateChart(id: string): string | null {
    const raw = localStorage.getItem(`blueprint-chart:${id}`)
    if (!raw) {
      return null
    }
    const newId = generateId()
    localStorage.setItem(`blueprint-chart:${newId}`, raw)
    const meta = localStorage.getItem(`blueprint-chart:${id}:meta`)
    if (meta) {
      localStorage.setItem(`blueprint-chart:${newId}:meta`, meta)
    }
    refresh()
    return newId
  }

  function removeChart(id: string) {
    selectedChartId.value = null
    deleteChart(id)
    refresh()
  }

  return {
    charts,
    sortedCharts,
    selectedChart,
    sortValue,
    refresh,
    duplicateChart,
    removeChart,
  }
}
