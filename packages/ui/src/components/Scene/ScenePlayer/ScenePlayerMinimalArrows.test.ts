import { shallowMount } from '@vue/test-utils'
import ScenePlayerMinimalArrows from './ScenePlayerMinimalArrows.vue'

function factory(props: Record<string, unknown> = {}) {
  return shallowMount(ScenePlayerMinimalArrows, {
    props: {
      current: 2,
      total: 5,
      ...props,
    },
  })
}

describe('ScenePlayerMinimalArrows rendering', () => {
  it('renders root with correct base classes', () => {
    const wrapper = factory()
    expect(wrapper.classes()).toContain('bc-scene-player')
    expect(wrapper.classes()).toContain('bc-scene-player--minimal-arrows')
  })

  it('applies position class from prop', () => {
    const wrapper = factory({ position: 'left' })
    expect(wrapper.classes()).toContain('bc-scene-player--left')
  })

  it('defaults to center position', () => {
    const wrapper = factory()
    expect(wrapper.classes()).toContain('bc-scene-player--center')
  })

  it('displays counter text', () => {
    const wrapper = factory({ current: 3, total: 10 })
    expect(wrapper.text()).toContain('3/10')
  })

  it('hides counter when showCounter is false', () => {
    const wrapper = factory({ showCounter: false })
    expect(wrapper.find('.bc-scene-player__counter').exists()).toBe(false)
  })
})

describe('ScenePlayerMinimalArrows counter order', () => {
  it('places counter before controls when order is counter-first', () => {
    const wrapper = factory({ order: 'counter-first' })
    const counter = wrapper.find('.bc-scene-player__counter')
    expect(counter.exists()).toBe(true)
    expect(counter.classes()).not.toContain('bc-scene-player__counter--end')
  })

  it('places counter after controls when order is controls-first', () => {
    const wrapper = factory({ order: 'controls-first' })
    const counter = wrapper.find('.bc-scene-player__counter')
    expect(counter.exists()).toBe(true)
    expect(counter.classes()).toContain('bc-scene-player__counter--end')
  })
})

describe('ScenePlayerMinimalArrows navigation buttons', () => {
  it('disables previous button at first scene without wrap', () => {
    const wrapper = factory({ current: 1, total: 5, wrap: false })
    const prevBtn = wrapper.find('button[aria-label="Previous scene"]')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('enables previous button at first scene with wrap', () => {
    const wrapper = factory({ current: 1, total: 5, wrap: true })
    const prevBtn = wrapper.find('button[aria-label="Previous scene"]')
    expect(prevBtn.attributes('disabled')).toBeUndefined()
  })

  it('disables next button at last scene without wrap', () => {
    const wrapper = factory({ current: 5, total: 5, wrap: false })
    const nextBtn = wrapper.find('button[aria-label="Next scene"]')
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('enables next button at last scene with wrap', () => {
    const wrapper = factory({ current: 5, total: 5, wrap: true })
    const nextBtn = wrapper.find('button[aria-label="Next scene"]')
    expect(nextBtn.attributes('disabled')).toBeUndefined()
  })

  it('emits previous on previous click', async () => {
    const wrapper = factory({ current: 3, total: 5 })
    await wrapper.find('button[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('previous')).toHaveLength(1)
    expect(wrapper.emitted('update:current')).toBeUndefined()
  })

  it('emits next on next click', async () => {
    const wrapper = factory({ current: 3, total: 5 })
    await wrapper.find('button[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('update:current')).toBeUndefined()
  })

  it('emits a previous event per click even within a single event-loop turn', () => {
    const wrapper = factory({ current: 5, total: 5 })
    const prev = wrapper.find('button[aria-label="Previous scene"]')
    for (let i = 0; i < 4; i++) {
      prev.trigger('click')
    }
    expect(wrapper.emitted('previous')).toHaveLength(4)
  })

  it('emits a next event per click even within a single event-loop turn', () => {
    const wrapper = factory({ current: 1, total: 5 })
    const next = wrapper.find('button[aria-label="Next scene"]')
    for (let i = 0; i < 4; i++) {
      next.trigger('click')
    }
    expect(wrapper.emitted('next')).toHaveLength(4)
  })
})

describe('ScenePlayerMinimalArrows play/pause', () => {
  it('shows play button when not playing', () => {
    const wrapper = factory({ playing: false })
    const playBtn = wrapper.find('button[aria-label="Play"]')
    expect(playBtn.exists()).toBe(true)
  })

  it('shows pause button when playing', () => {
    const wrapper = factory({ playing: true })
    const pauseBtn = wrapper.find('button[aria-label="Pause"]')
    expect(pauseBtn.exists()).toBe(true)
  })

  it('emits play event on play button click', async () => {
    const wrapper = factory({ playing: false })
    await wrapper.find('button[aria-label="Play"]').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause event on pause button click', async () => {
    const wrapper = factory({ playing: true })
    await wrapper.find('button[aria-label="Pause"]').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })
})
