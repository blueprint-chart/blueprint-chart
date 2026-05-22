import { mount } from '@vue/test-utils'
import SceneTimelineCompact from './SceneTimelineCompact.vue'

const twoScenes = [
  { name: null, index: 0, removable: false },
  { name: 'Intro', index: 1 },
]

describe('SceneTimelineCompact', () => {
  it('renders SceneTimelineControls', () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    expect(wrapper.find('.scene-timeline-controls').exists()).toBe(true)
  })

  it('renders the active scene name and the counter', () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: twoScenes, activeIndex: 1 },
    })
    expect(wrapper.find('.scene-timeline-compact__name').text()).toBe('Intro')
    expect(wrapper.find('.scene-timeline-compact__counter').text()).toBe('2 of 2')
  })

  it('renders a non-breaking-space fallback when active scene has no name', () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    // U+00A0 (non-breaking space) — keeps the row layout stable.
    // Use element.textContent directly because text() trims NBSP.
    expect(wrapper.find('.scene-timeline-compact__name').element.textContent).toBe(' ')
  })

  it('emits expand when the chevron is clicked', async () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    await wrapper.find('.scene-timeline-compact__expand').trigger('click')
    expect(wrapper.emitted('expand')).toHaveLength(1)
  })

  it('forwards play and pause events from controls', async () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: twoScenes, activeIndex: 0, playing: false },
    })
    await wrapper.find('.scene-timeline-controls__play-btn').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits update:activeIndex when next is clicked', async () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    await wrapper.find('[aria-label="Next scene"]').trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([1])
  })

  it('renders counter "1 of 0" when scenes is empty', () => {
    const wrapper = mount(SceneTimelineCompact, {
      props: { scenes: [], activeIndex: -1 },
    })
    expect(wrapper.find('.scene-timeline-compact__counter').text()).toBe('1 of 0')
  })
})
