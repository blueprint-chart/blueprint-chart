import { mount, flushPromises } from '@vue/test-utils'
import LandingScenes from './LandingScenes.vue'

vi.mock('@/stores/theme', () => ({
  useTheme: () => ({ theme: { value: 'light' } }),
}))

vi.mock('@/composables/useChartFromDsl', () => ({
  renderDsl: vi.fn(),
  parseDslSceneCount: vi.fn(() => 2),
}))

function mountScenes() {
  return mount(LandingScenes, {
    global: {
      stubs: {
        LandingSection: { template: '<section :id="id"><slot /></section>', props: ['id'] },
        LandingSectionHeader: {
          template: '<header><div class="header-label">{{ label }}</div><slot /><slot name="lead" /></header>',
          props: ['label'],
        },
        AppIcon: { template: '<span />' },
        ScenePlayerButtons: { template: '<div class="scene-player-stub" />' },
        Teleport: { template: '<div><slot /></div>' },
      },
    },
  })
}

describe('LandingScenes', () => {
  it('mounts at the scenes anchor', async () => {
    const w = mountScenes()
    await flushPromises()
    expect(w.find('section').attributes('id')).toBe('scenes')
  })

  it('uses the 05 / Scenes & storytelling eyebrow', async () => {
    const w = mountScenes()
    await flushPromises()
    expect(w.find('.header-label').text()).toBe('05 / Scenes & storytelling')
  })

  it('renders 3 feature rows', async () => {
    const w = mountScenes()
    await flushPromises()
    expect(w.findAll('.scenes-feature')).toHaveLength(3)
  })

  it('renders the chart container after the features in DOM order', async () => {
    const w = mountScenes()
    await flushPromises()
    // The flipped grid places features first in the DOM (left column),
    // chart second (right column). Test ensures we didn't accidentally swap.
    const children = w.find('.scenes__grid').element.children
    expect(children[0].classList.contains('scenes__grid__features')).toBe(true)
    expect(children[1].classList.contains('scenes-demo')).toBe(true)
  })
})
