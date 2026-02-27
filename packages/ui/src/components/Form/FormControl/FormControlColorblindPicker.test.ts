import { mount } from '@vue/test-utils'
import FormControlColorblindPicker from './FormControlColorblindPicker.vue'

describe('FormControlColorblindPicker', () => {
  it('renders with default value', () => {
    const wrapper = mount(FormControlColorblindPicker, {
      props: { 'modelValue': '', 'onUpdate:modelValue': () => {} },
    })
    expect(wrapper.text()).toContain('None')
  })

  it('renders with a label', () => {
    const wrapper = mount(FormControlColorblindPicker, {
      props: { 'modelValue': '', 'label': 'CVD Mode', 'onUpdate:modelValue': () => {} },
    })
    expect(wrapper.text()).toContain('CVD Mode')
  })

  it('shows selected mode text', () => {
    const wrapper = mount(FormControlColorblindPicker, {
      props: { 'modelValue': 'protanopia', 'onUpdate:modelValue': () => {} },
    })
    expect(wrapper.text()).toContain('Protanopia')
  })
})
