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
}

/**
 * One-time import of localStorage charts into the signed-in user's account.
 * Each import is an INSERT (no id) so a fresh, globally-unique cloud id is
 * minted - local ids are never reused (they can collide across users). The
 * local copies are left untouched.
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
      }
    }
    return imported
  }

  return { localCount, importAll }
}
