import { mount } from '@vue/test-utils'
import SectionGroup from './SectionGroup.vue'

describe('SectionGroup', () => {
  it('renders title via SectionTitle', () => {
    const wrapper = mount(SectionGroup, { props: { title: 'Axes' } })
    expect(wrapper.find('.section-title').text()).toBe('Axes')
  })

  it('renders slot content in body', () => {
    const wrapper = mount(SectionGroup, {
      props: { title: 'Test' },
      slots: { default: '<p>Controls here</p>' },
    })
    expect(wrapper.find('.section-group__body').text()).toBe('Controls here')
  })

  it('passes flush to SectionTitle', () => {
    const wrapper = mount(SectionGroup, { props: { title: 'Test', flush: true } })
    expect(wrapper.find('.section-title').classes()).toContain('section-title--flush')
  })

  it('does not apply flush by default', () => {
    const wrapper = mount(SectionGroup, { props: { title: 'Test' } })
    expect(wrapper.find('.section-title').classes()).not.toContain('section-title--flush')
  })
})
