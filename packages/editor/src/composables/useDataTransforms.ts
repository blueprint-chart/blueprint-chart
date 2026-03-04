import { reactive, toRefs } from 'vue'
import type { ColumnType } from './useDataParser'
import { applyParse } from './transforms/applyParse'
import { applySort } from './transforms/applySort'
import { applyFilter } from './transforms/applyFilter'
import { applyHideColumns } from './transforms/applyHideColumns'
import { applyTranspose } from './transforms/applyTranspose'
import { applyRename } from './transforms/applyRename'
import { applyGroupBy } from './transforms/applyGroupBy'
import { isTypeCompatible, parseOperationMap } from './transforms/parseOperations'

export type { ParseOperation } from './transforms/parseOperations'
export { parseOperations } from './transforms/parseOperations'
export { NULL_VALUE } from './transforms/applyParse'

export type TransformType = 'sort' | 'filter' | 'hide-columns' | 'transpose' | 'parse' | 'rename' | 'group-by' | 'computed'

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
        case 'hide-columns':
          result = applyHideColumns(result, step.config)
          break
        case 'transpose':
          result = applyTranspose(result)
          break
        case 'parse':
          result = applyParse(result, step.config)
          break
        case 'rename':
          result = applyRename(result, step.config)
          break
        case 'group-by':
          result = applyGroupBy(result, step.config)
          break
        // computed is not yet implemented
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

  function validateStep(step: TransformStep, columns: string[], columnTypes: ColumnType[]): string | null {
    const { config } = step

    if (config.column && !columns.includes(config.column)) {
      return `Column "${config.column}" not found`
    }

    if (step.type === 'parse' && config.column && config.operation) {
      const colIndex = columns.indexOf(config.column)
      if (colIndex >= 0 && !isTypeCompatible(config.operation, columnTypes[colIndex])) {
        const op = parseOperationMap.get(config.operation)
        return `${op?.label ?? config.operation} requires ${op?.accepts.join(' or ')} column, got ${columnTypes[colIndex]}`
      }
    }

    if (step.type === 'rename') {
      if (!config.column) {
        return 'No column selected'
      }
      if (!config.newName) {
        return 'New name is required'
      }
      return null
    }

    if (step.type === 'filter' && !config.column) {
      return 'No column selected'
    }

    if (step.type === 'sort' && !config.column && !config.columns) {
      return 'No column selected'
    }

    if (step.type === 'group-by') {
      if (!config.groupColumns) {
        return 'No group columns selected'
      }
      if (!config.aggregates) {
        return 'No aggregates defined'
      }
      return null
    }

    return null
  }

  function reset() {
    state.steps = []
    nextId = 1
  }

  function hydrate(steps: TransformStep[]) {
    state.steps = steps.map(s => ({ ...s, config: { ...s.config } }))
    nextId = steps.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) + 1
  }

  function snapshot(): TransformStep[] {
    return state.steps.map(s => ({ id: s.id, type: s.type, config: { ...s.config } }))
  }

  return {
    ...toRefs(state),
    addStep,
    removeStep,
    updateStep,
    moveStep,
    applyStepList,
    applyTransforms,
    getColumnsAtStep,
    validateStep,
    reset,
    hydrate,
    snapshot,
  }
}
