import { useChartSession, generateId } from '@/composables/useChartSession'
import {
  getThumbnail,
  saveThumbnail,
  deleteThumbnail,
  getPreview,
  savePreview,
  deletePreview,
  renderThumbnailFromStorage,
  renderPreviewFromStorage,
  svgToDataUrl,
} from '@/composables/useChartThumbnail'
import { useDashboardPanel } from '@/composables/useDashboardPanel'
import { useTheme } from '@/composables/useTheme'
import type { SavedChartSummary } from '@/composables/useChartSession'

export function useDashboardGallery() {
  const { listSavedCharts, deleteChart } = useChartSession()
  const { selectedChartId, collapse } = useDashboardPanel()
  const { resolvedTheme } = useTheme()

  const charts = ref<SavedChartSummary[]>([])
  const thumbnails = reactive<Record<string, string>>({})
  const previews = reactive<Record<string, string>>({})
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
    loadThumbnails()
  }

  function loadThumbnails() {
    for (const chart of charts.value) {
      const cachedThumb = getThumbnail(chart.id)
      const cachedPreview = getPreview(chart.id)
      if (cachedThumb) {
        thumbnails[chart.id] = svgToDataUrl(cachedThumb)
      }
      if (cachedPreview) {
        previews[chart.id] = svgToDataUrl(cachedPreview)
      }
      if (cachedThumb && cachedPreview) {
        continue
      }
      const raw = localStorage.getItem(`blueprint-chart:${chart.id}`)
      if (!raw) {
        continue
      }
      try {
        if (!cachedThumb) {
          const svg = renderThumbnailFromStorage(raw)
          if (svg) {
            saveThumbnail(chart.id, svg)
            thumbnails[chart.id] = svgToDataUrl(svg)
          }
        }
        if (!cachedPreview) {
          const preview = renderPreviewFromStorage(raw)
          if (preview) {
            savePreview(chart.id, preview)
            previews[chart.id] = svgToDataUrl(preview)
          }
        }
      }
      catch {
        // skip corrupt entries
      }
    }
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
    const thumb = getThumbnail(id)
    if (thumb) {
      saveThumbnail(newId, thumb)
    }
    refresh()
    return newId
  }

  function removeChart(id: string) {
    collapse()
    deleteChart(id)
    delete thumbnails[id]
    delete previews[id]
    refresh()
  }

  function regenerateImages() {
    for (const chart of charts.value) {
      deleteThumbnail(chart.id)
      deletePreview(chart.id)
      delete thumbnails[chart.id]
      delete previews[chart.id]
    }
    loadThumbnails()
  }

  watch(resolvedTheme, () => {
    regenerateImages()
  })

  return {
    charts,
    sortedCharts,
    selectedChart,
    thumbnails,
    previews,
    sortValue,
    refresh,
    duplicateChart,
    removeChart,
  }
}
