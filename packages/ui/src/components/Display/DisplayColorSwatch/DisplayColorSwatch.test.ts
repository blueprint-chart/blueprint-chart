import { mount } from '@vue/test-utils'
import ColorSwatch from './DisplayColorSwatch.vue'

describe('ColorSwatch', () => {
  it('sets background color via style', () => {
    const wrapper = mount(ColorSwatch, { props: { color: '#ff0000' } })
    expect(wrapper.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('applies --sm class when size is sm', () => {
    const wrapper = mount(ColorSwatch, { props: { color: '#ff0000', size: 'sm' } })
    expect(wrapper.classes()).toContain('display-color-swatch--sm')
  })

  it('does not apply --sm class by default', () => {
    const wrapper = mount(ColorSwatch, { props: { color: '#ff0000' } })
    expect(wrapper.classes()).not.toContain('display-color-swatch--sm')
  })
})
