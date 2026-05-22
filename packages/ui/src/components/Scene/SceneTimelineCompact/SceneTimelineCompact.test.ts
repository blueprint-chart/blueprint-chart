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
})
