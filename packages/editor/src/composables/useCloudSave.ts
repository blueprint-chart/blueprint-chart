import { useCloudCharts } from '@/stores/cloudCharts'
import { readLocalMeta, useChartSession } from '@/stores/chartSession'
import { useChartConfig } from '@/stores/chartConfig'
import { useDslOutput } from '@/composables/useDslOutput'

/**
 * Explicit one-shot save of the live editing session to the cloud, then marks
 * it cloud-backed so the debounced mirror (useCloudSyncBinding) takes over.
 * Snapshot shape matches useCloudSyncBinding so both write identical rows.
 */
export function useCloudSave() {
  const { sessionId } = useChartSession()
  const { title, chartType } = useChartConfig()
  const { generateDsl } = useDslOutput()
  const { syncCloud, markCloudBacked } = useCloudCharts()

  const saving = ref(false)

  async function saveToCloud(): Promise<boolean> {
    if (!sessionId.value) {
      return false
    }
    saving.value = true
    const id = await syncCloud({
      id: sessionId.value,
      dsl: generateDsl(),
      meta: readLocalMeta(sessionId.value),
      title: title.value,
      chartType: chartType.value,
    })
    if (id) {
      markCloudBacked(id)
    }
    saving.value = false
    return Boolean(id)
  }

  return { saving, saveToCloud }
}
