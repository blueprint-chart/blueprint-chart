import { mount } from '@vue/test-utils'
import SectionTitle from './SectionTitle.vue'

describe('SectionTitle', () => {
  it('renders slot content', () => {
    const wrapper = mount(SectionTitle, { slots: { default: 'Colors' } })
    expect(wrapper.text()).toBe('Colors')
  })

  it('applies flush class when flush=true', () => {
    const wrapper = mount(SectionTitle, { props: { flush: true } })
    expect(wrapper.classes()).toContain('section-title--flush')
  })

  it('does not apply flush class when flush=false', () => {
    const wrapper = mount(SectionTitle)
    expect(wrapper.classes()).not.toContain('section-title--flush')
  })
})
