import type { CloudChartInput } from '@/stores/cloudCharts'
import { storageKey, readLocalMeta } from '@/stores/chartSession'

export interface LocalChartRef {
  id: string
  title: string
  chartType: string
}

export interface LocalImportDeps {
  listLocal: () => LocalChartRef[]
  pushCloud: (input: CloudChartInput) => Promise<string | null>
  /** Remove the local copy once it has been migrated to the cloud. */
  deleteLocal: (id: string) => void
}

/**
 * One-time migration of localStorage charts into the signed-in user's account.
 * Each import is an INSERT (no id) so a fresh, globally-unique cloud id is
 * minted - local ids are never reused (they can collide across users). On
 * success the local copy is removed, so the import banner empties and a repeat
 * import can't create duplicate cloud rows.
 */
export function useLocalImport(deps: LocalImportDeps) {
  function localCount(): number {
    return deps.listLocal().length
  }

  async function importAll(): Promise<number> {
    let imported = 0
    for (const ref of deps.listLocal()) {
      const dsl = localStorage.getItem(storageKey(ref.id))
      if (!dsl) {
        continue
      }
      const id = await deps.pushCloud({
        dsl,
        meta: readLocalMeta(ref.id),
        title: ref.title,
        chartType: ref.chartType,
      })
      if (id) {
        imported++
        deps.deleteLocal(ref.id)
      }
    }
    return imported
  }

  return { localCount, importAll }
}
