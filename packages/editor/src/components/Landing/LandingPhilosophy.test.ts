import { mount } from '@vue/test-utils'
import LandingPhilosophy from './LandingPhilosophy.vue'

function mountPhilosophy() {
  return mount(LandingPhilosophy, {
    global: {
      stubs: {
        LandingSection: { template: '<div><slot /></div>' },
        LandingSectionHeader: { template: '<div><slot /></div>' },
        LandingChartPreview: { template: '<div class="chart-stub" />' },
      },
    },
  })
}

describe('LandingPhilosophy', () => {
  it('renders 3 bullet points', () => {
    const w = mountPhilosophy()
    const points = w.findAll('.bullet-point')
    expect(points).toHaveLength(3)
  })

  it('contains key philosophy titles', () => {
    const w = mountPhilosophy()
    expect(w.text()).toContain('Direct labels by default')
    expect(w.text()).toContain('No chart junk')
    expect(w.text()).toContain('Colorblind-safe palettes')
  })
})
