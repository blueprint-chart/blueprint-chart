import { mount } from '@vue/test-utils'
import ToolbarSeparator from './LayoutToolbarSeparator.vue'

describe('ToolbarSeparator', () => {
  it('renders with role="separator"', () => {
    const wrapper = mount(ToolbarSeparator)
    expect(wrapper.attributes('role')).toBe('separator')
  })

  it('has aria-orientation="vertical"', () => {
    const wrapper = mount(ToolbarSeparator)
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
  })
})
