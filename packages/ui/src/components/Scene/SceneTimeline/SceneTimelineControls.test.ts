import { mount } from '@vue/test-utils'
import SceneTimelineControls from './SceneTimelineControls.vue'

describe('SceneTimelineControls', () => {
  it('shows play button by default', () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2 },
    })
    const playBtn = wrapper.find('.scene-timeline-controls__play-btn')
    expect(playBtn.exists()).toBe(true)
    expect(playBtn.attributes('aria-label')).toBe('Play')
  })

  it('shows pause button when playing', () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, playing: true },
    })
    const playBtn = wrapper.find('.scene-timeline-controls__play-btn')
    expect(playBtn.attributes('aria-label')).toBe('Pause')
  })

  it('emits play when play button clicked', async () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, playing: false },
    })
    await wrapper.find('.scene-timeline-controls__play-btn').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause when pause button clicked', async () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, playing: true },
    })
    await wrapper.find('.scene-timeline-controls__play-btn').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })

  it('shows counter with scene position', () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, activeIndex: 0 },
    })
    expect(wrapper.find('.scene-timeline-controls__counter').text()).toBe('1 / 2')
  })

  it('hides counter when total is 0', () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 0 },
    })
    expect(wrapper.find('.scene-timeline-controls__counter').exists()).toBe(false)
  })

  it('disables buttons when total is 0', () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 0 },
    })
    expect(wrapper.find('[aria-label="Previous scene"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="Next scene"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.scene-timeline-controls__play-btn').attributes('disabled')).toBeDefined()
  })

  it('emits update:activeIndex for prev button', async () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, activeIndex: 1 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([0])
  })

  it('emits update:activeIndex for next button', async () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, activeIndex: 0 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([1])
  })

  it('wraps prev from first to last', async () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 3, activeIndex: 0 },
    })
    await wrapper.find('[aria-label="Previous scene"]').trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([2])
  })

  it('wraps next from last to first', async () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 3, activeIndex: 2 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([0])
  })

  it('displays index 1 when activeIndex is -1 (base)', () => {
    const wrapper = mount(SceneTimelineControls, {
      props: { total: 2, activeIndex: -1 },
    })
    expect(wrapper.find('.scene-timeline-controls__counter').text()).toBe('1 / 2')
  })
})
