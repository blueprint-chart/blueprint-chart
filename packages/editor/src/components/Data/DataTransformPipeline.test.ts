/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent } from 'vue'
import DataTransformPipeline from './DataTransformPipeline.vue'

const columns = ref(['Name', 'Value'])
const rows = ref([['A', '1'], ['B', '2']])
const columnTypes = ref(['string', 'number'])

let stepIdCounter = 0
const steps = ref<Array<{ id: string, type: string, config: Record<string, string> }>>([])

vi.mock('@/composables/useDataTable', () => ({
  useDataTable: () => ({
    columns,
    rows,
    columnTypes,
  }),
}))

vi.mock('@/composables/useDataTransforms', () => ({
  useDataTransforms: () => ({
    steps,
    addStep: (type: string, config: Record<string, string> = {}) => {
      const id = String(++stepIdCounter)
      steps.value = [...steps.value, { id, type, config }]
      return id
    },
    removeStep: (id: string) => {
      steps.value = steps.value.filter(s => s.id !== id)
    },
    applyTransforms: () => ({ columns: columns.value, rows: rows.value, columnTypes: columnTypes.value }),
    getColumnsAtStep: () => ({ columns: columns.value, columnTypes: columnTypes.value }),
    validateStep: (step: { type: string, config: Record<string, string> }) => {
      if (step.type === 'filter' && !step.config.column) {
        return 'No column selected'
      }
      if (step.type === 'group-by' && !step.config.groupColumns) {
        return 'No group columns selected'
      }
      return null
    },
  }),
}))

const AddButtonStub = defineComponent({
  name: 'DataTransformAddButton',
  emits: ['add'],
  template: '<button class="add-stub" @click="$emit(\'add\', \'filter\')">Add</button>',
})

const StepCardStub = defineComponent({
  name: 'DataTransformStepCard',
  props: {
    step: { type: Object, required: true },
    index: { type: Number, required: true },
    active: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  emits: ['select', 'delete'],
  template: `<div class="step-card-stub" :data-error="error || ''" :data-step-id="step.id">
    <slot />
    <button class="select-btn" @click="$emit('select')" />
    <button class="delete-btn" @click="$emit('delete')" />
  </div>`,
})

function mountPipeline() {
  return mount(DataTransformPipeline, {
    global: {
      stubs: {
        DataTransformSourceBlock: { template: '<div />' },
        DataTransformOutputBlock: { template: '<div />' },
        DataTransformConnector: { template: '<div />' },
        DataTransformAddButton: AddButtonStub,
        DataTransformStepCard: StepCardStub,
        DataTransformStepSort: { template: '<div />' },
        DataTransformStepFilter: { template: '<div />' },
        DataTransformStepHideColumns: { template: '<div />' },
        DataTransformStepParse: { template: '<div />' },
        DataTransformStepRename: { template: '<div />' },
        DataTransformStepGroupBy: { template: '<div />' },
      },
    },
  })
}

describe('DataTransformPipeline', () => {
  beforeEach(() => {
    stepIdCounter = 0
    steps.value = []
  })

  it('suppresses validation error on newly added step', async () => {
    const w = mountPipeline()

    await w.find('.add-stub').trigger('click')
    await w.vm.$nextTick()

    const cards = w.findAll('.step-card-stub')
    expect(cards.length).toBe(1)
    // Newly added step is pristine — error should be suppressed
    expect(cards[0].attributes('data-error')).toBe('')
  })

  it('shows validation error after selecting away from pristine step', async () => {
    const w = mountPipeline()

    // Add first filter step
    await w.find('.add-stub').trigger('click')
    await w.vm.$nextTick()

    let cards = w.findAll('.step-card-stub')
    expect(cards[0].attributes('data-error')).toBe('')

    // Add a second step — selecting it makes the first no longer pristine
    await w.find('.add-stub').trigger('click')
    await w.vm.$nextTick()

    cards = w.findAll('.step-card-stub')
    expect(cards.length).toBe(2)
    // First step lost pristine status
    expect(cards[0].attributes('data-error')).toBe('No column selected')
    // Second step is still pristine
    expect(cards[1].attributes('data-error')).toBe('')
  })

  it('keeps pristine state when re-selecting the same step', async () => {
    const w = mountPipeline()

    await w.find('.add-stub').trigger('click')
    await w.vm.$nextTick()

    let cards = w.findAll('.step-card-stub')
    expect(cards[0].attributes('data-error')).toBe('')

    // Click select on the same step
    await cards[0].find('.select-btn').trigger('click')
    await w.vm.$nextTick()

    cards = w.findAll('.step-card-stub')
    expect(cards[0].attributes('data-error')).toBe('')
  })

  it('cleans up pristine state when step is removed', async () => {
    const w = mountPipeline()

    await w.find('.add-stub').trigger('click')
    await w.vm.$nextTick()

    let cards = w.findAll('.step-card-stub')
    expect(cards.length).toBe(1)

    await cards[0].find('.delete-btn').trigger('click')
    await w.vm.$nextTick()

    cards = w.findAll('.step-card-stub')
    expect(cards.length).toBe(0)
  })

  it('shows error immediately for steps not added through UI', async () => {
    // Pre-populate steps (e.g. loaded from saved state)
    steps.value = [{ id: '99', type: 'filter', config: {} }]
    stepIdCounter = 99

    const w = mountPipeline()
    await w.vm.$nextTick()

    const cards = w.findAll('.step-card-stub')
    expect(cards.length).toBe(1)
    expect(cards[0].attributes('data-error')).toBe('No column selected')
  })
})
