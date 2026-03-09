import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingBulletPoint from './LandingBulletPoint.vue'

describe('LandingBulletPoint', () => {
  it('renders title and description', () => {
    const w = mount(LandingBulletPoint, {
      props: { title: 'No chart junk', description: 'Less is more.' },
    })
    expect(w.text()).toContain('No chart junk')
    expect(w.text()).toContain('Less is more.')
  })

  it('renders a bullet dot', () => {
    const w = mount(LandingBulletPoint, {
      props: { title: 'Test', description: 'Desc' },
    })
    expect(w.find('.bullet-point__dot').exists()).toBe(true)
  })
})
