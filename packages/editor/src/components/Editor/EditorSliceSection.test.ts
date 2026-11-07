import { mount } from '@vue/test-utils'
import EditorSliceSection from './EditorSliceSection.vue'

const mockSetOption = vi.fn()
const availableOptionKeys = ref<string[]>([])
const currentOptions = ref<Record<string, unknown>>({})
const optionDefs = ref<unknown[]>([])

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions,
    optionDefs,
    availableOptionKeys,
    setOption: mockSetOption,
  }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlCheckbox: { template: '<input type="checkbox" />' },
  FormControlSliderInput: { template: '<input type="range" />' },
  FormControlNumberFormat: {
    template: '<input :data-id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'id', 'label'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorSliceSection', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
  })

  it('sets the number format from its control', async () => {
    availableOptionKeys.value = ['verticalNumberFormat']
    const w = mount(EditorSliceSection)
    await w.find('[data-id="opt-verticalNumberFormat"]').setValue('.1%')
    expect(mockSetOption).toHaveBeenCalledWith('verticalNumberFormat', '.1%')
  })

  it('hides the number format control when the option is absent', () => {
    availableOptionKeys.value = ['showValues']
    const w = mount(EditorSliceSection)
    expect(w.find('[data-id="opt-verticalNumberFormat"]').exists()).toBe(false)
  })
  it('shows the slice input only in slice mode', () => {
    availableOptionKeys.value = ['showTotal', 'centerLabel', 'centerSlice', 'centerText', 'totalLabel']
    currentOptions.value = { showTotal: true, centerLabel: 'slice' }
    const w = mount(EditorSliceSection)
    expect(w.find('#opt-centerSlice').exists()).toBe(true)
    expect(w.find('#opt-centerText').exists()).toBe(false)
    expect(w.find('#opt-totalLabel').exists()).toBe(false)
  })
})
