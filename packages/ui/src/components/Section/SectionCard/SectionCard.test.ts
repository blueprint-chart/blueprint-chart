import { mount } from '@vue/test-utils'
import SectionCard from './SectionCard.vue'

describe('SectionCard', () => {
  it('renders label when given', () => {
    const wrapper = mount(SectionCard, { props: { label: 'Options' } })
    expect(wrapper.find('.section-card__label').text()).toBe('Options')
  })

  it('hides label when not given', () => {
    const wrapper = mount(SectionCard)
    expect(wrapper.find('.section-card__label').exists()).toBe(false)
  })

  it('renders default slot', () => {
    const wrapper = mount(SectionCard, { slots: { default: '<p>Content</p>' } })
    expect(wrapper.find('.section-card__body').text()).toBe('Content')
  })
})
