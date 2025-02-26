import { mount } from '@vue/test-utils'
import DisplayDate from './DisplayDate.vue'

describe('DisplayDate', () => {
  it('renders formatted date', () => {
    const wrapper = mount(DisplayDate, { props: { value: '2025-06-15' } })
    expect(wrapper.text()).toBeTruthy()
  })

  it('returns raw value for invalid date', () => {
    const wrapper = mount(DisplayDate, { props: { value: 'not-a-date' } })
    expect(wrapper.text()).toBe('not-a-date')
  })

  it('applies display-date class', () => {
    const wrapper = mount(DisplayDate, { props: { value: '2025-06-15' } })
    expect(wrapper.classes()).toContain('display-date')
  })
})
