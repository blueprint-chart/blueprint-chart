import { mount } from '@vue/test-utils'
import DisplayPalette from './DisplayPalette.vue'

describe('DisplayPalette', () => {
  it('renders a swatch for each color', () => {
    const wrapper = mount(DisplayPalette, {
      props: { colors: ['#e74c3c', '#3498db', '#2ecc71'] },
    })
    expect(wrapper.findAll('.display-color-swatch')).toHaveLength(3)
  })

  it('renders no swatches for empty array', () => {
    const wrapper = mount(DisplayPalette, {
      props: { colors: [] },
    })
    expect(wrapper.findAll('.display-color-swatch')).toHaveLength(0)
  })

  it('passes colors to swatches', () => {
    const wrapper = mount(DisplayPalette, {
      props: { colors: ['#ff0000'] },
    })
    const swatch = wrapper.find('.display-color-swatch')
    expect(swatch.attributes('style')).toContain('background-color')
  })
})
