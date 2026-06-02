import type { SavedChartSummary } from '@/stores/chartSession'
import type { CloudChartSummary } from '@/stores/cloudCharts'
import {
  useChartSession,
  generateId,
  storageKey,
  metaKey,
  readLocalMeta,
  summarizeDsl,
} from '@/stores/chartSession'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useAccount } from '@/stores/account'
import { accountsEnabled } from '@/config/runtimeConfig'
import {
  getThumbnail,
  saveThumbnail,
  getPreview,
  savePreview,
  deletePreview,
  renderThumbnailFromStorage,
  renderPreviewFromStorage,
  cacheImagesFromDsl,
  svgToDataUrl,
} from '@/composables/useChartThumbnail'

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

const SORTS: Record<string, (a: UnifiedChartSummary, b: UnifiedChartSummary) => number> = {
  'date-desc': (a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''),
  'date-asc': (a, b) => (a.savedAt ?? '').localeCompare(b.savedAt ?? ''),
  'name-asc': (a, b) => (a.title || '').localeCompare(b.title || ''),
}

export function useDashboardCharts() {
  const session = useChartSession()
  const cloud = useCloudCharts()
  const { isSignedIn } = useAccount()

  const charts = ref<UnifiedChartSummary[]>([])
  const thumbnails = reactive<Record<string, string>>({})
  const previews = reactive<Record<string, string>>({})
  const sortValue = shallowRef('date-desc')

  const showCloud = computed(() => accountsEnabled() && isSignedIn.value)

  const sortedCharts = computed(() => {
    const cmp = SORTS[sortValue.value]
    return cmp ? [...charts.value].sort(cmp) : charts.value
  })

  const localOnlyCount = computed(() =>
    charts.value.filter(c => c.syncState === 'local').length,
  )

  async function refresh(): Promise<void> {
    const localList = session.listSavedCharts()
    const cloudList = showCloud.value ? await cloud.listCloud() : []
    charts.value = mergeChartLists(localList, cloudList)
    loadImages()
  }

  /** Render/cache thumbnails + previews. Local & synced read from localStorage;
   *  cloud-only fetch their DSL once, render, cache, and enrich metadata. */
  function loadImages(): void {
    for (const chart of charts.value) {
      if (chart.syncState === 'cloud') {
        void loadCloudImages(chart.id)
        continue
      }
      const cachedThumb = getThumbnail(chart.id)
      const cachedPreview = getPreview(chart.id)
      if (cachedThumb) {
        thumbnails[chart.id] = svgToDataUrl(cachedThumb)
      }
      if (cachedPreview) {
        previews[chart.id] = svgToDataUrl(cachedPreview)
      }
      if (cachedThumb && cachedPreview) {
        continue
      }
      const raw = localStorage.getItem(storageKey(chart.id))
      if (!raw) {
        continue
      }
      try {
        if (!cachedThumb) {
          const svg = renderThumbnailFromStorage(raw)
          if (svg) {
            saveThumbnail(chart.id, svg)
            thumbnails[chart.id] = svgToDataUrl(svg)
          }
        }
        if (!cachedPreview) {
          const preview = renderPreviewFromStorage(raw)
          if (preview) {
            savePreview(chart.id, preview)
            previews[chart.id] = svgToDataUrl(preview)
          }
        }
      }
      catch { /* skip corrupt entries */ }
    }
  }

  async function loadCloudImages(id: string): Promise<void> {
    const cachedThumb = getThumbnail(id)
    const cachedPreview = getPreview(id)
    if (cachedThumb) {
      thumbnails[id] = svgToDataUrl(cachedThumb)
    }
    if (cachedPreview) {
      previews[id] = svgToDataUrl(cachedPreview)
    }
    if (cachedThumb && cachedPreview) {
      return
    }
    const record = await cloud.loadCloud(id)
    if (!record) {
      return
    }
    cacheImagesFromDsl(id, record.dsl)
    const t = getThumbnail(id)
    const p = getPreview(id)
    if (t) {
      thumbnails[id] = svgToDataUrl(t)
    }
    if (p) {
      previews[id] = svgToDataUrl(p)
    }
    // Enrich cloud-only metadata now that we have the DSL.
    const summary = summarizeDsl(record.dsl)
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
    if (cloud.isCloudBacked(id)) {
      await cloud.deleteCloud(id)
      cloud.unmarkCloudBacked(id)
    }
    session.deleteChart(id) // removes localStorage entry, meta, thumbnail
    deletePreview(id)
    delete thumbnails[id]
    delete previews[id]
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
    thumbnails,
    previews,
    sortValue,
    localOnlyCount,
    refresh,
    syncOne,
    remove,
    duplicate,
  }
}
