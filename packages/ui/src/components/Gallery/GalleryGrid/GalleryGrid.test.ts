import { mount } from '@vue/test-utils'
import GalleryGrid from './GalleryGrid.vue'

describe('GalleryGrid', () => {
  it('renders default grid layout', () => {
    const wrapper = mount(GalleryGrid)
    expect(wrapper.classes()).toContain('gallery-grid')
    expect(wrapper.classes()).not.toContain('gallery-grid--row')
  })

  it('applies row layout class', () => {
    const wrapper = mount(GalleryGrid, { props: { layout: 'row' } })
    expect(wrapper.classes()).toContain('gallery-grid--row')
  })

  it('renders slot content', () => {
    const wrapper = mount(GalleryGrid, {
      slots: { default: '<div class="child">Item</div>' },
    })
    expect(wrapper.find('.child').exists()).toBe(true)
  })
})
