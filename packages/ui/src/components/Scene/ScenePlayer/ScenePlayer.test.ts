import { mount } from '@vue/test-utils'
import ScenePlayerProgressBar from './ScenePlayerProgressBar.vue'
import ScenePlayerDotStepper from './ScenePlayerDotStepper.vue'
import ScenePlayerMinimalArrows from './ScenePlayerMinimalArrows.vue'
import ScenePlayerButtons from './ScenePlayerButtons.vue'

describe('ScenePlayerProgressBar', () => {
  it('renders correct number of segments', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 4, current: 1 },
    })
    expect(wrapper.findAll('.bc-scene-player__segments__segment')).toHaveLength(4)
  })

  it('marks active segment', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 2 },
    })
    const segments = wrapper.findAll('.bc-scene-player__segments__segment')
    expect(segments[0].classes()).toContain('bc-scene-player__segments__segment--completed')
    expect(segments[1].classes()).toContain('bc-scene-player__segments__segment--active')
    expect(segments[2].classes()).not.toContain('bc-scene-player__segments__segment--active')
    expect(segments[2].classes()).not.toContain('bc-scene-player__segments__segment--completed')
  })

  it('emits update:current on segment click', async () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 1 },
    })
    await wrapper.findAll('.bc-scene-player__segments__segment')[2].trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([3])
  })

  it('shows counter text', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 5, current: 3 },
    })
    expect(wrapper.find('.bc-scene-player__counter').text()).toBe('3/5')
  })

  it('has data-scene-player attribute', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 2, current: 1 },
    })
    expect(wrapper.find('[data-scene-player]').exists()).toBe(true)
  })

  it('shows play button with Play label by default', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 1 },
    })
    const btn = wrapper.find('.bc-scene-player__play-btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBe('Play')
  })

  it('shows pause label when playing', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 1, playing: true },
    })
    expect(wrapper.find('.bc-scene-player__play-btn').attributes('aria-label')).toBe('Pause')
  })

  it('emits play when play button clicked', async () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 1, playing: false },
    })
    await wrapper.find('.bc-scene-player__play-btn').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause when pause button clicked', async () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 1, playing: true },
    })
    await wrapper.find('.bc-scene-player__play-btn').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })
})

describe('ScenePlayerDotStepper', () => {
  it('renders correct number of dots', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 4, current: 1 },
    })
    expect(wrapper.findAll('.bc-scene-player__dots__dot')).toHaveLength(4)
  })

  it('highlights active dot', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 2 },
    })
    const dots = wrapper.findAll('.bc-scene-player__dots__dot')
    expect(dots[0].classes()).toContain('bc-scene-player__dots__dot--completed')
    expect(dots[1].classes()).toContain('bc-scene-player__dots__dot--active')
    expect(dots[2].classes()).not.toContain('bc-scene-player__dots__dot--active')
  })

  it('emits update:current on dot click', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1 },
    })
    await wrapper.findAll('.bc-scene-player__dots__dot')[1].trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([2])
  })

  it('disables prev button on first scene', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1 },
    })
    const prevBtn = wrapper.find('[aria-label="Previous scene"]')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last scene', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 3 },
    })
    const nextBtn = wrapper.find('[aria-label="Next scene"]')
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('emits previous on prev click', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 2 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('previous')).toHaveLength(1)
  })

  it('emits next on next click', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('emits one next event per click even within a single event-loop turn', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 10, current: 1 },
    })
    const nextBtn = wrapper.find('[aria-label="Next scene"]')
    for (let i = 0; i < 9; i++) {
      nextBtn.trigger('click')
    }
    expect(wrapper.emitted('next')).toHaveLength(9)
  })

  it('applies position class', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 2, current: 1, position: 'right' },
    })
    expect(wrapper.find('.bc-scene-player--right').exists()).toBe(true)
  })

  it('has data-scene-player attribute', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 2, current: 1 },
    })
    expect(wrapper.find('[data-scene-player]').exists()).toBe(true)
  })

  it('emits play when play button clicked', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1, playing: false },
    })
    await wrapper.find('.bc-scene-player__play-btn').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause when pause button clicked', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1, playing: true },
    })
    await wrapper.find('.bc-scene-player__play-btn').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })
})

describe('ScenePlayerMinimalArrows', () => {
  it('shows counter text', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 5, current: 3 },
    })
    expect(wrapper.find('.bc-scene-player__counter').text()).toBe('3/5')
  })

  it('disables prev button on first scene', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1 },
    })
    const prevBtn = wrapper.find('[aria-label="Previous scene"]')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last scene', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 3 },
    })
    const nextBtn = wrapper.find('[aria-label="Next scene"]')
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('emits previous on prev click', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 2 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('previous')).toHaveLength(1)
  })

  it('emits next on next click', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('applies position class', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 2, current: 1, position: 'left' },
    })
    expect(wrapper.find('.bc-scene-player--left').exists()).toBe(true)
  })

  it('has data-scene-player attribute', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 2, current: 1 },
    })
    expect(wrapper.find('[data-scene-player]').exists()).toBe(true)
  })

  it('emits play when play button clicked', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1, playing: false },
    })
    await wrapper.find('.bc-scene-player__play-btn').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause when pause button clicked', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1, playing: true },
    })
    await wrapper.find('.bc-scene-player__play-btn').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })

  it('wrap: prev on first scene emits previous (wrap is parent-resolved)', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 5, current: 1, wrap: true },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('previous')).toHaveLength(1)
    expect(wrapper.emitted('update:current')).toBeUndefined()
  })

  it('wrap: next on last scene emits next (wrap is parent-resolved)', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 5, current: 5, wrap: true },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
    expect(wrapper.emitted('update:current')).toBeUndefined()
  })

  it('wrap: prev and next are never disabled', () => {
    const first = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1, wrap: true },
    })
    expect(first.find('[aria-label="Previous scene"]').attributes('disabled')).toBeUndefined()

    const last = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 3, wrap: true },
    })
    expect(last.find('[aria-label="Next scene"]').attributes('disabled')).toBeUndefined()
  })

  it('showCounter: false hides counter', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1, showCounter: false },
    })
    expect(wrapper.find('.bc-scene-player__counter').exists()).toBe(false)
  })

  it('showCounter: true (default) shows counter', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1 },
    })
    expect(wrapper.find('.bc-scene-player__counter').exists()).toBe(true)
  })

  it('order: controls-first renders nav button before counter', () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 2, order: 'controls-first' },
    })
    const children = wrapper.find('.bc-scene-player--minimal-arrows').element.children
    expect(children[0].tagName).toBe('BUTTON')
    expect(children[children.length - 1].classList.contains('bc-scene-player__counter')).toBe(true)
  })
})

describe('ScenePlayerButtons', () => {
  it('shows counter text with spaces', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 4, current: 1 },
    })
    expect(wrapper.find('.bc-scene-player__counter').text()).toBe('1 / 4')
  })

  it('renders Back and Next buttons', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 4, current: 2 },
    })
    expect(wrapper.find('[aria-label="Previous scene"]').text()).toContain('Back')
    expect(wrapper.find('[aria-label="Next scene"]').text()).toContain('Next')
  })

  it('disables Back button on first scene', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 3, current: 1 },
    })
    expect(wrapper.find('[aria-label="Previous scene"]').attributes('disabled')).toBeDefined()
  })

  it('disables Next button on last scene', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 3, current: 3 },
    })
    expect(wrapper.find('[aria-label="Next scene"]').attributes('disabled')).toBeDefined()
  })

  it('emits previous on Back click', async () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 3, current: 2 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('previous')).toHaveLength(1)
  })

  it('emits next on Next click', async () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 3, current: 1 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('emits a next event per click even within a single event-loop turn', () => {
    // Regression: before the fix, rapid synchronous clicks all emitted
    // the same value because defineModel does not optimistically update
    // its local value when the parent attaches an @update:current handler.
    // Now the child emits an intent event — one per click, always.
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 10, current: 1 },
    })
    const nextBtn = wrapper.find('[aria-label="Next scene"]')
    for (let i = 0; i < 9; i++) {
      nextBtn.trigger('click')
    }
    expect(wrapper.emitted('next')).toHaveLength(9)
  })

  it('has data-scene-player attribute', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 2, current: 1 },
    })
    expect(wrapper.find('[data-scene-player]').exists()).toBe(true)
  })

  it('applies position class', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 2, current: 1, position: 'center' },
    })
    expect(wrapper.find('.bc-scene-player--center').exists()).toBe(true)
  })

  it('defaults to left position', () => {
    const wrapper = mount(ScenePlayerButtons, {
      props: { total: 2, current: 1 },
    })
    expect(wrapper.find('.bc-scene-player--left').exists()).toBe(true)
  })
})
