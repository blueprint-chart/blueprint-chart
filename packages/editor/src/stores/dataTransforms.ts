import type { ColumnType } from '@/utils/data/parser'
import { applyParse } from '../utils/transforms/applyParse'
import { applySort } from '../utils/transforms/applySort'
import { applyFilter } from '../utils/transforms/applyFilter'
import { applyHideColumns } from '../utils/transforms/applyHideColumns'
import { applyTranspose } from '../utils/transforms/applyTranspose'
import { applyRename } from '../utils/transforms/applyRename'
import { applyGroupBy } from '../utils/transforms/applyGroupBy'
import { isTypeCompatible, parseOperationMap } from '../utils/transforms/parseOperations'

export type { ParseOperation } from '../utils/transforms/parseOperations'
export { parseOperations } from '../utils/transforms/parseOperations'
export { NULL_VALUE } from '../utils/transforms/applyParse'

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

export const useDataTransformsStore = defineStore('dataTransforms', () => {
  const steps = ref<TransformStep[]>([])
  let nextId = 1

  function addStep(type: TransformType, config: Record<string, string> = {}): string {
    const id = String(nextId++)
    steps.value.push({ id, type, config })
    return id
  }

  function removeStep(id: string) {
    const idx = steps.value.findIndex(s => s.id === id)
    if (idx >= 0) {
      steps.value.splice(idx, 1)
    }
  }

  function updateStep(id: string, config: Record<string, string>) {
    const step = steps.value.find(s => s.id === id)
    if (step) {
      step.config = { ...config }
    }
  }

  function moveStep(id: string, newIndex: number) {
    const idx = steps.value.findIndex(s => s.id === id)
    if (idx < 0 || newIndex < 0 || newIndex >= steps.value.length) {
      return
    }
    const [step] = steps.value.splice(idx, 1)
    steps.value.splice(newIndex, 0, step)
  }

  function applyStepList(stepList: TransformStep[], columns: string[], rows: string[][], columnTypes: ColumnType[]): TransformResult {
    let result: TransformResult = { columns: [...columns], rows: rows.map(r => [...r]), columnTypes: [...columnTypes] }
    for (const step of stepList) {
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
    return applyStepList(steps.value, columns, rows, columnTypes)
  }

  function getColumnsAtStep(stepIndex: number, columns: string[], rows: string[][], columnTypes: ColumnType[]): TransformResult {
    const preceding = steps.value.slice(0, stepIndex)
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
    steps.value = []
    nextId = 1
  }

  function hydrate(newSteps: TransformStep[]) {
    steps.value = newSteps.map(s => ({ ...s, config: { ...s.config } }))
    nextId = newSteps.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0) + 1
  }

  function snapshot(): TransformStep[] {
    return steps.value.map(s => ({ id: s.id, type: s.type, config: { ...s.config } }))
  }

  return {
    steps,
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
})

/**
 * Convenience wrapper for backward compatibility.
 * Returns the store with refs destructured via storeToRefs.
 */
export function useDataTransforms() {
  const store = useDataTransformsStore()
  const { steps } = storeToRefs(store)
  return {
    steps,
    addStep: store.addStep,
    removeStep: store.removeStep,
    updateStep: store.updateStep,
    moveStep: store.moveStep,
    applyStepList: store.applyStepList,
    applyTransforms: store.applyTransforms,
    getColumnsAtStep: store.getColumnsAtStep,
    validateStep: store.validateStep,
    reset: store.reset,
    hydrate: store.hydrate,
    snapshot: store.snapshot,
  }
}
