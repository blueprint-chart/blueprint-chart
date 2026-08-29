import type { ColumnType, ParsedData } from '@/composables/useDataParser'
import { parseBpcData } from '@/composables/useDataParser'
import { serializeTableData } from '@blueprint-chart/lib'
import { useDataTransforms } from '@/composables/useDataTransforms'
import { useScenes } from '@/composables/useScenes'
import { resolveScene } from '@/utils/scenes'

export { serializeTableData }

export type SourceFormat = 'delimited' | 'bpc'

interface DataTableState {
  columns: string[]
  rows: string[][]
  rawInput: string
  columnTypes: ColumnType[]
}

export const useDataTableStore = defineStore('dataTable', () => {
  const state = reactive<DataTableState>({
    columns: [],
    rows: [],
    rawInput: '',
    columnTypes: [],
  })

  const sourceFormat = shallowRef<SourceFormat>('delimited')
  const sourceLabel = shallowRef('')
  const loadedAt = shallowRef<number | null>(null)

  const { steps, applyTransforms, applyStepList } = useDataTransforms()
  const { activeIndex, scenes } = useScenes()

  const displayData = computed(() => {
    // When a scene provides custom data, display that instead of the base dataset
    if (activeIndex.value >= 0) {
      const resolved = resolveScene(scenes.value, activeIndex.value)
      if (resolved?.data) {
        return parseBpcData(resolved.data)
      }
    }

    // One source of truth for what has already been applied. While a scene is
    // selected the store holds *that scene's* steps, so running the resolved
    // list on top of them applied the same steps twice and never ran the base
    // pipeline at all. Compose instead: prior scenes' steps, then the store's.
    let result = { columns: state.columns, rows: state.rows, columnTypes: state.columnTypes }
    const inherited = activeIndex.value > 0
      ? (resolveScene(scenes.value, activeIndex.value - 1)?.transforms ?? [])
      : []
    if (inherited.length > 0 && result.columns.length > 0) {
      result = applyStepList(inherited, result.columns, result.rows, result.columnTypes)
    }
    if (steps.value.length > 0 && result.columns.length > 0) {
      result = applyStepList(steps.value, result.columns, result.rows, result.columnTypes)
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

  /** The source table, without the pipeline. This is what the chart's `data`
   *  block holds: writing the transformed table back would make the next load
   *  re-apply the steps to their own output. */
  function serialize(): string {
    return serializeTableData(state.columns, state.rows)
  }

  /** The source table with the base pipeline applied: what the chart renders.
   *  `null` when there is nothing to apply, so callers keep their own source
   *  string (which preserves percentage cells the table round trip drops). */
  function serializeTransformed(): string | null {
    if (steps.value.length === 0 || state.columns.length === 0) {
      return null
    }
    const out = applyTransforms(state.columns, state.rows, state.columnTypes)
    return serializeTableData(out.columns, out.rows)
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
    serializeTransformed,
    reset,
    hydrate,
  }
})

export function useDataTable() {
  const store = useDataTableStore()
  const {
    columns,
    rows,
    rawInput,
    columnTypes,
    sourceFormat,
    sourceLabel,
    loadedAt,
    displayColumns,
    displayRows,
    displayColumnTypes,
    hasTransforms,
  } = storeToRefs(store)
  return {
    columns,
    rows,
    rawInput,
    columnTypes,
    sourceFormat,
    sourceLabel,
    loadedAt,
    displayColumns,
    displayRows,
    displayColumnTypes,
    hasTransforms,
    loadParsed: store.loadParsed,
    renameColumn: store.renameColumn,
    setColumnType: store.setColumnType,
    serialize: store.serialize,
    serializeTransformed: store.serializeTransformed,
    reset: store.reset,
    hydrate: store.hydrate,
  }
}
