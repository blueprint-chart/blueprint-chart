import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingOpenSource from './LandingOpenSource.vue'

function mountOSS() {
  return mount(LandingOpenSource, {
    global: {
      stubs: {
        LandingSection: { template: '<div><slot /></div>' },
        LandingSectionHeader: { template: '<div><slot /></div>' },
        AppIcon: { template: '<span />', props: ['name', 'size'] },
      },
    },
  })
}

describe('LandingOpenSource', () => {
  it('renders 4 stats', () => {
    const w = mountOSS()
    const stats = w.findAll('.oss-stat')
    expect(stats).toHaveLength(4)
  })

  it('renders MIT and GitHub badges', () => {
    const w = mountOSS()
    expect(w.text()).toContain('MIT License')
    expect(w.text()).toContain('View on GitHub')
  })

  it('contains community-driven messaging', () => {
    const w = mountOSS()
    expect(w.text()).toContain('Free forever')
  })
})
