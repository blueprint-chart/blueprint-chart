import type { SavedChartSummary } from '@/stores/chartSession'
import type { CloudChartSummary } from '@/stores/cloudCharts'
import {
  useChartSession,
  generateId,
  storageKey,
  metaKey,
  readLocalMeta,
  readLocalDsl,
  summarizeDsl,
} from '@/stores/chartSession'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useAccount } from '@/stores/account'

export type SyncState = 'local' | 'synced' | 'cloud'

export interface UnifiedChartSummary extends SavedChartSummary {
  syncState: SyncState
  published: boolean
}

/** Build a cloud-only summary; scene/row counts are filled in lazily once the
 *  DSL is fetched (see the composable's metadata enrichment). */
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

const SORTS: Record<string, (a: UnifiedChartSummary, b: UnifiedChartSummary) => number> = {
  'date-desc': (a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''),
  'date-asc': (a, b) => (a.savedAt ?? '').localeCompare(b.savedAt ?? ''),
  'name-asc': (a, b) => (a.title || '').localeCompare(b.title || ''),
}

export function useDashboardCharts() {
  const session = useChartSession()
  const cloud = useCloudCharts()
  const { cloudEnabled: showCloud, user } = useAccount()
  const wait = useWait()

  const charts = ref<UnifiedChartSummary[]>([])
  const dsls = reactive<Record<string, string>>({})
  const sortValue = shallowRef('date-desc')
  const loaded = shallowRef(false)
  const empty = computed(() => loaded.value && charts.value.length === 0)

  const sortedCharts = computed(() => {
    const cmp = SORTS[sortValue.value]
    return cmp ? [...charts.value].sort(cmp) : charts.value
  })

  const localOnlyCount = computed(() =>
    charts.value.filter(c => c.syncState === 'local').length,
  )

  async function refresh(): Promise<void> {
    const localList = session.listSavedCharts()
    wait.start('dashboard-charts')
    let cloudList: CloudChartSummary[]
    try {
      const owner = showCloud.value ? user.value?.id : undefined
      cloudList = owner === undefined ? [] : await cloud.listCloud(owner)
    }
    finally {
      wait.end('dashboard-charts')
      loaded.value = true
    }
    charts.value = mergeChartLists(localList, cloudList)
    loadDsls()
  }

  /** Local & synced read their DSL from localStorage; cloud-only fetch it
   *  once and enrich their metadata. */
  function loadDsls(): void {
    for (const chart of charts.value) {
      if (chart.syncState === 'cloud') {
        void loadCloudDsl(chart.id)
        continue
      }
      const dsl = readLocalDsl(chart.id)
      if (dsl) {
        dsls[chart.id] = dsl
      }
    }
  }

  function enrichCloudSummary(id: string, dsl: string): void {
    const summary = summarizeDsl(dsl)
    const idx = charts.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      charts.value[idx] = {
        ...charts.value[idx],
        description: summary.description,
        sceneCount: summary.sceneCount,
        rowCount: summary.rowCount,
        allowDarkMode: summary.allowDarkMode,
      }
    }
  }

  async function loadCloudDsl(id: string): Promise<void> {
    if (dsls[id]) {
      enrichCloudSummary(id, dsls[id])
      return
    }
    wait.start(`chart-media:${id}`)
    try {
      const record = await cloud.loadCloud(id)
      if (!record) {
        return
      }
      dsls[id] = record.dsl
      enrichCloudSummary(id, record.dsl)
    }
    finally {
      wait.end(`chart-media:${id}`)
    }
  }

  async function syncOne(id: string): Promise<void> {
    const dsl = localStorage.getItem(storageKey(id))
    if (!dsl) {
      return
    }
    const summary = summarizeDsl(dsl)
    const syncedId = await cloud.syncCloud({
      id,
      dsl,
      meta: readLocalMeta(id),
      title: summary.title,
      chartType: summary.chartType,
    })
    if (syncedId) {
      cloud.markCloudBacked(syncedId)
      await refresh()
    }
  }

  async function remove(id: string): Promise<void> {
    const entry = charts.value.find(c => c.id === id)
    const inCloud = entry ? entry.syncState !== 'local' : cloud.isCloudBacked(id)
    if (inCloud) {
      await cloud.deleteCloud(id)
      cloud.unmarkCloudBacked(id)
    }
    session.deleteChart(id) // removes localStorage entry, meta, thumbnail
    delete dsls[id]
    await refresh()
  }

  /** Duplicate a chart into a new LOCAL-only chart. Returns the new id, or null. */
  async function duplicate(id: string): Promise<string | null> {
    let dsl = localStorage.getItem(storageKey(id))
    let meta = localStorage.getItem(metaKey(id))
    if (!dsl) {
      const record = await cloud.loadCloud(id)
      if (!record) {
        return null
      }
      dsl = record.dsl
      meta = Object.keys(record.meta).length > 0 ? JSON.stringify(record.meta) : null
    }
    const newId = generateId()
    localStorage.setItem(storageKey(newId), dsl)
    if (meta) {
      localStorage.setItem(metaKey(newId), meta)
    }
    await refresh()
    return newId
  }

  return {
    charts,
    sortedCharts,
    empty,
    dsls,
    sortValue,
    localOnlyCount,
    refresh,
    syncOne,
    remove,
    duplicate,
  }
}
