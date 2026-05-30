import { mount } from '@vue/test-utils'
import SceneTimeline from './SceneTimeline.vue'

const twoScenes = [
  { name: null, index: 0, removable: false },
  { name: 'Intro', index: 1 },
]

describe('SceneTimeline', () => {
  it('renders scene items', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    expect(wrapper.text()).toContain('Scene 1')
    expect(wrapper.text()).toContain('Intro')
  })

  it('emits update:activeIndex when a scene is clicked', async () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    const items = wrapper.findAllComponents({ name: 'SceneTimelineItem' })
    await items[1].trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([1])
  })

  it('emits add when add button is clicked', async () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes },
    })
    await wrapper.find('.button-add').trigger('click')
    expect(wrapper.emitted('add')).toHaveLength(1)
  })

  it('shows play button by default', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes },
    })
    const playBtn = wrapper.find('.scene-timeline-controls__play-btn')
    expect(playBtn.exists()).toBe(true)
    expect(playBtn.attributes('aria-label')).toBe('Play')
  })

  it('shows pause button when playing', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, playing: true },
    })
    const playBtn = wrapper.find('.scene-timeline-controls__play-btn')
    expect(playBtn.attributes('aria-label')).toBe('Pause')
  })

  it('emits play when play button clicked', async () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, playing: false },
    })
    await wrapper.find('.scene-timeline-controls__play-btn').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('emits pause when pause button clicked', async () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, playing: true },
    })
    await wrapper.find('.scene-timeline-controls__play-btn').trigger('click')
    expect(wrapper.emitted('pause')).toHaveLength(1)
  })

  it('shows counter with scene position', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    expect(wrapper.find('.scene-timeline-controls__counter').text()).toBe('1 / 2')
  })

  it('emits update:activeIndex for prev button', async () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, activeIndex: 1 },
    })
    const prevBtn = wrapper.find('[aria-label="Previous scene"]')
    await prevBtn.trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([0])
  })

  it('emits update:activeIndex for next button', async () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    const nextBtn = wrapper.find('[aria-label="Next scene"]')
    await nextBtn.trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([1])
  })

  it('first scene is not removable when removable=false', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, activeIndex: 0 },
    })
    const items = wrapper.findAllComponents({ name: 'SceneTimelineItem' })
    expect(items[0].find('.scene-timeline-item__remove').exists()).toBe(false)
    expect(items[1].find('.scene-timeline-item__remove').exists()).toBe(true)
  })

  it('passes thumbnail to SceneTimelineItem', () => {
    const scenesWithThumb = [
      { name: null, index: 0, removable: false, thumbnail: '<svg viewBox="0 0 600 400"><rect fill="red"/></svg>' },
      { name: 'Intro', index: 1, thumbnail: '<svg viewBox="0 0 600 400"><rect fill="blue"/></svg>' },
    ]
    const wrapper = mount(SceneTimeline, {
      props: { scenes: scenesWithThumb, activeIndex: 0 },
    })
    const items = wrapper.findAllComponents({ name: 'SceneTimelineItem' })
    expect(items[0].props('thumbnail')).toContain('<svg')
    expect(items[1].props('thumbnail')).toContain('<svg')
  })

  it('renders empty state', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: [] },
    })
    expect(wrapper.findAllComponents({ name: 'SceneTimelineItem' })).toHaveLength(0)
  })

  it('applies the floating modifier when floating prop is set', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes, floating: true },
    })
    expect(wrapper.find('.scene-timeline').classes()).toContain('scene-timeline--floating')
  })

  it('omits the floating modifier by default', () => {
    const wrapper = mount(SceneTimeline, {
      props: { scenes: twoScenes },
    })
    expect(wrapper.find('.scene-timeline').classes()).not.toContain('scene-timeline--floating')
  })
})
