import { useCloudSync } from '@/composables/useCloudSync'
import { useAccount } from '@/stores/account'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useChartSession } from '@/stores/chartSession'
import { useChartConfig } from '@/stores/chartConfig'
import { useDslOutput } from '@/composables/useDslOutput'

/**
 * Wires the debounced cloud sync (useCloudSync) to the live editing session.
 * Active only when mounted (the editor shell mounts it gated on accountsEnabled).
 * A chart syncs only when signed in AND it is cloud-backed (its id is in the
 * persistent cloud index — set on cloud-open or new-while-signed-in). Sync upserts
 * by sessionId so the cloud row id === sessionId. The local localStorage autosave
 * remains the always-on source of truth; this is an additive mirror.
 */
export function useCloudSyncBinding() {
  const { isSignedIn } = useAccount()
  const { isCloudBacked, syncCloud } = useCloudCharts()
  const { sessionId, lastSavedAt } = useChartSession()
  const { title, chartType } = useChartConfig()
  const { generateDsl } = useDslOutput()

  const sync = useCloudSync({
    isSignedIn: () => isSignedIn.value,
    isCloudChart: () => !!sessionId.value && isCloudBacked(sessionId.value),
    pushCloud: syncCloud,
    snapshot: () => ({
      id: sessionId.value,
      dsl: generateDsl(),
      meta: readLocalMeta(sessionId.value),
      title: title.value,
      chartType: chartType.value,
    }),
  })

  watch(lastSavedAt, () => {
    sync.requestSync()
  })

  return sync
}

function readLocalMeta(id: string): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(`blueprint-chart:${id}:meta`) || '{}') as Record<string, unknown>
  }
  catch {
    return {}
  }
}
