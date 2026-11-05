import { describe, expect, it, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { parse } from '@blueprint-chart/lib'
import { storageKey } from '@/stores/chartSession'
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
})
