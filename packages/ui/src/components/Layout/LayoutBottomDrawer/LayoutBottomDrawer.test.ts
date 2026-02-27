import { mount } from '@vue/test-utils'
import Drawer from './LayoutBottomDrawer.vue'

describe('LayoutBottomDrawer', () => {
  it('renders body slot when open', () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true },
      slots: { default: '<p>Drawer content</p>' },
    })
    expect(wrapper.find('.layout-bottom-drawer__body').text()).toContain('Drawer content')
  })

  it('does not render drawer when closed', () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: false },
    })
    expect(wrapper.find('.layout-bottom-drawer').exists()).toBe(false)
  })

  it('renders title when provided', () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true, title: 'Settings' },
    })
    expect(wrapper.find('.layout-bottom-drawer__title').text()).toBe('Settings')
  })

  it('emits update:modelValue on handle click', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true },
    })
    await wrapper.find('.layout-bottom-drawer__handle').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('emits update:modelValue on backdrop click', async () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true },
    })
    await wrapper.find('.layout-bottom-drawer__backdrop').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('applies custom maxHeight', () => {
    const wrapper = mount(Drawer, {
      props: { modelValue: true, maxHeight: '50vh' },
    })
    expect(wrapper.find('.layout-bottom-drawer').attributes('style')).toContain('max-height: 50vh')
  })
})
