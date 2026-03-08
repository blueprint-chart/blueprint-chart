import { ref, watch } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useDataTable } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useDslSync } from './useDslSync'
import { useDslOutput } from './useDslOutput'
import { parseDelimited } from './useDataParser'
import { deleteThumbnail } from './useChartThumbnail'
import type { ChartSample } from '@blueprint-chart/lib'

interface SessionMeta {
  savedAt?: string
  rawInput?: string
  sourceLabel?: string
  sourceFormat?: string
  // Legacy fields (ignored on load, not written on save)
  wizard?: unknown
}

// Legacy payload shape for migration
interface LegacySessionPayload {
  chartConfig: {
    chartType: string
    title: string
    description: string
    [key: string]: unknown
  }
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
}

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateId(): string {
  let id = ''
  for (let i = 0; i < 11; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}

function storageKey(id: string): string {
  return `blueprint-chart:${id}`
}

function metaKey(id: string): string {
  return `blueprint-chart:${id}:meta`
}

function isLegacyPayload(raw: string): boolean {
  return raw.trimStart().startsWith('{')
}

const sessionId = ref('')

export function useChartSession() {
  const chartConfig = useChartConfig()
  const dataTable = useDataTable()
  const transforms = useDataTransforms()
  const chartTypeOptions = useChartTypeOptions()
  const scenesComposable = useScenes()

  function save() {
    if (!sessionId.value) {
      return
    }
    const { dsl } = useDslOutput()
    localStorage.setItem(storageKey(sessionId.value), dsl.value)

    const meta: SessionMeta = {
      savedAt: new Date().toISOString(),
    }
    if (dataTable.sourceFormat.value === 'delimited' && dataTable.rawInput.value) {
      meta.rawInput = dataTable.rawInput.value
      meta.sourceLabel = dataTable.sourceLabel.value
      meta.sourceFormat = 'delimited'
    }
    localStorage.setItem(metaKey(sessionId.value), JSON.stringify(meta))
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

      // Load sidecar metadata
      const metaRaw = localStorage.getItem(metaKey(id))
      if (metaRaw) {
        const meta: SessionMeta = JSON.parse(metaRaw)

        if (meta.sourceFormat === 'delimited' && meta.rawInput) {
          dataTable.rawInput.value = meta.rawInput
          dataTable.sourceFormat.value = 'delimited'
          if (meta.sourceLabel) {
            dataTable.sourceLabel.value = meta.sourceLabel
          }
        }
      }

      sessionId.value = id
      return true
    }
    catch {
      return false
    }
  }

  function loadLegacy(id: string, payload: LegacySessionPayload): boolean {
    try {
      chartConfig.hydrate(payload.chartConfig as Parameters<typeof chartConfig.hydrate>[0])
      if (payload.dataTable) {
        dataTable.hydrate(payload.dataTable)
      }
      sessionId.value = id
      return true
    }
    catch {
      return false
    }
  }

  function resetAll() {
    chartConfig.reset()
    dataTable.reset()
    transforms.reset()
    chartTypeOptions.reset()
    scenesComposable.reset()
    sessionId.value = ''
  }

  function prepareNew() {
    resetAll()
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

  function startAutoSave() {
    watch(
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
      if (id.includes(':')) {
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
            })
            continue
          }
        }

        // Raw DSL string — extract metadata with regex
        const titleMatch = raw.match(/title\s*=\s*"([^"]*)"/)
        const descMatch = raw.match(/description\s*=\s*"([^"]*)"/)
        const typeMatch = raw.match(/^chart\s+(\S+)/)
        const metaRaw = localStorage.getItem(metaKey(id))
        const savedAt = metaRaw ? (JSON.parse(metaRaw) as SessionMeta).savedAt ?? null : null
        charts.push({
          id,
          title: titleMatch?.[1] ?? '',
          description: descMatch?.[1] ?? '',
          chartType: typeMatch?.[1] ?? '',
          savedAt,
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
    save,
    load,
    prepareNew,
    createSession,
    newChart,
    loadSample,
    loadChart,
    startAutoSave,
    listSavedCharts,
    deleteChart,
  }
}
