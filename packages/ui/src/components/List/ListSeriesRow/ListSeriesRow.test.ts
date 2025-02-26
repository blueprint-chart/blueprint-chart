import { mount } from '@vue/test-utils'
import SeriesRow from './ListSeriesRow.vue'

describe('SeriesRow', () => {
  it('renders color swatch', () => {
    const wrapper = mount(SeriesRow, {
      props: { color: '#4e79a7', name: 'Revenue', modelValue: true },
    })
    expect(wrapper.find('.display-color-swatch').exists()).toBe(true)
  })

  it('renders name text', () => {
    const wrapper = mount(SeriesRow, {
      props: { color: '#4e79a7', name: 'Revenue', modelValue: true },
    })
    expect(wrapper.find('.list-series-row__name').text()).toBe('Revenue')
  })

  it('renders toggle switch', () => {
    const wrapper = mount(SeriesRow, {
      props: { color: '#4e79a7', name: 'Revenue', modelValue: true },
    })
    expect(wrapper.find('.list-series-row__toggle').exists()).toBe(true)
  })

  it('emits update:modelValue when toggle clicked', async () => {
    const wrapper = mount(SeriesRow, {
      props: { color: '#4e79a7', name: 'Revenue', modelValue: true },
    })
    await wrapper.find('.list-series-row__toggle input').setValue(false)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
