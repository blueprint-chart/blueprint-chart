import type { CloudChartInput } from '@/stores/cloudCharts'

export type CloudSyncStatus = 'idle' | 'saving' | 'saved' | 'offline'

export interface CloudSyncDeps {
  isSignedIn: () => boolean
  isCloudChart: () => boolean
  pushCloud: (input: CloudChartInput) => Promise<string | null>
  snapshot: () => CloudChartInput
}

const DEBOUNCE_MS = 1500

/**
 * Debounced one-way mirror of the active chart to the cloud. The local
 * localStorage autosave remains the always-on source of truth; this only fires
 * when signed in AND the active chart is a cloud chart the user owns.
 *
 * Dependencies are injected so the composable is unit-testable without Pinia
 * wiring; the real call site passes account/cloud store accessors.
 */
export function useCloudSync(deps: CloudSyncDeps) {
  const status = shallowRef<CloudSyncStatus>('idle')
  let timer: ReturnType<typeof setTimeout> | null = null

  async function flush(): Promise<void> {
    if (!deps.isSignedIn() || !deps.isCloudChart()) {
      return
    }
    status.value = 'saving'
    const id = await deps.pushCloud(deps.snapshot())
    status.value = id ? 'saved' : 'offline'
  }

  function requestSync(): void {
    if (!deps.isSignedIn() || !deps.isCloudChart()) {
      return
    }
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = null
      void flush()
    }, DEBOUNCE_MS)
  }

  return { status, requestSync, flush }
}
