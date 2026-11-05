import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ChartType } from '@blueprint-chart/lib'
import { FormControlPalette } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useCustomPalettes } from '@/stores/customPalettes'
import { useScenes } from '@/stores/scenes'
import EditorColorSection from './EditorColorSection.vue'

function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  useScenes().reset()
  useChartConfig().reset()
  useChartConfig().chartType.value = ChartType.BarGrouped
  const customPalettes = useCustomPalettes()
  customPalettes.create('Brand', ['#111111', '#222222', '#333333'])
  const wrapper = mount(EditorColorSection, {
    global: { plugins: [pinia], stubs: { Teleport: true } },
  })
  return { wrapper, id: customPalettes.palettes.value[0].id, options: useChartTypeOptions() }
}

describe('EditorColorSection custom palettes', () => {
  beforeEach(() => localStorage.clear())

  it('lists custom palettes in the picker', () => {
    const { wrapper, id } = setup()
    const palettes = wrapper.findComponent(FormControlPalette).props('palettes')
    expect(palettes).toContainEqual({
      value: `custom:${id}`,
      label: 'Brand',
      colors: ['#111111', '#222222', '#333333'],
      group: 'Your palettes',
    })
  })

  it('picking a custom palette writes colors and clears colorPalette', async () => {
    const { wrapper, id, options } = setup()
    wrapper.findComponent(FormControlPalette).vm.$emit('update:modelValue', `custom:${id}`)
    await flushPromises()
    expect(options.currentOptions.value.colors).toEqual(['#111111', '#222222', '#333333'])
    expect(options.currentOptions.value.colorPalette).toBe('')
  })
})
