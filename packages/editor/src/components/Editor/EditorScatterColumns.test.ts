import { mount } from '@vue/test-utils'
import EditorScatterColumns from './EditorScatterColumns.vue'

const setOption = vi.fn()
const currentOptions = ref<Record<string, unknown>>({})
const data = ref('series = "GDP","Life","Pop","Region"\n"France" = 40000,82,67,"Europe"')

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({ currentOptions, setOption }),
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ data }),
}))

describe('EditorScatterColumns', () => {
  beforeEach(() => {
    setOption.mockClear()
    currentOptions.value = {}
  })

  it('shows the inferred column as the auto option', () => {
    const wrapper = mount(EditorScatterColumns)
    expect(wrapper.find('#scatter-x option').text()).toBe('GDP (auto)')
  })

  it('writes a mapping only when it differs from the guess', async () => {
    const wrapper = mount(EditorScatterColumns)
    await wrapper.find('#scatter-x').setValue('Life')
    expect(setOption).toHaveBeenCalledWith('x', 'Life')
  })

  it('offers None for bubble size', () => {
    const wrapper = mount(EditorScatterColumns)
    expect(wrapper.findAll('#scatter-size option').map(o => o.text())).toContain('None')
  })

  it('lists only text columns for color groups', () => {
    const wrapper = mount(EditorScatterColumns)
    expect(wrapper.findAll('#scatter-group option').map(o => o.text())).toEqual(['Region (auto)', 'None'])
  })
})
