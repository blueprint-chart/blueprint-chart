import { shallowMount } from '@vue/test-utils'
import LandingPage from './LandingPage.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({ theme: { value: 'light' }, cycleTheme: vi.fn() }),
}))

vi.mock('@/stores/chartSession', () => ({
  useChartSession: () => ({ listSavedCharts: () => [] }),
}))

function mountPage() {
  return shallowMount(LandingPage, {
    global: { stubs: { 'router-link': true, 'router-view': true } },
  })
}

describe('LandingPage', () => {
  it('renders the new spine in order', () => {
    const w = mountPage()
    const order = w.html()
    const idx = (marker: string) => order.indexOf(marker)
    expect(idx('landing-top-nav')).toBeLessThan(idx('landing-hero'))
    expect(idx('landing-hero')).toBeLessThan(idx('landing-value-prop-strip'))
    expect(idx('landing-value-prop-strip')).toBeLessThan(idx('landing-mcp'))
    expect(idx('landing-mcp')).toBeLessThan(idx('landing-format'))
    expect(idx('landing-format')).toBeLessThan(idx('landing-defaults'))
    expect(idx('landing-defaults')).toBeLessThan(idx('landing-transforms'))
    expect(idx('landing-transforms')).toBeLessThan(idx('landing-scenes'))
  })

  it('renders all sections present in the spine', () => {
    const w = mountPage()
    expect(w.findComponent({ name: 'LandingHero' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingValuePropStrip' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingDefaults' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingTransforms' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingFormat' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingMcp' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingScenes' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingFooter' }).exists()).toBe(true)
  })

  it('no longer renders LandingDivider, LandingOpenSource, LandingPhilosophy, LandingPractices', () => {
    const w = mountPage()
    expect(w.findComponent({ name: 'LandingDivider' }).exists()).toBe(false)
    expect(w.findComponent({ name: 'LandingOpenSource' }).exists()).toBe(false)
    expect(w.findComponent({ name: 'LandingPhilosophy' }).exists()).toBe(false)
    expect(w.findComponent({ name: 'LandingPractices' }).exists()).toBe(false)
  })
})
