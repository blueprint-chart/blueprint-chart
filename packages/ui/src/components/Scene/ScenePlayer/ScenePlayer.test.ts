import { mount } from '@vue/test-utils'
import ScenePlayerProgressBar from './ScenePlayerProgressBar.vue'
import ScenePlayerDotStepper from './ScenePlayerDotStepper.vue'
import ScenePlayerMinimalArrows from './ScenePlayerMinimalArrows.vue'

describe('ScenePlayerProgressBar', () => {
  it('renders correct number of segments', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 4, current: 1 },
    })
    expect(wrapper.findAll('.bc-scene-player__segment')).toHaveLength(4)
  })

  it('marks active segment', () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 2 },
    })
    const segments = wrapper.findAll('.bc-scene-player__segment')
    expect(segments[0].classes()).toContain('bc-scene-player__segment--completed')
    expect(segments[1].classes()).toContain('bc-scene-player__segment--active')
    expect(segments[2].classes()).not.toContain('bc-scene-player__segment--active')
    expect(segments[2].classes()).not.toContain('bc-scene-player__segment--completed')
  })

  it('emits update:current on segment click', async () => {
    const wrapper = mount(ScenePlayerProgressBar, {
      props: { total: 3, current: 1 },
    })
    await wrapper.findAll('.bc-scene-player__segment')[2].trigger('click')
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
    expect(wrapper.findAll('.bc-scene-player__dot')).toHaveLength(4)
  })

  it('highlights active dot', () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 2 },
    })
    const dots = wrapper.findAll('.bc-scene-player__dot')
    expect(dots[0].classes()).toContain('bc-scene-player__dot--completed')
    expect(dots[1].classes()).toContain('bc-scene-player__dot--active')
    expect(dots[2].classes()).not.toContain('bc-scene-player__dot--active')
  })

  it('emits update:current on dot click', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1 },
    })
    await wrapper.findAll('.bc-scene-player__dot')[1].trigger('click')
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

  it('emits update:current on prev click', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 2 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1])
  })

  it('emits update:current on next click', async () => {
    const wrapper = mount(ScenePlayerDotStepper, {
      props: { total: 3, current: 1 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([2])
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

  it('emits update:current on prev click', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 2 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1])
  })

  it('emits update:current on next click', async () => {
    const wrapper = mount(ScenePlayerMinimalArrows, {
      props: { total: 3, current: 1 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([2])
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
})
