import { mount } from '@vue/test-utils'
import DisplayRange from './DisplayRange.vue'

describe('DisplayRange', () => {
  it('renders min and max values', () => {
    const wrapper = mount(DisplayRange, { props: { min: 0, max: 100 } })
    const texts = wrapper.findAll('.display-range__text')
    expect(texts[0].text()).toBe('0')
    expect(texts[1].text()).toBe('100')
  })

  it('renders separator', () => {
    const wrapper = mount(DisplayRange, { props: { min: 0, max: 100 } })
    expect(wrapper.find('.display-range__separator').exists()).toBe(true)
  })

  it('renders unit when provided', () => {
    const wrapper = mount(DisplayRange, { props: { min: 0, max: 100, unit: 'px' } })
    expect(wrapper.find('.display-range__unit').text()).toBe('px')
  })

  it('hides unit when not provided', () => {
    const wrapper = mount(DisplayRange, { props: { min: 0, max: 100 } })
    expect(wrapper.find('.display-range__unit').exists()).toBe(false)
  })
})
