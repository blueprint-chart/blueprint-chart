import { reactive, ref, shallowRef, toRefs, computed } from 'vue'
import type { ColumnType, ParsedData } from './useDataParser'
import { useDataTransforms } from './useDataTransforms'
import { useScenes } from './useScenes'
import { resolveScene } from './useChartPreview'

export type SourceFormat = 'delimited' | 'bpc'

interface DataTableState {
  columns: string[]
  rows: string[][]
  rawInput: string
  columnTypes: ColumnType[]
}

const state = reactive<DataTableState>({
  columns: [],
  rows: [],
  rawInput: '',
  columnTypes: [],
})

const sourceFormat = ref<SourceFormat>('delimited')
const sourceLabel = shallowRef('')
const loadedAt = ref<number | null>(null)

function formatValue(v: string): string {
  if (/^-?\d+(\.\d+)?%?$/.test(v)) {
    return v
  }
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function serializeTableData(cols: string[], rows: string[][]): string {
  if (cols.length <= 2) {
    return rows
      .map((row) => {
        const label = row[0] ?? ''
        const value = row[1] ?? ''
        return `"${label}" = ${formatValue(value)}`
      })
      .join('\n')
  }

  const seriesNames = cols.slice(1)
  const header = `_series = ${seriesNames.map(n => `"${n}"`).join(',')}`
  const lines = rows.map((row) => {
    const label = row[0] ?? ''
    const values = row.slice(1).map(v => formatValue(v ?? '')).join(',')
    return `"${label}" = ${values}`
  })
  return [header, ...lines].join('\n')
}

export function useDataTable() {
  const { steps, applyTransforms, applyStepList } = useDataTransforms()
  const { activeIndex, scenes } = useScenes()

  const displayData = computed(() => {
    let result = { columns: state.columns, rows: state.rows, columnTypes: state.columnTypes }
    if (steps.value.length > 0) {
      result = applyTransforms(state.columns, state.rows, state.columnTypes)
    }
    // When a scene is active, apply inherited transforms from prior scenes
    if (activeIndex.value >= 0 && result.columns.length > 0) {
      const resolved = resolveScene(scenes.value, activeIndex.value)
      if (resolved?.transforms?.length) {
        result = applyStepList(resolved.transforms, result.columns, result.rows, result.columnTypes)
      }
    }
    return result
  })

  const displayColumns = computed(() => displayData.value.columns)
  const displayRows = computed(() => displayData.value.rows)
  const displayColumnTypes = computed(() => displayData.value.columnTypes)
  const hasTransforms = computed(() => steps.value.length > 0)

  function loadParsed(parsed: ParsedData, source?: { label?: string }) {
    state.columns = [...parsed.columns]
    state.rows = parsed.rows.map(r => [...r])
    state.columnTypes = parsed.columnTypes ? [...parsed.columnTypes] : parsed.columns.map(() => 'string' as ColumnType)
    loadedAt.value = Date.now()
    if (source?.label) {
      sourceLabel.value = source.label
    }
  }

  function renameColumn(index: number, name: string) {
    if (index >= 0 && index < state.columns.length) {
      state.columns[index] = name
    }
  }

  function setColumnType(index: number, type: ColumnType) {
    if (index >= 0 && index < state.columnTypes.length) {
      state.columnTypes[index] = type
    }
  }

  function serialize(): string {
    return serializeTableData(displayColumns.value, displayRows.value)
  }

  function reset() {
    state.columns = []
    state.rows = []
    state.rawInput = ''
    state.columnTypes = []
    sourceLabel.value = ''
    loadedAt.value = null
  }

  function hydrate(snapshot: { columns: string[], rows: string[][], rawInput: string, columnTypes?: ColumnType[] }) {
    state.columns = snapshot.columns
    state.rows = snapshot.rows
    state.rawInput = snapshot.rawInput
    state.columnTypes = snapshot.columnTypes ?? snapshot.columns.map(() => 'string' as ColumnType)
  }

  return {
    ...toRefs(state),
    sourceFormat,
    sourceLabel,
    loadedAt,
    displayColumns,
    displayRows,
    displayColumnTypes,
    hasTransforms,
    loadParsed,
    renameColumn,
    setColumnType,
    serialize,
    reset,
    hydrate,
  }
}
