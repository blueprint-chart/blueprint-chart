import { mount } from '@vue/test-utils'
import LayoutPageHeader from './LayoutPageHeader.vue'

describe('LayoutPageHeader', () => {
  it('renders slots in #start, #center, #end order', () => {
    const wrapper = mount(LayoutPageHeader, {
      slots: {
        start: '<span class="s">START</span>',
        center: '<span class="c">CENTER</span>',
        end: '<span class="e">END</span>',
      },
    })
    const html = wrapper.html()
    expect(html.indexOf('START')).toBeLessThan(html.indexOf('CENTER'))
    expect(html.indexOf('CENTER')).toBeLessThan(html.indexOf('END'))
  })

  it('applies the BEM root class', () => {
    const wrapper = mount(LayoutPageHeader)
    expect(wrapper.classes()).toContain('layout-page-header')
  })

  it('renders all slot wrappers even when only #start is provided', () => {
    const wrapper = mount(LayoutPageHeader, {
      slots: { start: '<span class="s">START</span>' },
    })
    expect(wrapper.find('.layout-page-header__start').exists()).toBe(true)
    expect(wrapper.find('.layout-page-header__center').exists()).toBe(true)
    expect(wrapper.find('.layout-page-header__end').exists()).toBe(true)
    expect(wrapper.find('.s').exists()).toBe(true)
  })

  it('renders content placed in #center', () => {
    const wrapper = mount(LayoutPageHeader, {
      slots: { center: '<span class="c">CENTER</span>' },
    })
    expect(wrapper.find('.layout-page-header__center .c').exists()).toBe(true)
  })
})
