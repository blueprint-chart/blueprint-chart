import { mount } from '@vue/test-utils'
import EditorAxisOptions from './EditorAxisOptions.vue'

const mockSetOption = vi.fn()
const availableOptionKeys = ref<string[]>([])
const currentOptions = ref<Record<string, unknown>>({})
const valueLabelPointsDef = {
  key: 'valueLabelPoints',
  type: 'select',
  label: 'Show on',
  choices: [{ value: 'all', text: 'All' }, { value: 'everyN', text: 'Every N' }],
}
const valueLabelEveryDef = { key: 'valueLabelEvery', type: 'text', label: 'Every', placeholder: '2' }
const optionDefs = ref([valueLabelPointsDef, valueLabelEveryDef])

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions,
    optionDefs,
    availableOptionKeys,
    setOption: mockSetOption,
  }),
}))

vi.mock('@/stores/dataTable', () => ({
  useDataTable: () => ({ displayColumnTypes: ref([]) }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  SettingsSection: { template: '<div><slot /></div>' },
  FormControlCheckbox: { template: '<input type="checkbox" />' },
  FormControlButtonGroup: {
    template: '<select :data-label="label" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value" /></select>',
    props: ['modelValue', 'label', 'options'],
    emits: ['update:modelValue'],
  },
  FormControlTextInput: {
    template: '<input :data-label="label" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
  FormControlNumberFormat: {},
  FormControlDateFormat: {},
}))

describe('EditorAxisOptions value labels', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = ['valueLabels', 'valueLabelPoints', 'valueLabelEvery']
    currentOptions.value = { valueLabels: true }
    optionDefs.value = [valueLabelPointsDef, valueLabelEveryDef]
  })

  it('sets valueLabelPoints from the show on choices', async () => {
    const w = mount(EditorAxisOptions)
    await w.find('select[data-label="Show on"]').setValue('everyN')
    expect(mockSetOption).toHaveBeenCalledWith('valueLabelPoints', 'everyN')
  })

  it('shows the every input only for everyN', async () => {
    const w = mount(EditorAxisOptions)
    expect(w.find('input[data-label="Every"]').exists()).toBe(false)
    currentOptions.value = { valueLabels: true, valueLabelPoints: 'everyN' }
    await nextTick()
    await w.find('input[data-label="Every"]').setValue('3')
    expect(mockSetOption).toHaveBeenCalledWith('valueLabelEvery', '3')
  })

  it('hides the every input when the chart has no valueLabelEvery option', () => {
    optionDefs.value = [valueLabelPointsDef]
    currentOptions.value = { valueLabels: true, valueLabelPoints: 'everyN' }
    const w = mount(EditorAxisOptions)
    expect(w.find('input[data-label="Every"]').exists()).toBe(false)
  })

  it('hides the show on choices when the chart has no such option', () => {
    availableOptionKeys.value = ['valueLabels']
    optionDefs.value = []
    const w = mount(EditorAxisOptions)
    expect(w.find('select[data-label="Show on"]').exists()).toBe(false)
  })
})
