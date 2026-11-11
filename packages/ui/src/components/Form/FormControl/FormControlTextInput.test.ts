import { mount } from '@vue/test-utils'
import FormControlTextInput from './FormControlTextInput.vue'

describe('FormControlTextInput', () => {
  it('renders label text', () => {
    const wrapper = mount(FormControlTextInput, {
      props: { modelValue: '', label: 'Title', id: 'test-input' },
    })
    expect(wrapper.find('.form-control-text-input').text()).toContain('Title')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(FormControlTextInput, {
      props: { modelValue: '', label: 'Title', id: 'test-input' },
    })
    const input = wrapper.find('.form-control-text-input__row__input')
    await input.setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('shows suffix when provided', () => {
    const wrapper = mount(FormControlTextInput, {
      props: { modelValue: '12', label: 'Width', id: 'test-input', suffix: 'px' },
    })
    const suffix = wrapper.find('.form-control-text-input__row__suffix')
    expect(suffix.exists()).toBe(true)
    expect(suffix.text()).toBe('px')
  })

  it('shows the error and marks the input invalid', () => {
    const wrapper = mount(FormControlTextInput, {
      props: { modelValue: 'abc', label: 'Value', id: 'test-input', error: 'Enter a number' },
    })
    expect(wrapper.text()).toContain('Enter a number')
    expect(wrapper.find('input').classes()).toContain('is-invalid')
  })

  it('shows no error by default', () => {
    const wrapper = mount(FormControlTextInput, {
      props: { modelValue: 'abc', label: 'Value', id: 'test-input' },
    })
    expect(wrapper.find('input').classes()).not.toContain('is-invalid')
  })
})
