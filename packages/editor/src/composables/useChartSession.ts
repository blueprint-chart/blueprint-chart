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

export function useChartSession() {
  const chartConfig = useChartConfig()
  const dataTable = useDataTable()
  const chartTypeOptions = useChartTypeOptions()
  const wizard = useWizard()

  function save() {
    if (!sessionId.value) {
      return
    }
    const payload: SessionPayload = {
      chartConfig: {
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
      },
      dataTable: {
        columns: dataTable.columns.value,
        rows: dataTable.rows.value,
        rawInput: dataTable.rawInput.value,
        columnTypes: dataTable.columnTypes.value,
      },
      chartTypeOptions: { ...chartTypeOptions.store },
      wizard: {
        currentIndex: wizard.currentIndex.value,
        furthestIndex: wizard.furthestIndex.value,
      },
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(storageKey(sessionId.value), JSON.stringify(payload))
  }

  function load(id: string): boolean {
    const raw = localStorage.getItem(storageKey(id))
    if (!raw) {
      return false
    }
    try {
      const payload: SessionPayload = JSON.parse(raw)
      chartConfig.hydrate(payload.chartConfig)
      dataTable.hydrate(payload.dataTable)
      chartTypeOptions.hydrate(payload.chartTypeOptions)
      const wizardState = payload.wizard
      // Migrate old 4-step indices (upload=0,check=1,edit=2,export=3) to 3-step (data=0,edit=1,export=2)
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
    chartTypeOptions.reset()
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
        const payload: SessionPayload = JSON.parse(raw)
        charts.push({
          id,
          title: payload.chartConfig.title || '',
          description: payload.chartConfig.description || '',
          chartType: payload.chartConfig.chartType || '',
          savedAt: payload.savedAt ?? null,
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
