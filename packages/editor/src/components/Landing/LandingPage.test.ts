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
    // Use the components' rendered tag/class fingerprints as ordering markers.
    expect(order.indexOf('landing-topnav')).toBeLessThan(order.indexOf('landing-hero'))
    expect(order.indexOf('landing-hero')).toBeLessThan(order.indexOf('landing-value-prop-strip'))
    expect(order.indexOf('landing-value-prop-strip')).toBeLessThan(order.indexOf('landing-defaults'))
  })

  it('renders all sections present in the spine', () => {
    const w = mountPage()
    expect(w.findComponent({ name: 'LandingHero' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingValuePropStrip' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingDefaults' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingTransforms' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingFormat' }).exists()).toBe(true)
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
