import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingScenes from './LandingScenes.vue'

function mountScenes() {
  return mount(LandingScenes, {
    global: {
      stubs: {
        LandingSection: { template: '<div><slot /></div>' },
        LandingSectionHeader: { template: '<div><slot /></div>' },
        AppIcon: { template: '<span />', props: ['name', 'size', 'variant'] },
        ScenePlayerButtons: { template: '<div class="player-stub" />' },
        Teleport: { template: '<div><slot /></div>' },
      },
    },
  })
}

describe('LandingScenes', () => {
  it('renders chart container', () => {
    const w = mountScenes()
    expect(w.find('.scenes-demo__chart').exists()).toBe(true)
  })

  it('renders feature descriptions', () => {
    const w = mountScenes()
    const features = w.findAll('.scenes-feature')
    expect(features.length).toBe(3)
  })

  it('renders scenes demo wrapper', () => {
    const w = mountScenes()
    expect(w.find('.scenes-demo').exists()).toBe(true)
  })
})
