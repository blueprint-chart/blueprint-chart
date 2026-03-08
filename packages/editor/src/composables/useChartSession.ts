import { ref, watch } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useDataTable } from './useDataTable'
import { useDataTransforms } from './useDataTransforms'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useScenes } from './useScenes'
import { useWizard } from './useWizard'
import { useDslSync } from './useDslSync'
import { useDslOutput } from './useDslOutput'
import { parseDelimited } from './useDataParser'
import { deleteThumbnail } from './useChartThumbnail'
import type { ChartSample } from '@blueprint-chart/lib'

interface SessionPayload {
  dsl: string
  wizard: { currentIndex: number, furthestIndex: number }
  savedAt?: string
  /** Raw CSV/TSV input when data was loaded from delimited source (not BPC) */
  rawInput?: string
  sourceLabel?: string
  sourceFormat?: string
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
  wizard: { currentIndex: number, furthestIndex: number }
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

function isLegacyPayload(payload: unknown): payload is LegacySessionPayload {
  return typeof payload === 'object' && payload !== null && 'chartConfig' in payload && !('dsl' in payload)
}

const sessionId = ref('')

export function useChartSession() {
  const chartConfig = useChartConfig()
  const dataTable = useDataTable()
  const transforms = useDataTransforms()
  const chartTypeOptions = useChartTypeOptions()
  const scenesComposable = useScenes()
  const wizard = useWizard()

  function save() {
    if (!sessionId.value) {
      return
    }
    const { dsl } = useDslOutput()
    const payload: SessionPayload = {
      dsl: dsl.value,
      wizard: {
        currentIndex: wizard.currentIndex.value,
        furthestIndex: wizard.furthestIndex.value,
      },
      savedAt: new Date().toISOString(),
    }
    // Preserve raw CSV/TSV input for non-BPC data sources
    if (dataTable.sourceFormat.value === 'delimited' && dataTable.rawInput.value) {
      payload.rawInput = dataTable.rawInput.value
      payload.sourceLabel = dataTable.sourceLabel.value
      payload.sourceFormat = 'delimited'
    }
    localStorage.setItem(storageKey(sessionId.value), JSON.stringify(payload))
  }

  function load(id: string): boolean {
    const raw = localStorage.getItem(storageKey(id))
    if (!raw) {
      return false
    }
    try {
      const parsed = JSON.parse(raw)

      // Migrate legacy payloads: re-save as DSL on next auto-save
      if (isLegacyPayload(parsed)) {
        return loadLegacy(id, parsed)
      }

      const payload = parsed as SessionPayload
      const { applyDsl } = useDslSync()
      const result = applyDsl(payload.dsl)
      if (!result.success) {
        return false
      }

      // Restore CSV/TSV raw input if it was a delimited source
      if (payload.sourceFormat === 'delimited' && payload.rawInput) {
        dataTable.rawInput.value = payload.rawInput
        dataTable.sourceFormat.value = 'delimited'
        if (payload.sourceLabel) {
          dataTable.sourceLabel.value = payload.sourceLabel
        }
      }

      const wizardState = payload.wizard
      if (wizardState.furthestIndex > 2) {
        wizardState.currentIndex = Math.max(0, wizardState.currentIndex - 1)
        wizardState.furthestIndex = Math.max(0, wizardState.furthestIndex - 1)
      }
      wizard.hydrate(wizardState)
      sessionId.value = id
      return true
    }
    catch {
      return false
    }
  }

  function loadLegacy(id: string, payload: LegacySessionPayload): boolean {
    // Best-effort: hydrate config directly, then the next auto-save will store as DSL
    try {
      chartConfig.hydrate(payload.chartConfig as Parameters<typeof chartConfig.hydrate>[0])
      if (payload.dataTable) {
        dataTable.hydrate(payload.dataTable)
      }
      const wizardState = payload.wizard
      if (wizardState.furthestIndex > 2) {
        wizardState.currentIndex = Math.max(0, wizardState.currentIndex - 1)
        wizardState.furthestIndex = Math.max(0, wizardState.furthestIndex - 1)
      }
      wizard.hydrate(wizardState)
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
    wizard.reset()
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
    // Populate data table from TSV
    dataTable.rawInput.value = sample.tsvData
    const parsed = parseDelimited(sample.tsvData)
    dataTable.loadParsed(parsed)

    // Serialize table data into chart config format
    chartConfig.data.value = dataTable.serialize()

    // Apply DSL (sets chart type, title, options, data, etc.)
    const { applyDsl } = useDslSync()
    applyDsl(sample.dsl)

    // Advance wizard to edit step
    wizard.hydrate({ currentIndex: 1, furthestIndex: 1 })
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
        wizard.currentIndex,
        wizard.furthestIndex,
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
        const payload = JSON.parse(raw)
        if (isLegacyPayload(payload)) {
          charts.push({
            id,
            title: payload.chartConfig.title || '',
            description: payload.chartConfig.description || '',
            chartType: payload.chartConfig.chartType || '',
            savedAt: payload.savedAt ?? null,
          })
        }
        else {
          // Extract metadata from DSL string
          const dsl = (payload as SessionPayload).dsl ?? ''
          const titleMatch = dsl.match(/title\s*=\s*"([^"]*)"/)
          const descMatch = dsl.match(/description\s*=\s*"([^"]*)"/)
          const typeMatch = dsl.match(/^chart\s+(\S+)/)
          charts.push({
            id,
            title: titleMatch?.[1] ?? '',
            description: descMatch?.[1] ?? '',
            chartType: typeMatch?.[1] ?? '',
            savedAt: (payload as SessionPayload).savedAt ?? null,
          })
        }
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
