import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PalettesCategoryColorPicker from './PalettesCategoryColorPicker.vue'
import { CUSTOM_PALETTES_KEY } from '@/stores/customPalettes'

function mountPicker(modelValue = '#000000') {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PalettesCategoryColorPicker, {
    props: {
      'modelValue': modelValue,
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
    },
    global: { plugins: [pinia], stubs: { teleport: true } },
  })
}

let wrapper: ReturnType<typeof mountPicker>

describe('PalettesCategoryColorPicker', () => {
  beforeEach(() => localStorage.clear())

  it('custom palettes come first', () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    wrapper = mountPicker()
    const titles = wrapper.findAll('.palettes-category-color-picker__group__title')
    expect(titles[0].text()).toBe('Seeded')
    expect(titles.length).toBeGreaterThan(1)
  })

  it('clicking a swatch updates the model', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    wrapper = mountPicker()
    await wrapper.findAll('.palettes-category-color-picker__group__swatch')[1].trigger('click')
    expect(wrapper.props('modelValue')).toBe('#445566')
  })
})
