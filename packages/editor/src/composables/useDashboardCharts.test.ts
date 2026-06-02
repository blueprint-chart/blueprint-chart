import { mergeChartLists, type UnifiedChartSummary } from './useDashboardCharts'
import type { SavedChartSummary } from '@/stores/chartSession'
import type { CloudChartSummary } from '@/stores/cloudCharts'

function local(id: string, over: Partial<SavedChartSummary> = {}): SavedChartSummary {
  return {
    id, title: id, description: '', chartType: 'bar', savedAt: '2026-01-01',
    sceneCount: 1, rowCount: 3, allowDarkMode: true, sheetNumber: null, sheetId: '', ...over,
  }
}
function cloud(id: string, over: Partial<CloudChartSummary> = {}): CloudChartSummary {
  return { id, title: id, chartType: 'line', published: false, updatedAt: '2026-02-01', ...over }
}

describe('mergeChartLists', () => {
  it('marks a chart present only in localStorage as local', () => {
    const merged = mergeChartLists([local('a')], [])
    expect(merged).toHaveLength(1)
    expect(merged[0].syncState).toBe('local')
  })

  it('marks a chart present in both as synced and carries the published flag', () => {
    const merged = mergeChartLists([local('a')], [cloud('a', { published: true })])
    expect(merged).toHaveLength(1)
    expect(merged[0].syncState).toBe('synced')
    expect(merged[0].published).toBe(true)
    // local metadata wins for synced charts (it is richer).
    expect(merged[0].sceneCount).toBe(1)
  })

  it('includes a chart present only in the cloud as cloud-only', () => {
    const merged = mergeChartLists([], [cloud('b', { title: 'Remote' })])
    expect(merged).toHaveLength(1)
    const c = merged.find(x => x.id === 'b') as UnifiedChartSummary
    expect(c.syncState).toBe('cloud')
    expect(c.title).toBe('Remote')
    expect(c.savedAt).toBe('2026-02-01')
  })

  it('produces one row per id across both sources', () => {
    const merged = mergeChartLists([local('a'), local('c')], [cloud('a'), cloud('b')])
    expect(merged.map(m => m.id).sort()).toEqual(['a', 'b', 'c'])
  })
})

import { useDashboardCharts } from './useDashboardCharts'
import { useCloudCharts } from '@/stores/cloudCharts'
import * as clientModule from '@/lib/supabaseClient'

/** Minimal chainable Supabase mock; upsert/delete chains resolve { error: null }. */
function makeClientMock() {
  const builder: Record<string, any> = {}
  builder.select = vi.fn(() => builder)
  builder.order = vi.fn(() => Promise.resolve({ data: [], error: null }))
  builder.eq = vi.fn(() => builder)
  builder.single = vi.fn(() => Promise.resolve({ data: null, error: null }))
  builder.upsert = vi.fn(() => Promise.resolve({ error: null }))
  builder.delete = vi.fn(() => builder)
  // Thenable so an awaited delete().eq() chain resolves with no error.
  builder.then = (resolve: (v: unknown) => void) => resolve({ data: [{ id: 'x' }], error: null })
  return { from: vi.fn(() => builder), __builder: builder }
}

describe('useDashboardCharts actions', () => {
  let client: ReturnType<typeof makeClientMock>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
    client = makeClientMock()
    vi.spyOn(clientModule, 'getSupabaseClient').mockResolvedValue(client as never)
  })

  function seedLocal(id: string, dsl = 'chart bar {}') {
    localStorage.setItem(`blueprint-chart:${id}`, dsl)
    localStorage.setItem(`blueprint-chart:${id}:meta`, JSON.stringify({ savedAt: '2026-01-01' }))
  }

  it('syncOne upserts the local DSL under its id and marks it cloud-backed', async () => {
    seedLocal('localid0001')
    const dash = useDashboardCharts()

    await dash.syncOne('localid0001')

    expect(client.__builder.upsert).toHaveBeenCalled()
    expect(client.__builder.upsert.mock.calls[0][0]).toMatchObject({ id: 'localid0001', dsl: 'chart bar {}' })
    expect(useCloudCharts().isCloudBacked('localid0001')).toBe(true)
  })

  it('remove deletes the cloud row, local copy and index entry for a synced chart', async () => {
    seedLocal('localid0002')
    useCloudCharts().markCloudBacked('localid0002')
    const dash = useDashboardCharts()

    await dash.remove('localid0002')

    expect(client.__builder.delete).toHaveBeenCalled()
    expect(localStorage.getItem('blueprint-chart:localid0002')).toBeNull()
    expect(useCloudCharts().isCloudBacked('localid0002')).toBe(false)
  })

  it('remove of a local-only chart never calls the cloud', async () => {
    seedLocal('localid0003')
    const dash = useDashboardCharts()

    await dash.remove('localid0003')

    expect(client.__builder.delete).not.toHaveBeenCalled()
    expect(localStorage.getItem('blueprint-chart:localid0003')).toBeNull()
  })

  it('remove of a cloud-only chart deletes the cloud row even when not in the local index', async () => {
    const dash = useDashboardCharts()
    dash.charts.value = [{
      id: 'cloudonly001', title: 'Remote', description: '', chartType: 'bar',
      savedAt: '2026-02-01', sceneCount: 0, rowCount: 0, allowDarkMode: true,
      sheetNumber: null, sheetId: '', syncState: 'cloud', published: false,
    }]

    await dash.remove('cloudonly001')

    expect(client.__builder.delete).toHaveBeenCalled()
    expect(useCloudCharts().isCloudBacked('cloudonly001')).toBe(false)
  })
})
