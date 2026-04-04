import { mount } from '@vue/test-utils'
import LandingSectionHeader from './LandingSectionHeader.vue'

describe('LandingSectionHeader', () => {
  it('renders label text', () => {
    const w = mount(LandingSectionHeader, {
      props: { label: 'Design philosophy' },
    })
    expect(w.find('.landing-section-header__label').text()).toBe('Design philosophy')
  })

  it('renders title slot', () => {
    const w = mount(LandingSectionHeader, {
      props: { label: 'Test' },
      slots: { default: 'My title' },
    })
    expect(w.find('.landing-section-header__title').text()).toBe('My title')
  })

  it('renders lead slot when provided', () => {
    const w = mount(LandingSectionHeader, {
      props: { label: 'Test' },
      slots: { lead: 'Lead text here' },
    })
    expect(w.find('.landing-section-header__lead').text()).toBe('Lead text here')
  })

  it('does not render lead when slot is empty', () => {
    const w = mount(LandingSectionHeader, {
      props: { label: 'Test' },
    })
    expect(w.find('.landing-section-header__lead').exists()).toBe(false)
  })

  it('applies center class when center prop is set', () => {
    const w = mount(LandingSectionHeader, {
      props: { label: 'Test', center: true },
    })
    expect(w.find('.landing-section-header--center').exists()).toBe(true)
  })
})
