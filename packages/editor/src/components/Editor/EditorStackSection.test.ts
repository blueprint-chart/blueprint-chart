import { mount } from '@vue/test-utils'
import EditorStackSection from './EditorStackSection.vue'

const mockSetOption = vi.fn()
const availableOptionKeys = ref<string[]>([])
const currentOptions = ref<Record<string, unknown>>({})

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({
    currentOptions,
    availableOptionKeys,
    setOption: mockSetOption,
  }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlCheckbox: {
    template: '<input type="checkbox" data-id="show-total" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorStackSection', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
  })

  it('sets showTotal from its checkbox', async () => {
    availableOptionKeys.value = ['stackMode', 'showTotal']
    const w = mount(EditorStackSection)
    await w.find('[data-id="show-total"]').setValue(true)
    expect(mockSetOption).toHaveBeenCalledWith('showTotal', true)
  })

  it('hides the show total checkbox when the option is absent', () => {
    availableOptionKeys.value = ['stackMode']
    const w = mount(EditorStackSection)
    expect(w.find('[data-id="show-total"]').exists()).toBe(false)
  })

  it('hides the show total checkbox in percent mode', () => {
    availableOptionKeys.value = ['stackMode', 'showTotal']
    currentOptions.value = { stackMode: 'percent' }
    const w = mount(EditorStackSection)
    expect(w.find('[data-id="show-total"]').exists()).toBe(false)
  })
})
