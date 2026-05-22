import { mount } from '@vue/test-utils'
import SceneList from './SceneList.vue'

const sortableInstances: Array<{ options: Record<string, unknown>, destroy: () => void }> = []

vi.mock('sortablejs', () => ({
  default: {
    create: vi.fn((_el: HTMLElement, options: Record<string, unknown>) => {
      const instance = { options, destroy: vi.fn() }
      sortableInstances.push(instance)
      return instance
    }),
  },
}))

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

  it('marks data-not-sortable on the base row', () => {
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
    })
    const rows = w.findAll('.scene-list-item-row')
    expect(rows[0].attributes('data-not-sortable')).toBe('true')
    expect(rows[1].attributes('data-not-sortable')).toBeUndefined()
  })

  it('creates a Sortable instance on the ul, with onMove blocking newIndex 0', () => {
    sortableInstances.length = 0
    mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
      attachTo: document.body,
    })
    expect(sortableInstances).toHaveLength(1)
    const opts = sortableInstances[0].options
    const refused = opts.onMove({ related: { dataset: {} }, newIndex: 0 })
    expect(refused).toBe(false)
    const allowed = opts.onMove({ related: { dataset: {} }, newIndex: 2 })
    expect(allowed).not.toBe(false)
  })

  it('emits reorder({ from, to }) when Sortable onEnd fires', () => {
    sortableInstances.length = 0
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
      attachTo: document.body,
    })
    const opts = sortableInstances[0].options
    opts.onEnd({ oldIndex: 1, newIndex: 2 })
    expect(w.emitted('reorder')?.[0]).toEqual([{ from: 1, to: 2 }])
  })

  it('destroys the Sortable instance on unmount', () => {
    sortableInstances.length = 0
    const w = mount(SceneList, {
      props: { scenes: threeScenes, activeIndex: 0 },
      attachTo: document.body,
    })
    const instance = sortableInstances[0]
    w.unmount()
    expect(instance.destroy).toHaveBeenCalled()
  })
})
