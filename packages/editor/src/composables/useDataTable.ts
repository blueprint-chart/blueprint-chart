import { reactive, toRefs } from 'vue'
import type { ColumnType, ParsedData } from './useDataParser'

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

function serializeTwoColumn(): string {
  return state.rows
    .map((row) => {
      const label = row[0] ?? ''
      const value = row[1] ?? ''
      return `"${label}" = ${value}`
    })
    .join('\n')
}

function serializeMultiSeries(): string {
  const seriesNames = state.columns.slice(1)
  const header = `_series = "${seriesNames.join(',')}"`
  const lines = state.rows.map((row) => {
    const label = row[0] ?? ''
    const values = row.slice(1).map(v => v ?? '').join(',')
    return `"${label}" = "${values}"`
  })
  return [header, ...lines].join('\n')
}

function serialize(): string {
  if (state.columns.length <= 2) {
    return serializeTwoColumn()
  }
  return serializeMultiSeries()
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

export function useDataTable() {
  return {
    ...toRefs(state),
    loadParsed,
    renameColumn,
    updateCell,
    deleteRow,
    serialize,
    reset,
    hydrate,
  }
}
