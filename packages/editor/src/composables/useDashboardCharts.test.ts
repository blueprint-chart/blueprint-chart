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
