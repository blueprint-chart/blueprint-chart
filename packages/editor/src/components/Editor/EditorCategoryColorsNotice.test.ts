import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useCategoryColors } from '@/stores/categoryColors'
import { useScenes } from '@/stores/scenes'
import EditorCategoryColorsNotice from './EditorCategoryColorsNotice.vue'

const DATA = '"France" = 10\n"Spain" = 5'

const SERIES_DATA = 'series = "France","Spain"\n"2020" = 1,2'

const button = (wrapper: ReturnType<typeof setup>['wrapper'], name: string) =>
  wrapper.findAll('button').find(b => b.text() === name || b.attributes('aria-label') === name)

function setup(chartType: string = ChartType.BarVertical, data = DATA) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useScenes().reset()
  const config = useChartConfig()
  config.reset()
  config.chartType.value = chartType
  config.data.value = data
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

  describe('applied state', () => {
    it('shows the applied count on a chart type without a colorize list', async () => {
      const { wrapper } = setup(ChartType.BarGrouped, SERIES_DATA)
      await button(wrapper, 'Apply')!.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('1 category color applied')
      expect(button(wrapper, 'Remove')).toBeDefined()
    })

    it('remove deletes exactly the applied entries', async () => {
      const { config, wrapper } = setup(ChartType.BarGrouped, SERIES_DATA)
      config.colorizes.value = [{ target: 'Spain', color: '#ff0000' }]
      await button(wrapper, 'Apply')!.trigger('click')
      await flushPromises()
      await button(wrapper, 'Remove')!.trigger('click')
      await flushPromises()
      expect(config.colorizes.value).toEqual([{ target: 'Spain', color: '#ff0000' }])
    })

    it('stays hidden where the colorize list already shows them', async () => {
      const { wrapper } = setup()
      await button(wrapper, 'Apply')!.trigger('click')
      await flushPromises()
      expect(wrapper.text()).not.toContain('applied')
    })
  })

  it('dismiss hides the offer', async () => {
    const { config, wrapper } = setup()
    await button(wrapper, 'Dismiss')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('.editor-category-colors-notice').exists()).toBe(false)
    expect(config.colorizes.value).toEqual([])
  })
})
