import { describe, expect, it } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import FormControlColorInput from './FormControlColorInput.vue'

const stubs = {
  BFormGroup: { template: '<div class="form-group"><slot /></div>', props: ['label', 'labelFor'] },
  FormControlColorInputPopover: true,
}

function factory(props: Record<string, unknown> = {}) {
  return shallowMount(FormControlColorInput, {
    props: {
      modelValue: '#4e79a7',
      label: 'Color',
      id: 'test-color',
      ...props,
    },
    global: { stubs },
  })
}

describe('FormControlColorInput rendering', () => {
  it('renders wrapper element', () => {
    const wrapper = factory()
    expect(wrapper.find('.form-control-color-input__wrapper').exists()).toBe(true)
  })

  it('renders swatch with background color from model', () => {
    const wrapper = factory({ modelValue: '#ff5500' })
    const swatch = wrapper.find('.form-control-color-input__wrapper__swatch')
    expect(swatch.attributes('style')).toContain('background-color: rgb(255, 85, 0)')
  })

  it('renders input with current model value', () => {
    const wrapper = factory({ modelValue: '#abc123' })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('#abc123')
  })

  it('applies the provided id to the input', () => {
    const wrapper = factory({ id: 'my-color' })
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('my-color')
  })
})

describe('FormControlColorInput validation', () => {
  it('emits update:modelValue for valid hex on input', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    await input.setValue('#ff0000')
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emissions = wrapper.emitted('update:modelValue')!
    const lastEmission = emissions[emissions.length - 1]
    expect(lastEmission).toEqual(['#ff0000'])
  })

  it('does not emit for invalid hex on input', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    // Set to invalid value by manipulating DOM directly
    input.element.value = 'not-a-color'
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not emit for short hex on input', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    input.element.value = '#fff'
    await input.trigger('input')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('emits update:modelValue for valid hex on change', async () => {
    const wrapper = factory()
    const input = wrapper.find('input')
    input.element.value = '#aabbcc'
    await input.trigger('change')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['#aabbcc'])
  })

  it('resets input value to model on invalid change', async () => {
    const wrapper = factory({ modelValue: '#4e79a7' })
    const input = wrapper.find('input')
    input.element.value = 'invalid'
    await input.trigger('change')
    expect(input.element.value).toBe('#4e79a7')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
