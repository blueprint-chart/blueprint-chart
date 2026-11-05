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

  it('lists Custom first, then your palettes, then the built-in ones', () => {
    const { wrapper, id } = setup()
    const palettes = wrapper.findComponent(FormControlPalette).props('palettes')
    expect(palettes?.slice(0, 3).map(p => [p.value, p.group])).toEqual([
      ['', undefined],
      [`custom:${id}`, 'Your palettes'],
      ['Blueprint', 'Built-in'],
    ])
  })

  it('picking a custom palette writes colors and clears colorPalette', async () => {
    const { wrapper, id, options } = setup()
    wrapper.findComponent(FormControlPalette).vm.$emit('update:modelValue', `custom:${id}`)
    await flushPromises()
    expect(options.currentOptions.value.colors).toEqual(['#111111', '#222222', '#333333'])
    expect(options.currentOptions.value.colorPalette).toBe('')
  })

  it('picking a missing custom palette leaves colorPalette unchanged', async () => {
    const { wrapper, options } = setup()
    const before = options.currentOptions.value.colorPalette
    wrapper.findComponent(FormControlPalette).vm.$emit('update:modelValue', 'custom:missing')
    await flushPromises()
    expect(options.currentOptions.value.colorPalette).toBe(before)
  })

  it('shows the custom palette whose colors the chart uses, ignoring case', async () => {
    const { wrapper, options } = setup()
    const letters = useCustomPalettes().create('Letters', ['#aabbcc', '#ddeeff'])!
    options.setOption('colorPalette', '')
    options.setOption('colors', ['#AABBCC', '#DDEEFF'])
    await flushPromises()
    expect(wrapper.findComponent(FormControlPalette).props('modelValue')).toBe(`custom:${letters.id}`)
  })

  it('shows Custom when the colors match no palette in order', async () => {
    const { wrapper, options } = setup()
    options.setOption('colorPalette', '')
    options.setOption('colors', ['#222222', '#111111', '#333333'])
    await flushPromises()
    expect(wrapper.findComponent(FormControlPalette).props('modelValue')).toBe('')
  })
})
