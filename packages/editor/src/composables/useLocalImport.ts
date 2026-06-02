import type { CloudChartInput } from '@/stores/cloudCharts'
import { storageKey, readLocalMeta } from '@/stores/chartSession'

export interface LocalChartRef {
  id: string
  title: string
  chartType: string
}

export interface LocalImportDeps {
  /** Charts that live only in localStorage (not yet synced). */
  listLocalOnly: () => LocalChartRef[]
  /** Upsert a chart to the cloud by its existing id; returns the id or null. */
  syncCloud: (input: CloudChartInput) => Promise<string | null>
  /** Record an id as cloud-backed so the editor auto-pushes future edits. */
  markCloudBacked: (id: string) => void
}

/**
 * Bulk "Sync all to cloud" for local-only charts. Each chart is upserted under
 * its EXISTING id (so it appears as a single synced row, never a duplicate) and
 * the local copy is kept as the always-on source of truth.
 */
export function useLocalImport(deps: LocalImportDeps) {
  function localOnlyCount(): number {
    return deps.listLocalOnly().length
  }

  async function syncAll(): Promise<number> {
    let synced = 0
    for (const ref of deps.listLocalOnly()) {
      const dsl = localStorage.getItem(storageKey(ref.id))
      if (!dsl) {
        continue
      }
      const id = await deps.syncCloud({
        id: ref.id,
        dsl,
        meta: readLocalMeta(ref.id),
        title: ref.title,
        chartType: ref.chartType,
      })
      if (id) {
        deps.markCloudBacked(id)
        synced++
      }
    }
    return synced
  }

  return { localOnlyCount, syncAll }
}
