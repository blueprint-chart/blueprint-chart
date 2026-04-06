import { mount } from '@vue/test-utils'
import EditorBarStyleSection from './EditorBarStyleSection.vue'

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
    template: '<input type="checkbox" :data-label="label" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorBarStyleSection', () => {
  beforeEach(() => {
    mockSetOption.mockClear()
    availableOptionKeys.value = []
    currentOptions.value = {}
  })

  describe('categoryLabelLine', () => {
    it('renders checkbox when option is available', () => {
      availableOptionKeys.value = ['categoryLabelLine']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-label="Labels on separate line"]').exists()).toBe(true)
    })

    it('does not render checkbox when option is absent', () => {
      availableOptionKeys.value = ['barBackground']
      const w = mount(EditorBarStyleSection)
      expect(w.find('[data-label="Labels on separate line"]').exists()).toBe(false)
    })
  })
})
