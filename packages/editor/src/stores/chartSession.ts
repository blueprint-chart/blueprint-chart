import { useChartConfig } from '@/stores/chartConfig'
import { useDataTable } from '@/stores/dataTable'
import { useDataTransforms } from '@/stores/dataTransforms'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'
import { useDslSync } from '@/composables/useDslSync'
import { useDslOutput } from '@/composables/useDslOutput'
import { parseDelimited } from '@/composables/useDataParser'
import { deleteThumbnail } from '@/composables/useChartThumbnail'
import { parse, type ChartSample, toBool } from '@blueprint-chart/lib'

/**
 * Bumped when the meaning of a stored document changes.
 *
 * v2: the `data` block holds source data and `transform` blocks are a pipeline
 * that has not been applied to it yet.
 * v1 (no marker): `data` held the pipeline's *output* and the blocks were kept
 * beside it, so re-deriving from it would apply every step a second time.
 */
const SCHEMA_VERSION = 2

interface SessionMeta {
  schema?: number
  savedAt?: string
  rawInput?: string
  sourceLabel?: string
  sourceFormat?: string
  sheetNumber?: string | null
  sheetId?: string
  // Legacy fields (ignored on load, not written on save)
  wizard?: unknown
}

// Legacy payload shape for migration
interface LegacySessionPayload {
  chartConfig: Parameters<ReturnType<typeof useChartConfig>['hydrate']>[0]
  dataTable?: { columns: string[], rows: string[][], rawInput: string }
  wizard?: unknown
  savedAt?: string
}

export interface SavedChartSummary {
  id: string
  title: string
  description: string
  chartType: string
  savedAt: string | null
  sceneCount: number
  rowCount: number
  allowDarkMode: boolean
  sheetNumber: string | null
  sheetId: string
}

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateId(): string {
  let id = ''
  for (let i = 0; i < 11; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}

export function storageKey(id: string): string {
  return `blueprint-chart:${id}`
}

/** Single-segment slugs under the `blueprint-chart:` namespace that hold app
 *  state rather than charts. listSavedCharts() must skip these — otherwise the
 *  key is parsed as a phantom chart (e.g. `cloud-index` → an empty chart).
 *  `cloud-index` mirrors CLOUD_INDEX_KEY in cloudCharts.ts. */
const RESERVED_SLUGS = new Set(['cloud-index'])

export function metaKey(id: string): string {
  return `blueprint-chart:${id}:meta`
}

/** Read and parse the JSON meta sidecar for a chart id; {} if absent/corrupt. */
export function readLocalMeta(id: string): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(metaKey(id)) || '{}') as Record<string, unknown>
  }
  catch {
    return {}
  }
}

export interface DslSummary {
  title: string
  description: string
  chartType: string
  sceneCount: number
  rowCount: number
  allowDarkMode: boolean
}

/** Extract display metadata from a raw BPC DSL string via lightweight regex. */
export function summarizeDsl(dsl: string): DslSummary {
  const titleMatch = dsl.match(/title\s*=\s*"([^"]*)"/)
  const descMatch = dsl.match(/description\s*=\s*"([^"]*)"/)
  const typeMatch = dsl.match(/^chart\s+(\S+)/)
  const sceneMatches = dsl.match(/\bscene\s+"/g)
  const dataBlock = dsl.match(/data\s*\{([^}]*)\}/)
  const dataRows = dataBlock
    ? dataBlock[1].split('\n').filter(l => l.trim() && l.includes('=')).length
    : 0
  const darkModeMatch = dsl.match(/allowDarkMode\s*=\s*(true|false)/i)
  return {
    title: titleMatch?.[1] ?? '',
    description: descMatch?.[1] ?? '',
    chartType: typeMatch?.[1] ?? '',
    sceneCount: sceneMatches?.length ?? 0,
    rowCount: dataRows,
    allowDarkMode: darkModeMatch ? toBool(darkModeMatch[1]) : true,
  }
}

function isLegacyPayload(raw: string): boolean {
  return raw.trimStart().startsWith('{')
}

export const useChartSessionStore = defineStore('chartSession', () => {
  const sessionId = shallowRef('')
  const lastSavedAt = shallowRef<string | null>(null)
  const deletedElsewhere = shallowRef(false)
  /** The last id this tab actually wrote. Its key going missing means the
   *  chart was deleted elsewhere, not that the session is merely new. */
  const persistedId = shallowRef('')
  const sheetNumber = ref<string | null>(null)
  const sheetId = ref<string>('')

  let stopWatcher: (() => void) | null = null

  function stopAutoSave() {
    stopWatcher?.()
    stopWatcher = null
  }

  const chartConfig = useChartConfig()
  const dataTable = useDataTable()
  const transforms = useDataTransforms()
  const chartTypeOptions = useChartTypeOptions()
  const scenesComposable = useScenes()

  function save() {
    if (!sessionId.value) {
      return
    }
    // Writing a chart this tab has already persisted, whose key is now gone,
    // would undo a delete the user confirmed as final in another tab.
    if (persistedId.value === sessionId.value && localStorage.getItem(storageKey(sessionId.value)) === null) {
      deletedElsewhere.value = true
      stopAutoSave()
      return
    }
    const { generateDsl } = useDslOutput()
    localStorage.setItem(storageKey(sessionId.value), generateDsl())

    const now = new Date().toISOString()
    const meta: SessionMeta = {
      schema: SCHEMA_VERSION,
      savedAt: now,
      sheetNumber: sheetNumber.value,
      sheetId: sheetId.value,
    }
    if (dataTable.sourceFormat.value === 'delimited' && dataTable.rawInput.value) {
      meta.rawInput = dataTable.rawInput.value
      meta.sourceLabel = dataTable.sourceLabel.value
      meta.sourceFormat = 'delimited'
    }
    localStorage.setItem(metaKey(sessionId.value), JSON.stringify(meta))
    lastSavedAt.value = now
    persistedId.value = sessionId.value
  }

  function load(id: string): boolean {
    const raw = localStorage.getItem(storageKey(id))
    if (!raw) {
      return false
    }
    try {
      // Legacy JSON payloads start with '{'
      if (isLegacyPayload(raw)) {
        const parsed = JSON.parse(raw)
        if (parsed.chartConfig) {
          return loadLegacy(id, parsed as LegacySessionPayload)
        }
      }

      // Raw DSL string
      const { applyDsl } = useDslSync()
      const result = applyDsl(raw)
      if (!result.success) {
        return false
      }

      // Load sidecar metadata. An unparseable sidecar reads as absent: the
      // chart itself is intact, and dropping it over one bad optional byte
      // makes it unopenable.
      const loadedMeta = readLocalMeta(id) as SessionMeta

      if (loadedMeta.sourceFormat === 'delimited' && loadedMeta.rawInput) {
        dataTable.rawInput.value = loadedMeta.rawInput
        dataTable.sourceFormat.value = 'delimited'
        if (loadedMeta.sourceLabel) {
          dataTable.sourceLabel.value = loadedMeta.sourceLabel
        }
      }

      // Provenance, not content: a pre-v2 document's `data` block is the
      // pipeline's output, so its steps are already applied. Adopt the data as
      // it stands and drop the steps instead of re-deriving from an output; the
      // next save stamps it as v2. Scene transforms are untouched: they were
      // never baked into the data block.
      if (loadedMeta.schema !== SCHEMA_VERSION) {
        transforms.reset()
      }

      sessionId.value = id
      persistedId.value = id
      deletedElsewhere.value = false
      lastSavedAt.value = loadedMeta.savedAt ?? null
      sheetNumber.value = loadedMeta.sheetNumber ?? null
      sheetId.value = loadedMeta.sheetId ?? crypto.randomUUID()
      return true
    }
    catch {
      return false
    }
  }

  function loadLegacy(id: string, payload: LegacySessionPayload): boolean {
    try {
      chartConfig.hydrate(payload.chartConfig)
      if (payload.dataTable) {
        dataTable.hydrate(payload.dataTable)
      }
      sessionId.value = id
      sheetNumber.value = null
      sheetId.value = crypto.randomUUID()
      return true
    }
    catch {
      return false
    }
  }

  function resetAll() {
    deletedElsewhere.value = false
    persistedId.value = ''
    chartConfig.reset()
    dataTable.reset()
    transforms.reset()
    chartTypeOptions.reset()
    scenesComposable.reset()
    sessionId.value = ''
  }

  function prepareNew() {
    resetAll()
    lastSavedAt.value = null
    sheetNumber.value = null
    sheetId.value = crypto.randomUUID()
  }

  function assignSheetNumber() {
    if (sheetNumber.value !== null) {
      return
    }
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith('blueprint-chart:') && k.endsWith(':meta'))
    let max = 0
    for (const key of allKeys) {
      try {
        const meta = JSON.parse(localStorage.getItem(key) || '{}') as { sheetNumber?: string | null }
        if (meta.sheetNumber) {
          const n = parseInt(meta.sheetNumber, 10)
          if (Number.isFinite(n) && n > max) {
            max = n
          }
        }
      }
      catch { /* skip corrupt entries */ }
    }
    sheetNumber.value = String(max + 1).padStart(3, '0')
    save()
  }

  function createSession(): string {
    sessionId.value = generateId()
    save()
    startAutoSave()
    return sessionId.value
  }

  function newChart() {
    resetAll()
    sessionId.value = generateId()
    sheetNumber.value = null
    sheetId.value = crypto.randomUUID()
  }

  function loadSample(sample: ChartSample) {
    dataTable.rawInput.value = sample.tsvData
    const parsed = parseDelimited(sample.tsvData)
    dataTable.loadParsed(parsed)
    chartConfig.data.value = dataTable.serialize()

    const { applyDsl } = useDslSync()
    applyDsl(sample.dsl)
  }

  function loadChart(id: string): boolean {
    return load(id)
  }

  /**
   * Create a fresh session and populate it from a BPC DSL string.
   *
   * Validates the source via `parse()` before mutating any store state.
   * Returns the new sessionId on success, or `null` if the input is empty
   * or fails to parse — in which case no session is created.
   */
  function createFromDsl(dsl: string): string | null {
    if (!dsl) {
      return null
    }
    try {
      // Validate up-front so a parse failure leaves stores untouched.
      parse(dsl)
    }
    catch {
      return null
    }

    resetAll()
    const { applyDsl } = useDslSync()
    const result = applyDsl(dsl)
    if (!result.success) {
      // Defensive: applyDsl re-parses internally; if it fails here, roll back.
      resetAll()
      return null
    }

    sessionId.value = generateId()
    sheetNumber.value = null
    sheetId.value = crypto.randomUUID()
    save()
    startAutoSave()
    return sessionId.value
  }

  function startAutoSave() {
    stopAutoSave()
    stopWatcher = watch(
      [
        chartConfig.chartType,
        chartConfig.title,
        chartConfig.description,
        chartConfig.byline,
        chartConfig.note,
        chartConfig.source,
        chartConfig.sourceUrl,
        chartConfig.sort,
        chartConfig.data,
        chartConfig.selectedColumn,
        chartConfig.colorizes,
        chartConfig.highlights,
        chartConfig.areaFills,
        chartConfig.annotations,
        chartConfig.seriesOverrides,
        chartConfig.layout,
        dataTable.columns,
        dataTable.rows,
        dataTable.rawInput,
        dataTable.columnTypes,
        transforms.steps,
        scenesComposable.scenes,
        scenesComposable.activeIndex,
        () => chartTypeOptions.store,
      ],
      save,
      { deep: true, flush: 'post' },
    )
  }

  function listSavedCharts(): SavedChartSummary[] {
    const charts: SavedChartSummary[] = []
    const prefix = 'blueprint-chart:'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(prefix)) {
        continue
      }
      const id = key.slice(prefix.length)
      if (id.includes(':') || RESERVED_SLUGS.has(id)) {
        continue
      }
      const raw = localStorage.getItem(key)
      if (!raw) {
        continue
      }
      try {
        // Legacy JSON
        if (isLegacyPayload(raw)) {
          const payload = JSON.parse(raw)
          if (payload.chartConfig) {
            charts.push({
              id,
              title: payload.chartConfig.title || '',
              description: payload.chartConfig.description || '',
              chartType: payload.chartConfig.chartType || '',
              savedAt: payload.savedAt ?? null,
              sceneCount: payload.chartConfig.scenes?.length ?? 0,
              rowCount: payload.chartConfig.data
                ? (payload.chartConfig.data as string).split('\n').filter((l: string) => l.trim()).length - 1
                : 0,
              allowDarkMode: payload.chartConfig.allowDarkMode ?? true,
              sheetNumber: null,
              sheetId: '',
            })
            continue
          }
        }

        // Raw DSL string — extract metadata with the shared summarizer.
        const summary = summarizeDsl(raw)
        const parsedMeta = readLocalMeta(id) as SessionMeta
        charts.push({
          id,
          title: summary.title,
          description: summary.description,
          chartType: summary.chartType,
          savedAt: parsedMeta.savedAt ?? null,
          sceneCount: summary.sceneCount,
          rowCount: summary.rowCount,
          allowDarkMode: summary.allowDarkMode,
          sheetNumber: parsedMeta.sheetNumber ?? null,
          sheetId: parsedMeta.sheetId ?? '',
        })
      }
      catch {
        // skip corrupt entries
      }
    }
    charts.sort((a, b) => {
      if (!a.savedAt && !b.savedAt) {
        return 0
      }
      if (!a.savedAt) {
        return 1
      }
      if (!b.savedAt) {
        return -1
      }
      return b.savedAt.localeCompare(a.savedAt)
    })
    return charts
  }

  function deleteChart(id: string) {
    localStorage.removeItem(storageKey(id))
    localStorage.removeItem(metaKey(id))
    deleteThumbnail(id)
  }

  return {
    sessionId,
    lastSavedAt,
    deletedElsewhere,
    sheetNumber,
    sheetId,
    save,
    load,
    prepareNew,
    assignSheetNumber,
    createSession,
    newChart,
    loadSample,
    loadChart,
    createFromDsl,
    startAutoSave,
    listSavedCharts,
    deleteChart,
  }
})

export function useChartSession() {
  const store = useChartSessionStore()
  const { sessionId, lastSavedAt, deletedElsewhere, sheetNumber, sheetId } = storeToRefs(store)
  return {
    sessionId,
    lastSavedAt,
    deletedElsewhere,
    sheetNumber,
    sheetId,
    save: store.save,
    load: store.load,
    prepareNew: store.prepareNew,
    assignSheetNumber: store.assignSheetNumber,
    createSession: store.createSession,
    newChart: store.newChart,
    loadSample: store.loadSample,
    loadChart: store.loadChart,
    createFromDsl: store.createFromDsl,
    startAutoSave: store.startAutoSave,
    listSavedCharts: store.listSavedCharts,
    deleteChart: store.deleteChart,
  }
}
