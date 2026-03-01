import { reactive, toRefs } from 'vue'
import type { ColumnType } from './useDataParser'

export type TransformType = 'sort' | 'filter' | 'transpose' | 'group-by' | 'computed' | 'pivot'

export interface TransformStep {
  id: string
  type: TransformType
  config: Record<string, string>
}

export interface TransformResult {
  columns: string[]
  rows: string[][]
  columnTypes: ColumnType[]
}

const state = reactive({
  steps: [] as TransformStep[],
})

let nextId = 1

function compareValues(a: string, b: string, type: ColumnType): number {
  if (type === 'number') {
    const na = Number(a.replace(/[,%$€£¥₹]/g, '').trim()) || 0
    const nb = Number(b.replace(/[,%$€£¥₹]/g, '').trim()) || 0
    return na - nb
  }
  if (type === 'date') {
    const da = Date.parse(a) || 0
    const db = Date.parse(b) || 0
    return da - db
  }
  return a.localeCompare(b)
}

function applySort(data: TransformResult, config: Record<string, string>): TransformResult {
  const colIndex = data.columns.indexOf(config.column)
  if (colIndex < 0 || !config.column) {
    return data
  }
  const dir = config.direction === 'descending' ? -1 : 1
  const type = data.columnTypes[colIndex] ?? 'string'
  const sorted = [...data.rows].sort((a, b) => dir * compareValues(a[colIndex] ?? '', b[colIndex] ?? '', type))
  return { ...data, rows: sorted }
}

function matchesCondition(value: string, condition: string, target: string): boolean {
  if (!target && condition !== 'equals' && condition !== 'not-equals') {
    return true
  }
  switch (condition) {
    case 'equals':
      return value === target
    case 'not-equals':
      return value !== target
    case 'contains':
      return value.toLowerCase().includes(target.toLowerCase())
    case 'greater-than': {
      const num = Number(value.replace(/[,%$€£¥₹]/g, '').trim())
      const tgt = Number(target)
      return !Number.isNaN(num) && !Number.isNaN(tgt) && num > tgt
    }
    case 'less-than': {
      const num = Number(value.replace(/[,%$€£¥₹]/g, '').trim())
      const tgt = Number(target)
      return !Number.isNaN(num) && !Number.isNaN(tgt) && num < tgt
    }
    default:
      return true
  }
}

function applyFilter(data: TransformResult, config: Record<string, string>): TransformResult {
  const colIndex = data.columns.indexOf(config.column)
  if (colIndex < 0 || !config.column) {
    return data
  }
  const filtered = data.rows.filter(row =>
    matchesCondition(row[colIndex] ?? '', config.condition ?? 'equals', config.value ?? ''),
  )
  return { ...data, rows: filtered }
}

function applyTranspose(data: TransformResult): TransformResult {
  if (data.rows.length === 0 || data.columns.length === 0) {
    return data
  }

  // First column values become new column headers
  // Old column headers (except first) become first column values
  const newColumns = ['Field', ...data.rows.map(r => r[0] ?? '')]
  const newRows: string[][] = []
  const newTypes: ColumnType[] = ['string']

  for (let ci = 1; ci < data.columns.length; ci++) {
    const row = [data.columns[ci]]
    for (let ri = 0; ri < data.rows.length; ri++) {
      row.push(data.rows[ri][ci] ?? '')
    }
    newRows.push(row)
  }

  // Detect types for each new column
  for (let i = 0; i < data.rows.length; i++) {
    const vals = newRows.map(r => r[i + 1] ?? '').filter(v => v.length > 0)
    if (vals.length > 0 && vals.every(v => !Number.isNaN(Number(v.replace(/[,%$€£¥₹]/g, '').trim())) && v.trim().length > 0)) {
      newTypes.push('number')
    }
    else {
      newTypes.push('string')
    }
  }

  return { columns: newColumns, rows: newRows, columnTypes: newTypes }
}

export function useDataTransforms() {
  function addStep(type: TransformType, config: Record<string, string> = {}): string {
    const id = String(nextId++)
    state.steps.push({ id, type, config })
    return id
  }

  function removeStep(id: string) {
    const idx = state.steps.findIndex(s => s.id === id)
    if (idx >= 0) {
      state.steps.splice(idx, 1)
    }
  }

  function updateStep(id: string, config: Record<string, string>) {
    const step = state.steps.find(s => s.id === id)
    if (step) {
      step.config = { ...config }
    }
  }

  function moveStep(id: string, newIndex: number) {
    const idx = state.steps.findIndex(s => s.id === id)
    if (idx < 0 || newIndex < 0 || newIndex >= state.steps.length) {
      return
    }
    const [step] = state.steps.splice(idx, 1)
    state.steps.splice(newIndex, 0, step)
  }

  function applyStepList(steps: TransformStep[], columns: string[], rows: string[][], columnTypes: ColumnType[]): TransformResult {
    let result: TransformResult = { columns: [...columns], rows: rows.map(r => [...r]), columnTypes: [...columnTypes] }
    for (const step of steps) {
      switch (step.type) {
        case 'sort':
          result = applySort(result, step.config)
          break
        case 'filter':
          result = applyFilter(result, step.config)
          break
        case 'transpose':
          result = applyTranspose(result)
          break
        // group-by, computed, pivot are not yet implemented
      }
    }
    return result
  }

  function applyTransforms(columns: string[], rows: string[][], columnTypes: ColumnType[]): TransformResult {
    return applyStepList(state.steps, columns, rows, columnTypes)
  }

  function getColumnsAtStep(stepIndex: number, columns: string[], rows: string[][], columnTypes: ColumnType[]): TransformResult {
    const preceding = state.steps.slice(0, stepIndex)
    return applyStepList(preceding, columns, rows, columnTypes)
  }

  function reset() {
    state.steps = []
    nextId = 1
  }

  return {
    ...toRefs(state),
    addStep,
    removeStep,
    updateStep,
    moveStep,
    applyTransforms,
    getColumnsAtStep,
    reset,
  }
}
