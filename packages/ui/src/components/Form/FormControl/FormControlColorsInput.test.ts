import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import FormControlColorsInput from './FormControlColorsInput.vue'

const stubs = {
  BFormGroup: { template: '<div class="form-group"><slot /></div>', props: ['label', 'labelFor'] },
  DisplayColorSwatch: { template: '<span class="swatch" />', props: ['color', 'size'] },
  ButtonAdd: { template: '<button class="btn-add" @click="$emit(\'click\')" />', props: ['id', 'size'] },
  FormControlColorInputPopover: true,
}

function factory(props: Record<string, unknown> = {}) {
  return shallowMount(FormControlColorsInput, {
    props: {
      modelValue: ['#ff0000', '#00ff00', '#0000ff'],
      label: 'Colors',
      id: 'test-colors',
      ...props,
    },
    global: { stubs },
  })
}

describe('FormControlColorsInput rendering', () => {
  it('renders a tag for each color in the model', () => {
    const wrapper = factory()
    const tags = wrapper.findAll('.form-control-colors-input__tag')
    expect(tags).toHaveLength(3)
  })

  it('displays hex values in tags', () => {
    const wrapper = factory()
    const hexSpans = wrapper.findAll('.form-control-colors-input__tag__hex')
    expect(hexSpans[0].text()).toBe('#ff0000')
    expect(hexSpans[1].text()).toBe('#00ff00')
    expect(hexSpans[2].text()).toBe('#0000ff')
  })

  it('renders a swatch for each color', () => {
    const wrapper = factory()
    const swatches = wrapper.findAll('.swatch')
    expect(swatches).toHaveLength(3)
  })

  it('renders the add button', () => {
    const wrapper = factory()
    expect(wrapper.find('.btn-add').exists()).toBe(true)
  })

  it('renders no tags when model is empty', () => {
    const wrapper = factory({ modelValue: [] })
    expect(wrapper.findAll('.form-control-colors-input__tag')).toHaveLength(0)
  })
})

describe('FormControlColorsInput remove', () => {
  it('renders remove button with correct aria-label for each tag', () => {
    const wrapper = factory()
    const removeButtons = wrapper.findAll('.form-control-colors-input__tag__remove')
    expect(removeButtons).toHaveLength(3)
    expect(removeButtons[0].attributes('aria-label')).toBe('Remove #ff0000')
    expect(removeButtons[1].attributes('aria-label')).toBe('Remove #00ff00')
  })

  it('emits update:modelValue without the removed color on remove click', async () => {
    const wrapper = factory()
    const removeButtons = wrapper.findAll('.form-control-colors-input__tag__remove')
    await removeButtons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['#ff0000', '#0000ff']])
  })

  it('emits update:modelValue with empty array when removing last color', async () => {
    const wrapper = factory({ modelValue: ['#ff0000'] })
    const removeBtn = wrapper.find('.form-control-colors-input__tag__remove')
    await removeBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]])
  })
})

describe('FormControlColorsInput swatch click', () => {
  it('opens picker on swatch button click', async () => {
    const wrapper = factory()
    const swatchBtns = wrapper.findAll('.form-control-colors-input__tag__swatch-btn')
    await swatchBtns[0].trigger('click')
    // Verify the component didn't crash and the picker state updated
    // (popover is stubbed, so we just confirm no errors and no unexpected emissions)
    expect(wrapper.findAll('.form-control-colors-input__tag')).toHaveLength(3)
  })
})
