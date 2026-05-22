import { mount } from '@vue/test-utils'
import LayoutNarrowDock from './LayoutNarrowDock.vue'

const twoScenes = [
  { name: null, index: 0, removable: false },
  { name: 'Intro', index: 1 },
]

vi.mock('@blueprint-chart/ui', () => ({
  SceneTimelineCompact: {
    name: 'SceneTimelineCompact',
    template: `
      <div
        class="scene-timeline-compact-stub"
        :data-expanded="expanded"
        @click="$emit('expand')"
      >
        <button class="stub-next" @click="$emit('update:activeIndex', activeIndex + 1)" />
      </div>
    `,
    props: ['scenes', 'activeIndex', 'playing', 'expanded'],
    emits: ['update:activeIndex', 'play', 'pause', 'expand'],
  },
}))

describe('LayoutNarrowDock', () => {
  it('renders SceneTimelineCompact when showTimeline is true', () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
      },
    })
    expect(wrapper.find('.scene-timeline-compact-stub').exists()).toBe(true)
  })

  it('renders an empty spacer (no timeline) when showTimeline is false', () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: false,
        scenes: [],
        activeIndex: -1,
        playing: false,
        panelLabel: 'Export panel',
      },
    })
    expect(wrapper.find('.scene-timeline-compact-stub').exists()).toBe(false)
    expect(wrapper.find('.layout-narrow-dock__timeline').exists()).toBe(true)
  })

  it('renders the PanelOpenButton with the supplied label', () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
      },
    })
    expect(wrapper.find('.panel-open-button').exists()).toBe(true)
    expect(wrapper.find('.panel-open-button').attributes('aria-label')).toBe('Edit panel')
  })

  it('emits open-panel when the pill is clicked', async () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
      },
    })
    await wrapper.find('.panel-open-button').trigger('click')
    expect(wrapper.emitted('open-panel')).toHaveLength(1)
  })

  it('does not emit open-panel when panelDisabled is true', async () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
        panelDisabled: true,
      },
    })
    await wrapper.find('.panel-open-button').trigger('click')
    expect(wrapper.emitted('open-panel')).toBeUndefined()
  })

  it('emits expand-timeline when the compact strip emits expand', async () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
      },
    })
    await wrapper.find('.scene-timeline-compact-stub').trigger('click')
    expect(wrapper.emitted('expand-timeline')).toHaveLength(1)
  })

  it('forwards update:activeIndex from the compact strip', async () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
      },
    })
    await wrapper.find('.stub-next').trigger('click')
    expect(wrapper.emitted('update:activeIndex')?.[0]).toEqual([1])
  })

  it('passes scenesSheetOpen down as expanded on the compact strip', () => {
    const wrapper = mount(LayoutNarrowDock, {
      props: {
        showTimeline: true,
        scenes: twoScenes,
        activeIndex: 0,
        playing: false,
        panelLabel: 'Edit panel',
        scenesSheetOpen: true,
      },
    })
    expect(wrapper.find('.scene-timeline-compact-stub').attributes('data-expanded')).toBe('true')
  })
})
