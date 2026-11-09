import { mount } from '@vue/test-utils'
import FormControlCheckbox from './FormControlCheckbox.vue'

describe('FormControlCheckbox', () => {
  it('renders the description inside the label, under the label text', () => {
    const wrapper = mount(FormControlCheckbox, {
      props: { modelValue: false, label: 'Play automatically', description: 'Not in the editor.' },
    })
    const label = wrapper.find('.form-check-label')
    const description = label.find('.form-control-checkbox__input__description')
    expect(label.text()).toContain('Play automatically')
    expect(description.text()).toBe('Not in the editor.')
  })

  it('renders no description element without a description', () => {
    const wrapper = mount(FormControlCheckbox, {
      props: { modelValue: false, label: 'Loop' },
    })
    expect(wrapper.find('.form-control-checkbox__input__description').exists()).toBe(false)
  })
})
