import { mount } from '@vue/test-utils'
import DisplayValue from './DisplayValue.vue'

describe('DisplayValue', () => {
  it('renders value text', () => {
    const wrapper = mount(DisplayValue, { props: { value: '42' } })
    expect(wrapper.find('.display-value__text').text()).toBe('42')
  })

  it('renders unit when provided', () => {
    const wrapper = mount(DisplayValue, { props: { value: '42', unit: 'px' } })
    expect(wrapper.find('.display-value__unit').text()).toBe('px')
  })

  it('hides unit when not provided', () => {
    const wrapper = mount(DisplayValue, { props: { value: '42' } })
    expect(wrapper.find('.display-value__unit').exists()).toBe(false)
  })

  it('applies --sm class when size is sm', () => {
    const wrapper = mount(DisplayValue, { props: { value: '42', size: 'sm' } })
    expect(wrapper.classes()).toContain('display-value--sm')
  })

  it('renders numeric values', () => {
    const wrapper = mount(DisplayValue, { props: { value: 100 } })
    expect(wrapper.find('.display-value__text').text()).toBe('100')
  })
})
