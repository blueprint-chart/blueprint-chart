import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { parse } from '@blueprint-chart/lib'
import { storageKey } from '@/stores/chartSession'
import { useCloudChartsStore } from '@/stores/cloudCharts'
import { useAccountStore } from '@/stores/account'
import * as runtimeConfig from '@/config/runtimeConfig'
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
  it('refresh adds datasets from charts only stored in the cloud', async () => {
    vi.spyOn(runtimeConfig, 'accountsEnabled').mockReturnValue(true)
    useAccountStore().user = { id: 'me' } as never
    const cloud = useCloudChartsStore()
    vi.spyOn(cloud, 'listCloud').mockResolvedValue([
      { id: 'one', title: 'First', chartType: 'bar', published: false, updatedAt: null },
      { id: 'remote', title: 'Remote', chartType: 'bar', published: false, updatedAt: null },
    ])
    const loadCloud = vi.spyOn(cloud, 'loadCloud').mockResolvedValue({
      dsl: bpc('Remote').replace('37.4', '12'),
      meta: { schema: 2, savedAt: '2026-11-02T00:00:00Z' },
      owner: 'me',
    })

    const { datasets } = useDatasets()
    await flushPromises()

    expect(loadCloud).toHaveBeenCalledExactlyOnceWith('remote')
    expect(datasets.value.map(d => d.charts.map(c => c.id).sort())).toEqual([['remote'], ['one', 'two']])
  })
})
