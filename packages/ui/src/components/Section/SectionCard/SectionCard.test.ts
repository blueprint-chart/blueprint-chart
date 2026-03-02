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

  it('renders header slot', () => {
    const wrapper = mount(SectionCard, { slots: { header: '<div class="custom-header">Header</div>' } })
    expect(wrapper.find('.custom-header').text()).toBe('Header')
  })

  it('hides body when no default slot content', () => {
    const wrapper = mount(SectionCard, { props: { label: 'Empty' } })
    expect(wrapper.find('.section-card__body').exists()).toBe(false)
  })
})
