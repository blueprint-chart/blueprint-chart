import { mount } from '@vue/test-utils'
import DisplayContrastBadge from './DisplayContrastBadge.vue'

describe('DisplayContrastBadge', () => {
  it('renders the level text', () => {
    const wrapper = mount(DisplayContrastBadge, { props: { level: 'AA' } })
    expect(wrapper.text()).toBe('AA')
  })

  it('applies --aaa class for AAA level', () => {
    const wrapper = mount(DisplayContrastBadge, { props: { level: 'AAA' } })
    expect(wrapper.classes()).toContain('display-contrast-badge--aaa')
  })

  it('applies --aa class for AA level', () => {
    const wrapper = mount(DisplayContrastBadge, { props: { level: 'AA' } })
    expect(wrapper.classes()).toContain('display-contrast-badge--aa')
  })

  it('applies --fail class for Fail level', () => {
    const wrapper = mount(DisplayContrastBadge, { props: { level: 'Fail' } })
    expect(wrapper.classes()).toContain('display-contrast-badge--fail')
  })
})
