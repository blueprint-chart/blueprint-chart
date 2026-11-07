import { mount } from '@vue/test-utils'
import EditorLineSection from './EditorLineSection.vue'

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
  FormControlCheckbox: { template: '<input type="checkbox" />' },
  FormControlSliderInput: {
    template: '<input type="range" :data-id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'id'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorLineSection', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
  })

  it('renders the fill opacity slider when areaFillOpacity is available', async () => {
    availableOptionKeys.value = ['areaFillOpacity']
    currentOptions.value = { areaFillOpacity: '0.25' }
    const w = mount(EditorLineSection)
    const slider = w.find('[data-id="opt-area-fill-opacity"]')
    expect((slider.element as HTMLInputElement).value).toBe('0.25')
    await slider.setValue('0.5')
    expect(mockSetOption).toHaveBeenCalledWith('areaFillOpacity', '0.5')
  })

  it('hides the fill opacity slider when areaFillOpacity is absent', () => {
    availableOptionKeys.value = ['interpolation']
    const w = mount(EditorLineSection)
    expect(w.find('[data-id="opt-area-fill-opacity"]').exists()).toBe(false)
  })
})
