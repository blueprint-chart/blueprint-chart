import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import FormControlColorInputPicker from './FormControlColorInputPicker.vue'
import { ColorSwatchGroupsKey } from '../../../../composables/injection-keys'

function factory(modelValue = '#ff0000') {
  return mount(FormControlColorInputPicker, { props: { modelValue } })
}

function lastEmitted(wrapper: ReturnType<typeof factory>) {
  const emissions = wrapper.emitted('update:modelValue') ?? []
  return emissions[emissions.length - 1]?.[0]
}

function stubAreaRect(wrapper: ReturnType<typeof factory>) {
  const area = wrapper.find('.form-control-color-input-picker__area')
  const rect = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0 }
  area.element.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect })
  area.element.setPointerCapture = () => {}
  return area
}

describe('FormControlColorInputPicker saturation area', () => {
  it('picks saturation and value from the pointer position', async () => {
    const wrapper = factory('#ff0000')
    const area = stubAreaRect(wrapper)
    await area.trigger('pointerdown', { clientX: 100, clientY: 50, pointerId: 1 })
    expect(lastEmitted(wrapper)).toBe('#800000')
  })

  it('clamps the pointer position inside the area', async () => {
    const wrapper = factory('#ff0000')
    const area = stubAreaRect(wrapper)
    await area.trigger('pointerdown', { clientX: -40, clientY: -40, pointerId: 1 })
    expect(lastEmitted(wrapper)).toBe('#ffffff')
  })

  it('lowers the value with the down arrow key', async () => {
    const wrapper = factory('#ff0000')
    await wrapper.find('.form-control-color-input-picker__area').trigger('keydown', { key: 'ArrowDown', shiftKey: true })
    expect(lastEmitted(wrapper)).toBe('#e60000')
  })
})

describe('FormControlColorInputPicker hue slider', () => {
  it('changes the hue while keeping saturation and value', async () => {
    const wrapper = factory('#ff0000')
    await wrapper.find('.form-control-color-input-picker__hue').setValue(120)
    expect(lastEmitted(wrapper)).toBe('#00ff00')
  })

  it('keeps the hue when the color goes through black', async () => {
    const wrapper = factory('#3399ff')
    await wrapper.setProps({ modelValue: '#000000' })
    const hue = wrapper.find<HTMLInputElement>('.form-control-color-input-picker__hue')
    expect(Number(hue.element.value)).toBe(210)
  })
})

describe('FormControlColorInputPicker hex field', () => {
  it('emits a valid hex typed in the field', async () => {
    const wrapper = factory()
    await wrapper.find('.form-control-color-input-picker__hex').setValue('#123456')
    expect(lastEmitted(wrapper)).toBe('#123456')
  })

  it('ignores an invalid hex typed in the field', async () => {
    const wrapper = factory()
    await wrapper.find('.form-control-color-input-picker__hex').setValue('#12')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('FormControlColorInputPicker with a non-hex color', () => {
  it('starts from a valid position', () => {
    const wrapper = factory('steelblue')
    const area = wrapper.find('.form-control-color-input-picker__area')
    expect(area.attributes('aria-valuetext')).not.toContain('NaN')
  })
})

describe('FormControlColorInputPicker short hex', () => {
  it('expands a 3-digit hex on change', async () => {
    const wrapper = factory()
    const hex = wrapper.find('.form-control-color-input-picker__hex')
    ;(hex.element as HTMLInputElement).value = '#0f0'
    await hex.trigger('change')
    expect(lastEmitted(wrapper)).toBe('#00ff00')
  })

  it('does not expand a 3-digit hex while typing', async () => {
    const wrapper = factory()
    const hex = wrapper.find('.form-control-color-input-picker__hex')
    ;(hex.element as HTMLInputElement).value = '#0f0'
    await hex.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('FormControlColorInputPicker swatch groups', () => {
  const groups = [
    { label: 'Category colors', swatches: [{ name: 'France', color: '#0055a4' }, { name: 'Italy', color: '#009246' }] },
    { label: 'Empty', swatches: [] },
  ]

  function factoryWithSwatches() {
    return mount(FormControlColorInputPicker, {
      props: { modelValue: '#ff0000' },
      global: { provide: { [ColorSwatchGroupsKey as symbol]: ref(groups) } },
    })
  }

  it('shows the non-empty groups with their label', () => {
    const titles = factoryWithSwatches().findAll('.form-control-color-input-swatches__group__title')
    expect(titles.map(title => title.text())).toEqual(['Category colors'])
  })

  it('names each swatch', () => {
    const swatch = factoryWithSwatches().find('.form-control-color-input-swatches__group__swatch')
    expect(swatch.attributes('aria-label')).toBe('France #0055a4')
  })

  it('picks the color of a clicked swatch', async () => {
    const wrapper = factoryWithSwatches()
    await wrapper.findAll('.form-control-color-input-swatches__group__swatch')[1].trigger('click')
    expect(lastEmitted(wrapper)).toBe('#009246')
  })

  it('shows no group when nothing is provided', () => {
    expect(factory().find('.form-control-color-input-swatches__group').exists()).toBe(false)
  })
})

describe('FormControlColorInputPicker with a CSS color name', () => {
  it('starts from the position of that color', () => {
    const area = factory('red').find('.form-control-color-input-picker__area')
    expect(area.attributes('aria-valuetext')).toBe('Saturation 100%, brightness 100%')
  })

  it('keeps that color when only the hue changes', async () => {
    const wrapper = factory('red')
    await wrapper.find('.form-control-color-input-picker__hue').setValue(0)
    expect(lastEmitted(wrapper)).toBe('#ff0000')
  })
})

describe('FormControlColorInputPicker hue on a grey', () => {
  it.each(['#000000', '#ffffff', '#808080'])('gives %s a visible hue', async (grey) => {
    const wrapper = factory(grey)
    await wrapper.find('.form-control-color-input-picker__hue').setValue(120)
    expect(lastEmitted(wrapper)).toBe('#00ff00')
  })
})

describe('FormControlColorInputPicker swatch events', () => {
  it('emits pick when a swatch is clicked', async () => {
    const wrapper = mount(FormControlColorInputPicker, {
      props: { modelValue: '#ff0000' },
      global: { provide: { [ColorSwatchGroupsKey as symbol]: ref([{ label: 'A', swatches: [{ name: 'France', color: '#0055a4' }] }]) } },
    })
    await wrapper.find('.form-control-color-input-swatches__group__swatch').trigger('click')
    expect(wrapper.emitted('pick')).toEqual([['#0055a4']])
  })

  it('renders swatches that share a name without a duplicate key warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const groups = ref([{ label: 'A', swatches: [{ name: 'France', color: '#0055a4' }, { name: 'Italy', color: '#009246' }] }])
    mount(FormControlColorInputPicker, {
      props: { modelValue: '#ff0000' },
      global: { provide: { [ColorSwatchGroupsKey as symbol]: groups } },
    })
    groups.value = [{ label: 'A', swatches: [{ name: 'Italy', color: '#009246' }, { name: 'France', color: '#0055a4' }, { name: 'France', color: '#ef4135' }] }]
    await nextTick()
    expect(warn.mock.calls.flat().join(' ')).not.toContain('Duplicate keys')
    warn.mockRestore()
  })
})
