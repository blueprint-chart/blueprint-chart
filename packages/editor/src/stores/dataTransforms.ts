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
  // While a scene is selected, `steps` holds that scene's pipeline and the
  // chart-level pipeline is stashed here (#145).
  const baseSteps = ref<TransformStep[]>([])
  // Guards enter/exit idempotence: a deferred watcher re-run or a reset that
  // races scene deselection must not re-stash or restore an empty stash.
  let stashed = false
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

  /** Swap the chart-level pipeline out for a scene's; no-op stash if one is already held. */
  function enterScene(sceneSteps: TransformStep[]) {
    if (!stashed) {
      baseSteps.value = snapshot()
      stashed = true
    }
    hydrate(sceneSteps)
  }

  /** Restore the stashed chart-level pipeline and return the scene's steps.
   *  Returns null when nothing is stashed, so a second call cannot wipe the
   *  pipeline or write the base steps into a scene. */
  function exitScene(): TransformStep[] | null {
    if (!stashed) {
      return null
    }
    const sceneSteps = snapshot()
    hydrate(baseSteps.value)
    baseSteps.value = []
    stashed = false
    return sceneSteps
  }

  function reset() {
    steps.value = []
    baseSteps.value = []
    stashed = false
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
    baseSteps,
    enterScene,
    exitScene,
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
  const { steps, baseSteps } = storeToRefs(store)
  return {
    steps,
    baseSteps,
    enterScene: store.enterScene,
    exitScene: store.exitScene,
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
