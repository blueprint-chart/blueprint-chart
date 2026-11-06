import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PalettesCategoryColorPicker from './PalettesCategoryColorPicker.vue'
import { CUSTOM_PALETTES_KEY } from '@/stores/customPalettes'
import { ColorSwatchGroupsKey } from '@blueprint-chart/ui'

type PickerWrapper = VueWrapper<InstanceType<typeof PalettesCategoryColorPicker>>

let wrapper: PickerWrapper

function mountPicker(modelValue = '#000000', provide: Record<symbol, unknown> = {}): PickerWrapper {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(PalettesCategoryColorPicker, {
    props: {
      'label': 'Color',
      'modelValue': modelValue,
      'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
    },
    global: { plugins: [pinia], stubs: { teleport: true }, provide },
  })
}

describe('PalettesCategoryColorPicker', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('listens for Escape only while open', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    wrapper = mountPicker()
    expect(add.mock.calls.some(([type]) => type === 'keydown')).toBe(false)
    const trigger = wrapper.find('.palettes-category-color-picker__trigger')
    await trigger.trigger('click')
    expect(add.mock.calls.some(([type]) => type === 'keydown')).toBe(true)
    await trigger.trigger('click')
    expect(remove.mock.calls.some(([type]) => type === 'keydown')).toBe(true)
  })

  it('closes on Escape', async () => {
    wrapper = mountPicker()
    const trigger = wrapper.find('.palettes-category-color-picker__trigger')
    await trigger.trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('opens the swatches from the color button', async () => {
    wrapper = mountPicker('#0055a4')
    const trigger = wrapper.find('.palettes-category-color-picker__trigger')
    expect(trigger.text()).toBe('#0055a4')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('custom palettes come first', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    wrapper = mountPicker()
    await wrapper.find('.palettes-category-color-picker__trigger').trigger('click')
    const titles = wrapper.findAll('.form-control-color-input-swatches__group__title')
    expect(titles[0].text()).toBe('Seeded')
    expect(titles.length).toBeGreaterThan(1)
  })

  it('clicking a swatch updates the model', async () => {
    localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify([
      { id: 'seed0000001', label: 'Seeded', colors: ['#112233', '#445566'] },
    ]))
    wrapper = mountPicker()
    await wrapper.find('.palettes-category-color-picker__trigger').trigger('click')
    await wrapper.findAll('.form-control-color-input-swatches__group__swatch')[1].trigger('click')
    expect(wrapper.props('modelValue')).toBe('#445566')
  })

  it('uses the shared color picker instead of the native one', async () => {
    wrapper = mountPicker('#0055a4')
    await wrapper.find('.palettes-category-color-picker__trigger').trigger('click')
    expect(wrapper.find('.form-control-color-input-picker').exists()).toBe(true)
    expect(wrapper.find('input[type="color"]').exists()).toBe(false)
  })

  it('closes after picking a swatch', async () => {
    wrapper = mountPicker()
    const trigger = wrapper.find('.palettes-category-color-picker__trigger')
    await trigger.trigger('click')
    await wrapper.find('.form-control-color-input-swatches__group__swatch').trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })

  it('does not offer the category colors being edited', async () => {
    const appGroups = ref([{ label: 'Category colors', swatches: [{ name: 'France', color: '#0055a4' }] }])
    wrapper = mountPicker('#000000', { [ColorSwatchGroupsKey as symbol]: appGroups })
    await wrapper.find('.palettes-category-color-picker__trigger').trigger('click')
    const titles = wrapper.findAll('.form-control-color-input-swatches__group__title').map(title => title.text())
    expect(titles).not.toContain('Category colors')
  })
})
