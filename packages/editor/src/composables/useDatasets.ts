import { computed, shallowRef, watch } from 'vue'
import { readLocalMeta, storageKey, useChartSession } from '@/stores/chartSession'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useAccount } from '@/stores/account'
import { accountsEnabled } from '@/config/runtimeConfig'
import { cacheImagesFromDsl, getThumbnail } from '@/composables/useChartThumbnail'
import { collectDatasets } from '@/utils/datasets'
import type { Dataset, StoredChart } from '@/utils/datasets'

export function useDatasets() {
  const session = useChartSession()
  const cloud = useCloudCharts()
  const { isSignedIn } = useAccount()
  const list = shallowRef<Dataset[]>([])
  const showCloud = computed(() => accountsEnabled() && isSignedIn.value)

  async function loadRemote(localIds: Set<string>): Promise<StoredChart[]> {
    const remote = (await cloud.listCloud()).filter(({ id }) => !localIds.has(id))
    const records = await Promise.all(remote.map(async ({ id }) => {
      const record = await cloud.loadCloud(id)
      return record && { id, dsl: record.dsl, meta: record.meta }
    }))
    const charts = records.filter(record => record !== null)
    for (const { id, dsl } of charts) {
      if (!getThumbnail(id)) {
        cacheImagesFromDsl(id, dsl)
      }
    }
    return charts
  }

  async function refresh() {
    const local = session.listSavedCharts().map(({ id }) => ({
      id,
      dsl: localStorage.getItem(storageKey(id)) ?? '',
      meta: readLocalMeta(id),
    }))
    list.value = collectDatasets(local)
    if (!showCloud.value) {
      return
    }
    const remote = await loadRemote(new Set(local.map(({ id }) => id)))
    if (showCloud.value) {
      list.value = collectDatasets([...local, ...remote])
    }
  }

  function startChart(dataset: Dataset): string | null {
    return session.createFromDsl(dataset.dsl, dataset.source)
  }

  watch(showCloud, () => refresh(), { immediate: true })

  return { datasets: computed(() => list.value), refresh, startChart }
}
