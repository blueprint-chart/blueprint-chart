import type { ColumnType } from '@/utils/data/parser'
import type { TransformResult, TransformStep as TransformStepInput } from '@blueprint-chart/lib'
import { applyTransformSteps, isTypeCompatible, parseOperationMap, TransformType } from '@blueprint-chart/lib'

export type { ParseOperation, TransformResult } from '@blueprint-chart/lib'
export { parseOperations, NULL_VALUE } from '@blueprint-chart/lib'

export { TransformType }

export interface TransformStep extends TransformStepInput {
  id: string
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
    return applyTransformSteps(stepList, columns, rows, columnTypes)
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

    if (step.type === TransformType.Parse && config.column && config.operation) {
      const colIndex = columns.indexOf(config.column)
      if (colIndex >= 0 && !isTypeCompatible(config.operation, columnTypes[colIndex])) {
        const op = parseOperationMap.get(config.operation)
        return `${op?.label ?? config.operation} requires ${op?.accepts.join(' or ')} column, got ${columnTypes[colIndex]}`
      }
    }

    if (step.type === TransformType.Rename) {
      if (!config.column) {
        return 'No column selected'
      }
      if (!config.newName) {
        return 'New name is required'
      }
      return null
    }

    if (step.type === TransformType.Filter && !config.column) {
      return 'No column selected'
    }

    if (step.type === TransformType.Sort && !config.column && !config.columns) {
      return 'No column selected'
    }

    if (step.type === TransformType.GroupBy) {
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
