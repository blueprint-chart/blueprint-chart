import { shallowMount } from '@vue/test-utils'
import AppIconLayers from './AppIconLayers.vue'

describe('AppIconLayers', () => {
  it('renders the app-icon-layers class', () => {
    const wrapper = shallowMount(AppIconLayers)
    expect(wrapper.classes()).toContain('app-icon-layers')
  })

  it('renders slot content', () => {
    const wrapper = shallowMount(AppIconLayers, {
      slots: { default: '<span class="child-icon" />' },
    })
    expect(wrapper.find('.child-icon').exists()).toBe(true)
  })

  it('applies preset size class', () => {
    const wrapper = shallowMount(AppIconLayers, { props: { size: 'lg' } })
    expect(wrapper.classes()).toContain('app-icon-layers--size-lg')
  })

  it('applies raw size via CSS variable', () => {
    const wrapper = shallowMount(AppIconLayers, { props: { size: '32px' } })
    expect(wrapper.attributes('style')).toContain('--app-icon-layers-raw-size: 32px')
    expect(wrapper.classes()).not.toContain('app-icon-layers--size-32px')
  })

  it('defaults to md size', () => {
    const wrapper = shallowMount(AppIconLayers)
    expect(wrapper.classes()).toContain('app-icon-layers--size-md')
  })
})
