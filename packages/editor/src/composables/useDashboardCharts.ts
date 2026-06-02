import type { SavedChartSummary } from '@/stores/chartSession'
import type { CloudChartSummary } from '@/stores/cloudCharts'

export type SyncState = 'local' | 'synced' | 'cloud'

export interface UnifiedChartSummary extends SavedChartSummary {
  syncState: SyncState
  published: boolean
}

/** Build a cloud-only summary; scene/row counts are filled in lazily once the
 *  DSL is fetched (see the composable's image/metadata enrichment). */
function cloudToSummary(c: CloudChartSummary): UnifiedChartSummary {
  return {
    id: c.id,
    title: c.title,
    description: '',
    chartType: c.chartType,
    savedAt: c.updatedAt,
    sceneCount: 0,
    rowCount: 0,
    allowDarkMode: true,
    sheetNumber: null,
    sheetId: '',
    syncState: 'cloud',
    published: c.published,
  }
}

/**
 * Merge local and cloud charts into one list keyed by id. A chart in both is
 * `synced` (local metadata wins, it is richer); local-only is `local`;
 * cloud-only is `cloud`.
 */
export function mergeChartLists(
  localCharts: SavedChartSummary[],
  cloudCharts: CloudChartSummary[],
): UnifiedChartSummary[] {
  const cloudById = new Map(cloudCharts.map(c => [c.id, c]))
  const result: UnifiedChartSummary[] = localCharts.map((l) => {
    const c = cloudById.get(l.id)
    return { ...l, syncState: c ? 'synced' : 'local', published: c?.published ?? false }
  })
  const localIds = new Set(localCharts.map(l => l.id))
  for (const c of cloudCharts) {
    if (!localIds.has(c.id)) {
      result.push(cloudToSummary(c))
    }
  }
  return result
}
