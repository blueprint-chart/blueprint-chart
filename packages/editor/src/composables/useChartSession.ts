import { ref, watch } from 'vue'
import { useChartConfig } from './useChartConfig'
import { useDataTable } from './useDataTable'
import { useChartTypeOptions } from './useChartTypeOptions'
import { useWizard } from './useWizard'
import { useDslSync } from './useDslSync'
import { parseDelimited } from './useDataParser'
import { deleteThumbnail } from './useChartThumbnail'
import type { ChartConfig } from './useChartConfig'
import type { ChartTypeOptions } from './useChartTypeOptions'
import type { ColumnType } from './useDataParser'
import type { ChartSample } from '@blueprint-chart/lib'

interface SessionPayload {
  chartConfig: ChartConfig
  dataTable: { columns: string[], rows: string[][], rawInput: string, columnTypes?: ColumnType[] }
  chartTypeOptions: Record<string, Partial<ChartTypeOptions>>
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

const sessionId = ref('')

function buildChartConfigPayload(chartConfig: ReturnType<typeof useChartConfig>): ChartConfig {
  return {
    chartType: chartConfig.chartType.value,
    title: chartConfig.title.value,
    description: chartConfig.description.value,
    byline: chartConfig.byline.value,
    note: chartConfig.note.value,
    source: chartConfig.source.value,
    sourceUrl: chartConfig.sourceUrl.value,
    sort: chartConfig.sort.value,
    data: chartConfig.data.value,
    selectedColumn: chartConfig.selectedColumn.value,
    highlights: chartConfig.highlights.value,
    areaFills: chartConfig.areaFills.value,
    annotations: chartConfig.annotations.value,
    seriesOverrides: chartConfig.seriesOverrides.value,
    layout: chartConfig.layout.value,
  }
}

function buildDataTablePayload(dataTable: ReturnType<typeof useDataTable>) {
  return {
    columns: dataTable.columns.value,
    rows: dataTable.rows.value,
    rawInput: dataTable.rawInput.value,
    columnTypes: dataTable.columnTypes.value,
  }
}

function buildSessionPayload(
  chartConfig: ReturnType<typeof useChartConfig>,
  dataTable: ReturnType<typeof useDataTable>,
  chartTypeOptions: ReturnType<typeof useChartTypeOptions>,
  wizard: ReturnType<typeof useWizard>,
): SessionPayload {
  return {
    chartConfig: buildChartConfigPayload(chartConfig),
    dataTable: buildDataTablePayload(dataTable),
    chartTypeOptions: { ...chartTypeOptions.store },
    wizard: {
      currentIndex: wizard.currentIndex.value,
      furthestIndex: wizard.furthestIndex.value,
    },
    savedAt: new Date().toISOString(),
  }
}

function parseSavedEntry(key: string, prefix: string): SavedChartSummary | null {
  const id = key.slice(prefix.length)
  if (id.includes(':')) {
    return null
  }
  const raw = localStorage.getItem(key)
  if (!raw) {
    return null
  }
  try {
    const payload: SessionPayload = JSON.parse(raw)
    return {
      id,
      title: payload.chartConfig.title || '',
      description: payload.chartConfig.description || '',
      chartType: payload.chartConfig.chartType || '',
      savedAt: payload.savedAt ?? null,
    }
  }
  catch {
    return null
  }
}

function sortByDate(charts: SavedChartSummary[]): void {
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
}

function autoSaveWatchSources(
  chartConfig: ReturnType<typeof useChartConfig>,
  dataTable: ReturnType<typeof useDataTable>,
  wizard: ReturnType<typeof useWizard>,
  chartTypeOptions: ReturnType<typeof useChartTypeOptions>,
) {
  return [
    chartConfig.chartType, chartConfig.title, chartConfig.description,
    chartConfig.byline, chartConfig.note, chartConfig.source, chartConfig.sourceUrl,
    chartConfig.sort, chartConfig.data, chartConfig.selectedColumn,
    chartConfig.highlights, chartConfig.areaFills, chartConfig.annotations,
    chartConfig.seriesOverrides, chartConfig.layout,
    dataTable.columns, dataTable.rows, dataTable.rawInput, dataTable.columnTypes,
    wizard.currentIndex, wizard.furthestIndex,
    () => chartTypeOptions.store,
  ]
}

interface SessionDeps {
  chartConfig: ReturnType<typeof useChartConfig>
  dataTable: ReturnType<typeof useDataTable>
  chartTypeOptions: ReturnType<typeof useChartTypeOptions>
  wizard: ReturnType<typeof useWizard>
}

function saveSession(deps: SessionDeps) {
  if (!sessionId.value) {
    return
  }
  const payload = buildSessionPayload(deps.chartConfig, deps.dataTable, deps.chartTypeOptions, deps.wizard)
  localStorage.setItem(storageKey(sessionId.value), JSON.stringify(payload))
}

function loadSession(id: string, deps: SessionDeps): boolean {
  const raw = localStorage.getItem(storageKey(id))
  if (!raw) {
    return false
  }
  try {
    const payload: SessionPayload = JSON.parse(raw)
    deps.chartConfig.hydrate(payload.chartConfig)
    deps.dataTable.hydrate(payload.dataTable)
    deps.chartTypeOptions.hydrate(payload.chartTypeOptions)
    deps.wizard.hydrate(payload.wizard)
    sessionId.value = id
    return true
  }
  catch {
    return false
  }
}

function resetAll(deps: SessionDeps) {
  deps.chartConfig.reset()
  deps.dataTable.reset()
  deps.chartTypeOptions.reset()
  deps.wizard.reset()
  sessionId.value = ''
}

function loadSampleInto(sample: ChartSample, deps: SessionDeps) {
  deps.dataTable.rawInput.value = sample.tsvData
  const parsed = parseDelimited(sample.tsvData)
  deps.dataTable.loadParsed(parsed)
  deps.chartConfig.data.value = deps.dataTable.serialize()
  const { applyDsl } = useDslSync()
  applyDsl(sample.dsl)
  deps.wizard.hydrate({ currentIndex: 2, furthestIndex: 2 })
}

function listSavedChartsFromStorage(): SavedChartSummary[] {
  const charts: SavedChartSummary[] = []
  const prefix = 'blueprint-chart:'
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(prefix)) {
      continue
    }
    const entry = parseSavedEntry(key, prefix)
    if (entry) {
      charts.push(entry)
    }
  }
  sortByDate(charts)
  return charts
}

function deleteChartFromStorage(id: string) {
  localStorage.removeItem(storageKey(id))
  deleteThumbnail(id)
}

function createSessionAction(deps: SessionDeps, save: () => void, startAutoSave: () => void): string {
  sessionId.value = generateId()
  save()
  startAutoSave()
  return sessionId.value
}

function newChartAction(deps: SessionDeps) {
  resetAll(deps)
  sessionId.value = generateId()
}

function buildStartAutoSave(deps: SessionDeps, save: () => void) {
  return () => {
    watch(
      autoSaveWatchSources(deps.chartConfig, deps.dataTable, deps.wizard, deps.chartTypeOptions),
      save,
      { deep: true, flush: 'post' },
    )
  }
}

export function useChartSession() {
  const deps: SessionDeps = {
    chartConfig: useChartConfig(),
    dataTable: useDataTable(),
    chartTypeOptions: useChartTypeOptions(),
    wizard: useWizard(),
  }
  const save = () => saveSession(deps)
  const startAutoSave = buildStartAutoSave(deps, save)

  return buildSessionApi(deps, save, startAutoSave)
}

function buildSessionApi(deps: SessionDeps, save: () => void, startAutoSave: () => void) {
  return {
    sessionId,
    save,
    load: (id: string) => loadSession(id, deps),
    prepareNew: () => resetAll(deps),
    createSession: () => createSessionAction(deps, save, startAutoSave),
    newChart: () => newChartAction(deps),
    loadSample: (sample: ChartSample) => loadSampleInto(sample, deps),
    loadChart: (id: string) => loadSession(id, deps),
    startAutoSave,
    listSavedCharts: listSavedChartsFromStorage,
    deleteChart: deleteChartFromStorage,
  }
}
