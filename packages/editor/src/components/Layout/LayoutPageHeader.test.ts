import { mount } from '@vue/test-utils'
import LayoutPageHeader from './LayoutPageHeader.vue'

describe('LayoutPageHeader', () => {
  it('renders #start before #end', () => {
    const wrapper = mount(LayoutPageHeader, {
      slots: {
        start: '<span class="s">START</span>',
        end: '<span class="e">END</span>',
      },
    })
    const html = wrapper.html()
    expect(html.indexOf('START')).toBeLessThan(html.indexOf('END'))
  })

  it('renders default slot when start/end are omitted', () => {
    const wrapper = mount(LayoutPageHeader, {
      slots: { default: '<span class="d">FULL</span>' },
    })
    expect(wrapper.find('.d').exists()).toBe(true)
  })

  it('applies the BEM root class', () => {
    const wrapper = mount(LayoutPageHeader, { slots: { default: '<span />' } })
    expect(wrapper.classes()).toContain('layout-page-header')
  })
})
