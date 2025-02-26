import { mount } from '@vue/test-utils'
import DisplayNumber from './DisplayNumber.vue'

describe('DisplayNumber', () => {
  it('renders number value', () => {
    const wrapper = mount(DisplayNumber, { props: { value: 42 } })
    expect(wrapper.find('.display-number__text').text()).toBe('42')
  })

  it('applies precision formatting', () => {
    const wrapper = mount(DisplayNumber, { props: { value: 3.14159, precision: 2 } })
    expect(wrapper.find('.display-number__text').text()).toBe('3.14')
  })

  it('renders unit when provided', () => {
    const wrapper = mount(DisplayNumber, { props: { value: 42, unit: '%' } })
    expect(wrapper.find('.display-number__unit').text()).toBe('%')
  })

  it('hides unit when not provided', () => {
    const wrapper = mount(DisplayNumber, { props: { value: 42 } })
    expect(wrapper.find('.display-number__unit').exists()).toBe(false)
  })
})
