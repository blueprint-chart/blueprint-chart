import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingSection from './LandingSection.vue'

describe('LandingSection', () => {
  it('renders slot content', () => {
    const w = mount(LandingSection, {
      slots: { default: '<p>Hello</p>' },
    })
    expect(w.text()).toContain('Hello')
  })

  it('applies dark class when dark prop is set', () => {
    const w = mount(LandingSection, { props: { dark: true } })
    expect(w.find('.landing-section--dark').exists()).toBe(true)
  })

  it('applies full class when full prop is set', () => {
    const w = mount(LandingSection, { props: { full: true } })
    expect(w.find('.landing-section--full').exists()).toBe(true)
  })

  it('sets id from prop', () => {
    const w = mount(LandingSection, { props: { id: 'features' } })
    expect(w.find('section').attributes('id')).toBe('features')
  })
})
