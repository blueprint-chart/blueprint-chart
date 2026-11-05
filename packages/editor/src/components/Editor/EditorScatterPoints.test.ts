import { mount } from '@vue/test-utils'
import EditorScatterPoints from './EditorScatterPoints.vue'

const setOption = vi.fn()
const currentOptions = ref<Record<string, unknown>>({})

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({ currentOptions, setOption }),
}))

vi.mock('@blueprint-chart/ui', () => ({
  FormControlCheckbox: {
    template: '<input type="checkbox" :data-label="label" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
  },
}))

describe('EditorScatterPoints', () => {
  beforeEach(() => {
    setOption.mockClear()
    currentOptions.value = {}
  })

  it('sets the trend mode', async () => {
    const points = mount(EditorScatterPoints)
    await points.find('#scatter-trend').setValue('per-group')
    expect(setOption).toHaveBeenCalledWith('trend', 'per-group')
  })

  it('toggles point labels', async () => {
    const points = mount(EditorScatterPoints)
    await points.find('[data-label="Label all points"]').setValue(true)
    expect(setOption).toHaveBeenCalledWith('showLabels', true)
  })
})
