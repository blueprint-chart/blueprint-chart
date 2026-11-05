import { afterEach, describe, expect, it, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { parse } from '@blueprint-chart/lib'
import { storageKey } from '@/stores/chartSession'
import { useCloudChartsStore } from '@/stores/cloudCharts'
import { useAccountStore } from '@/stores/account'
import * as runtimeConfig from '@/config/runtimeConfig'
import type { Dataset, StoredChart } from '@/utils/datasets'
import { useDatasets } from './useDatasets'

const SORT = `  transform sort {
    column = "value"
    direction = descending
  }`

function bpc(title: string) {
  return `chart bar {\n  title = "${title}"\n\n  data {\n    "Brazil" = 37.4\n    "Vietnam" = 27.5\n  }\n${SORT}\n}`
}

function seed(id: string, dsl: string) {
  localStorage.setItem(storageKey(id), dsl)
  localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ schema: 2, savedAt: '2026-11-01T00:00:00Z' }))
}

describe('useDatasets', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    seed('one', bpc('First'))
    seed('two', bpc('Second'))
    localStorage.setItem('blueprint-chart:cloud-index', JSON.stringify({ charts: [] }))
  })

  it('refresh lists one dataset used by two charts and ignores cloud-index', () => {
    const { datasets, refresh } = useDatasets()
    refresh()

    expect(datasets.value).toHaveLength(1)
    expect(datasets.value[0].charts.map(c => c.id).sort()).toEqual(['one', 'two'])
  })

  it('startChart creates a chart with the dataset data and steps', () => {
    const { datasets, startChart } = useDatasets()
    const id = startChart(datasets.value[0])

    expect(id).not.toBeNull()
    const saved = parse(localStorage.getItem(storageKey(id!))!)
    expect(saved.data).toEqual(parse(bpc('First')).data)
    expect(saved.transforms).toHaveLength(1)
  })

  describe('with cloud charts', () => {
    const remote = { id: 'remote', dsl: bpc('Remote').replace('37.4', '12'), meta: { schema: 2, savedAt: '2026-11-02T00:00:00Z' } }

    function signIn(id = 'me') {
      useAccountStore().user = { id } as never
    }

    function ids(datasets: Dataset[]) {
      return datasets.map(d => d.charts.map(c => c.id).sort())
    }

    beforeEach(() => {
      vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
      signIn()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('adds datasets from charts only stored in the cloud with one request', async () => {
      const listCloudCharts = vi.spyOn(useCloudChartsStore(), 'listCloudCharts').mockResolvedValue([
        { id: 'one', dsl: bpc('First'), meta: {} },
        remote,
      ])

      const { datasets } = useDatasets()
      await flushPromises()

      expect(listCloudCharts).toHaveBeenCalledOnce()
      expect(ids(datasets.value)).toEqual([['remote'], ['one', 'two']])
    })

    it('is loading until the cloud charts arrive', async () => {
      let resolve: (charts: StoredChart[]) => void = () => {}
      vi.spyOn(useCloudChartsStore(), 'listCloudCharts').mockReturnValue(new Promise((r) => {
        resolve = r
      }))

      const { loading } = useDatasets()
      expect(loading.value).toBe(true)
      resolve([remote])
      await flushPromises()

      expect(loading.value).toBe(false)
    })

    it('keeps local datasets when the cloud request throws', async () => {
      vi.spyOn(useCloudChartsStore(), 'listCloudCharts').mockRejectedValue(new Error('offline'))

      const { datasets, loading } = useDatasets()
      await flushPromises()

      expect(ids(datasets.value)).toEqual([['one', 'two']])
      expect(loading.value).toBe(false)
    })

    it('drops remote datasets on sign out', async () => {
      vi.spyOn(useCloudChartsStore(), 'listCloudCharts').mockResolvedValue([remote])
      const { datasets } = useDatasets()
      await flushPromises()

      useAccountStore().user = null
      await flushPromises()

      expect(ids(datasets.value)).toEqual([['one', 'two']])
    })

    it('ignores a cloud response that arrives after a newer refresh', async () => {
      const pending: ((charts: StoredChart[]) => void)[] = []
      vi.spyOn(useCloudChartsStore(), 'listCloudCharts').mockImplementation(() => new Promise((r) => {
        pending.push(r)
      }))
      const { datasets } = useDatasets()
      useAccountStore().user = null
      await flushPromises()
      signIn('other')
      await flushPromises()

      pending[1]([])
      await flushPromises()
      pending[0]([remote])
      await flushPromises()

      expect(ids(datasets.value)).toEqual([['one', 'two']])
    })

    it('exposes the DSL of cloud charts for thumbnails', async () => {
      vi.spyOn(useCloudChartsStore(), 'listCloudCharts').mockResolvedValue([remote])
      const { chartDsl } = useDatasets()
      await flushPromises()

      expect(chartDsl('remote')).toBe(remote.dsl)
      expect(chartDsl('one')).toBe(bpc('First'))
    })
  })
})
