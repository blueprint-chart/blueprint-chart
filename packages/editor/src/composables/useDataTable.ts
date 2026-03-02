import { reactive, ref, toRefs, computed } from 'vue'
import type { ColumnType, ParsedData } from './useDataParser'
import { useDataTransforms } from './useDataTransforms'

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

export function useDataTable() {
  const { steps, applyTransforms } = useDataTransforms()

  const displayData = computed(() => {
    if (steps.value.length === 0) {
      return { columns: state.columns, rows: state.rows, columnTypes: state.columnTypes }
    }
    return applyTransforms(state.columns, state.rows, state.columnTypes)
  })

  const displayColumns = computed(() => displayData.value.columns)
  const displayRows = computed(() => displayData.value.rows)
  const displayColumnTypes = computed(() => displayData.value.columnTypes)
  const hasTransforms = computed(() => steps.value.length > 0)

  function loadParsed(parsed: ParsedData) {
    state.columns = [...parsed.columns]
    state.rows = parsed.rows.map(r => [...r])
    state.columnTypes = parsed.columnTypes ? [...parsed.columnTypes] : parsed.columns.map(() => 'string' as ColumnType)
  }

  function renameColumn(index: number, name: string) {
    if (index >= 0 && index < state.columns.length) {
      state.columns[index] = name
    }
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    if (state.rows[rowIndex]) {
      state.rows[rowIndex][colIndex] = value
    }
  }

  function deleteRow(index: number) {
    if (index >= 0 && index < state.rows.length) {
      state.rows.splice(index, 1)
    }
  }

  function setColumnType(index: number, type: ColumnType) {
    if (index >= 0 && index < state.columnTypes.length) {
      state.columnTypes[index] = type
    }
  }

  function serialize(): string {
    const cols = displayColumns.value
    const rows = displayRows.value

    if (cols.length <= 2) {
      return rows
        .map((row) => {
          const label = row[0] ?? ''
          const value = row[1] ?? ''
          return `"${label}" = ${value}`
        })
        .join('\n')
    }

    const seriesNames = cols.slice(1)
    const header = `_series = "${seriesNames.join(',')}"`
    const lines = rows.map((row) => {
      const label = row[0] ?? ''
      const values = row.slice(1).map(v => v ?? '').join(',')
      return `"${label}" = "${values}"`
    })
    return [header, ...lines].join('\n')
  }

  function reset() {
    state.columns = []
    state.rows = []
    state.rawInput = ''
    state.columnTypes = []
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
    displayColumns,
    displayRows,
    displayColumnTypes,
    hasTransforms,
    loadParsed,
    renameColumn,
    updateCell,
    deleteRow,
    setColumnType,
    serialize,
    reset,
    hydrate,
  }
}
