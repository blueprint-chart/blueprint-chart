import { mount } from '@vue/test-utils'
import SceneList from './SceneList.vue'

const threeScenes = [
  { name: 'Base', index: 0, removable: false, thumbnail: null, hint: 'base scene' },
  { name: 'Stacked', index: 1, removable: true, thumbnail: null, hint: 'inherits Base' },
  { name: 'Per-capita', index: 2, removable: true, thumbnail: null, hint: 'inherits Stacked' },
]

describe('SceneList', () => {
  it('renders SceneTimelineControls and one row per scene', () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
    })
    expect(w.find('.scene-timeline-controls').exists()).toBe(true)
    expect(w.findAllComponents({ name: 'SceneListItem' })).toHaveLength(3)
  })

  it('renders the +Add scene footer button', () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
    })
    expect(w.find('.scene-list__add').exists()).toBe(true)
  })

  it('emits add when the footer button is clicked', async () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
    })
    await w.find('.scene-list__add').trigger('click')
    expect(w.emitted('add')).toHaveLength(1)
  })

  it('forwards play/pause from the controls', async () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0, playing: false },
    })
    await w.find('.scene-timeline-controls__play-btn').trigger('click')
    expect(w.emitted('play')).toHaveLength(1)
  })

  it('emits update:activeIndex when a row is selected', async () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
    })
    const rows = w.findAllComponents({ name: 'SceneListItem' })
    await rows[2].find('button.scene-list-item').trigger('click')
    expect(w.emitted('update:activeIndex')?.[0]).toEqual([2])
  })

  it('emits remove with the scene index when a row remove is clicked', async () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
    })
    const rows = w.findAllComponents({ name: 'SceneListItem' })
    await rows[1].find('.scene-list-item__remove').trigger('click')
    expect(w.emitted('remove')?.[0]).toEqual([1])
  })
})
