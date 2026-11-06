import { mount } from '@vue/test-utils'
import EditorDotPlotSettings from './EditorDotPlotSettings.vue'

const setOption = vi.fn()
const currentOptions = ref<Record<string, unknown>>({})
const data = ref('series = "Poll","High","Low"\n"SPD" = 14,16,12')

vi.mock('@/stores/chartTypeOptions', () => ({
  useChartTypeOptions: () => ({ currentOptions, setOption }),
}))

vi.mock('@/stores/chartConfig', () => ({
  useChartConfig: () => ({ data }),
}))

describe('EditorDotPlotSettings', () => {
  beforeEach(() => {
    setOption.mockClear()
    currentOptions.value = {}
    data.value = 'series = "Poll","High","Low"\n"SPD" = 14,16,12'
  })

  it('shows the detected column as the auto option', () => {
    expect(mount(EditorDotPlotSettings).find('#dot-plot-low option').text()).toBe('Low (auto)')
  })

  it('never shows one column as auto for both roles', () => {
    expect(mount(EditorDotPlotSettings).find('#dot-plot-high option').text()).toBe('High (auto)')
  })

  it('leaves the low column out of the high options', async () => {
    currentOptions.value = { low: 'Poll' }
    const values = mount(EditorDotPlotSettings).findAll('#dot-plot-high option').map(o => o.element.value)
    expect(values).not.toContain('Poll')
    expect(values).toContain('Low')
  })

  it('offers None to turn range mode off', async () => {
    const wrapper = mount(EditorDotPlotSettings)
    await wrapper.find('#dot-plot-low').setValue('none')
    expect(setOption).toHaveBeenCalledWith('low', 'none')
  })

  it('shows None (auto) when nothing is detected', () => {
    data.value = 'series = "2015","2024"\n"a" = 1,2'
    expect(mount(EditorDotPlotSettings).find('#dot-plot-high option').text()).toBe('None (auto)')
  })

  it('toggles arrows', async () => {
    const wrapper = mount(EditorDotPlotSettings)
    await wrapper.find('.editor-dot-plot-settings__arrows input').setValue(true)
    expect(setOption).toHaveBeenCalledWith('arrows', true)
  })
})
