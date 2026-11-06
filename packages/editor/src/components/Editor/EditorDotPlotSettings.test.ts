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
    currentOptions.value = { dotStyle: 'range' }
    data.value = 'series = "Poll","High","Low"\n"SPD" = 14,16,12'
  })

  it('shows the detected column as the auto option', () => {
    expect(mount(EditorDotPlotSettings).find('#dot-plot-low option').text()).toBe('Low (auto)')
  })

  it('never shows one column as auto for both roles', () => {
    expect(mount(EditorDotPlotSettings).find('#dot-plot-high option').text()).toBe('High (auto)')
  })

  it('leaves the low column out of the high options', async () => {
    currentOptions.value = { dotStyle: 'range', low: 'Poll' }
    const values = mount(EditorDotPlotSettings).findAll('#dot-plot-high option').map(o => (o.element as HTMLOptionElement).value)
    expect(values).not.toContain('Poll')
    expect(values).toContain('Low')
  })

  it('hides the low and high pickers in dumbbell style', () => {
    currentOptions.value = {}
    const wrapper = mount(EditorDotPlotSettings)
    expect(wrapper.find('#dot-plot-low').exists()).toBe(false)
    expect(wrapper.find('#dot-plot-high').exists()).toBe(false)
  })

  it('switches the style explicitly', async () => {
    currentOptions.value = {}
    const group = mount(EditorDotPlotSettings).findAllComponents({ name: 'FormControlButtonGroup' }).find(g => g.classes('editor-dot-plot-settings__style'))!
    expect(group.props('modelValue')).toBe('dumbbell')
    await group.vm.$emit('update:modelValue', 'range')
    expect(setOption).toHaveBeenCalledWith('dotStyle', 'range')
  })

  it('does not offer None, the style turns range off', () => {
    const values = mount(EditorDotPlotSettings).findAll('#dot-plot-low option').map(o => (o.element as HTMLOptionElement).value)
    expect(values).not.toContain('none')
  })

  it('shows None (auto) when nothing is detected', () => {
    data.value = 'series = "2015","2024"\n"a" = 1,2'
    expect(mount(EditorDotPlotSettings).find('#dot-plot-high option').text()).toBe('None (auto)')
  })

  describe('arrows', () => {
    const arrowsGroup = (wrapper: ReturnType<typeof mount>) => wrapper.findAllComponents({ name: 'FormControlButtonGroup' }).find(group => group.classes('editor-dot-plot-settings__arrows'))!
    const entryTexts = (wrapper: ReturnType<typeof mount>) => arrowsGroup(wrapper).findAllComponents({ name: 'FormControlButtonGroupEntry' }).map(entry => entry.props('text'))

    beforeEach(() => {
      currentOptions.value = {}
      data.value = 'series = "2015","2024"\n"a" = 1,2'
    })

    it('labels the directions without column names', () => {
      expect(entryTexts(mount(EditorDotPlotSettings))).toEqual(['None', 'Forward', 'Backward', 'Both'])
    })

    it('gives every direction an icon', () => {
      const icons = arrowsGroup(mount(EditorDotPlotSettings)).findAllComponents({ name: 'FormControlButtonGroupEntry' }).map(entry => entry.props('iconLeft'))
      expect(icons.every(Boolean)).toBe(true)
    })

    it('stores the picked direction', async () => {
      const group = arrowsGroup(mount(EditorDotPlotSettings))
      expect(group.props('modelValue')).toBe('none')
      await group.vm.$emit('update:modelValue', 'backward')
      expect(setOption).toHaveBeenCalledWith('arrows', 'backward')
    })
  })
})
