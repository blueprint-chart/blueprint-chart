import { mount } from '@vue/test-utils'
import LandingDivider from './LandingDivider.vue'

describe('LandingDivider', () => {
  it('renders an hr element', () => {
    const w = mount(LandingDivider)
    expect(w.find('hr').exists()).toBe(true)
  })
})
