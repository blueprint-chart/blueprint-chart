import { computed, shallowRef, watch } from 'vue'
import { readLocalMeta, storageKey, useChartSession } from '@/stores/chartSession'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useAccount } from '@/stores/account'
import { collectDatasets } from '@/utils/datasets'
import type { Dataset, StoredChart } from '@/utils/datasets'

export function useDatasets() {
  const session = useChartSession()
  const cloud = useCloudCharts()
  const { cloudEnabled, user } = useAccount()
  const list = shallowRef<Dataset[]>([])
  const remote = shallowRef(new Map<string, string>())
  const loading = shallowRef(false)
  let latest = 0

  async function loadRemote(owner: string, localIds: Set<string>): Promise<StoredChart[]> {
    try {
      return (await cloud.listCloudCharts(owner)).filter(({ id }) => !localIds.has(id))
    }
    catch {
      return []
    }
  }

  async function refresh() {
    const run = ++latest
    const local = session.listSavedCharts().map(({ id }) => ({
      id,
      dsl: localStorage.getItem(storageKey(id)) ?? '',
      meta: readLocalMeta(id),
    }))
    list.value = collectDatasets(local)
    remote.value = new Map()
    const owner = cloudEnabled.value ? user.value?.id : undefined
    loading.value = owner !== undefined
    if (owner === undefined) {
      return
    }
    const charts = await loadRemote(owner, new Set(local.map(({ id }) => id)))
    if (run !== latest) {
      return
    }
    list.value = collectDatasets([...local, ...charts])
    remote.value = new Map(charts.map(({ id, dsl }) => [id, dsl]))
    loading.value = false
  }

  function chartDsl(id: string): string | null {
    return remote.value.get(id) ?? localStorage.getItem(storageKey(id))
  }

  function startChart(dataset: Dataset): string | null {
    return session.createFromDsl(dataset.dsl, dataset.source)
  }

  watch(cloudEnabled, () => refresh(), { immediate: true })

  return { datasets: computed(() => list.value), loading: computed(() => loading.value), refresh, chartDsl, startChart }
}
