import { mount, RouterLinkStub } from '@vue/test-utils'
import LandingCallout from './LandingCallout.vue'

const global = { stubs: { 'router-link': RouterLinkStub } }

describe('LandingCallout', () => {
  it('is a dark grain band with a chartreuse CTA', () => {
    const w = mount(LandingCallout, { global })
    expect(w.find('.landing-callout__grain').exists()).toBe(true)
    expect(w.find('.btn-bc-primary').exists()).toBe(true)
  })

  it('stamps data-bs-theme=dark so it is an always-dark island regardless of app theme', () => {
    const w = mount(LandingCallout, { global })
    expect(w.find('.landing-callout').attributes('data-bs-theme')).toBe('dark')
  })
})
