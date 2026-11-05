import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useCategoryColors } from '@/stores/categoryColors'
import { useScenes } from '@/stores/scenes'
import EditorCategoryColorsNotice from './EditorCategoryColorsNotice.vue'

const DATA = '"France" = 10\n"Spain" = 5'

function setup(chartType: string = ChartType.BarGrouped) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useScenes().reset()
  const config = useChartConfig()
  config.reset()
  config.chartType.value = chartType
  config.data.value = DATA
  useCategoryColors().add('France', '#0055A4')
  const wrapper = mount(EditorCategoryColorsNotice, { global: { plugins: [pinia] } })
  return { config, wrapper }
}

describe('EditorCategoryColorsNotice', () => {
  beforeEach(() => localStorage.clear())

  it('shows the match count', () => {
    const { wrapper } = setup()
    expect(wrapper.text()).toContain('1 category matches your colors')
  })

  it('apply adds one colorize per match', async () => {
    const { config, wrapper } = setup()
    await wrapper.find('button').trigger('click')
    expect(config.colorizes.value).toEqual([{ target: 'France', color: '#0055A4' }])
  })

  it('offers nothing after apply', async () => {
    const { config, wrapper } = setup()
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('button').exists()).toBe(false)
    expect(config.colorizes.value).toHaveLength(1)
  })

  it('is hidden for a line chart', () => {
    const { wrapper } = setup(ChartType.Line)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('writes to the active scene\'s colorizes when a scene is selected', async () => {
    const { config, wrapper } = setup()
    const scenes = useScenes()
    scenes.add()
    scenes.add()
    scenes.setActive(1)
    await flushPromises()
    await wrapper.find('button').trigger('click')
    expect(config._base.colorizes.value).toEqual([])
    expect(scenes.scenes.value[1].colorizes).toEqual([{ target: 'France', color: '#0055A4' }])
  })
})
