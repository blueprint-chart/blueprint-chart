import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import LandingPage from './LandingPage.vue'

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({ theme: { value: 'light' }, cycleTheme: vi.fn() }),
}))

vi.mock('@/composables/useChartSession', () => ({
  useChartSession: () => ({
    listSavedCharts: () => [],
  }),
}))

function mountPage() {
  return shallowMount(LandingPage, {
    global: { stubs: { 'router-link': true, 'router-view': true } },
  })
}

describe('LandingPage', () => {
  it('renders all sections', () => {
    const w = mountPage()
    expect(w.findComponent({ name: 'LandingHero' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingPhilosophy' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingFormat' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingScenes' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingPractices' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingOpenSource' }).exists()).toBe(true)
    expect(w.findComponent({ name: 'LandingFooter' }).exists()).toBe(true)
  })

  it('renders dividers between sections', () => {
    const w = mountPage()
    const dividers = w.findAllComponents({ name: 'LandingDivider' })
    expect(dividers.length).toBeGreaterThanOrEqual(2)
  })
})
