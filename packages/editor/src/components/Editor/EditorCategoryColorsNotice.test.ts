import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useCategoryColors } from '@/stores/categoryColors'
import { useScenes } from '@/stores/scenes'
import EditorCategoryColorsNotice from './EditorCategoryColorsNotice.vue'

const DATA = '"France" = 10\n"Spain" = 5'

function setup(chartType: string = ChartType.BarVertical) {
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

  it('is hidden for a series-keyed chart with label-only data', () => {
    const { wrapper } = setup(ChartType.BarGrouped)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('computes matches against the active scene\'s colorizes, not the base', async () => {
    const { config, wrapper } = setup()
    config._base.colorizes.value = [{ target: 'France', color: '#ff0000' }]
    const scenes = useScenes()
    scenes.add()
    scenes.add()
    scenes.update(1, { colorizes: [{ target: 'Spain', color: '#00ff00' }] })
    scenes.setActive(1)
    await flushPromises()
    expect(wrapper.text()).toContain('1 category matches your colors')
    await wrapper.find('button').trigger('click')
    expect(scenes.scenes.value[1].colorizes).toEqual([
      { target: 'Spain', color: '#00ff00' },
      { target: 'France', color: '#0055A4' },
    ])
    expect(config._base.colorizes.value).toEqual([{ target: 'France', color: '#ff0000' }])
  })
})
