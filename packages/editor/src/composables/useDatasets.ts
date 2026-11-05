import { computed, shallowRef } from 'vue'
import { readLocalMeta, storageKey, useChartSession } from '@/stores/chartSession'
import { collectDatasets } from '@/utils/datasets'
import type { Dataset } from '@/utils/datasets'

export function useDatasets() {
  const session = useChartSession()
  const list = shallowRef<Dataset[]>([])

  function refresh() {
    list.value = collectDatasets(session.listSavedCharts().map(({ id }) => ({
      id,
      dsl: localStorage.getItem(storageKey(id)) ?? '',
      meta: readLocalMeta(id),
    })))
  }

  function startChart(dataset: Dataset): string | null {
    return session.createFromDsl(dataset.dsl, dataset.source)
  }

  refresh()

  return { datasets: computed(() => list.value), refresh, startChart }
}
