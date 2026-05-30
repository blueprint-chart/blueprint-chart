import { mount } from '@vue/test-utils'
import FloatingSceneTimeline from './FloatingSceneTimeline.vue'
import { sceneTimelineKey, type SceneTimelineContext } from '@/composables/sceneTimelineContext'

const narrow = ref(false)

vi.mock('@blueprint-chart/ui', () => ({
  SceneTimeline: {
    name: 'SceneTimeline',
    template: '<div class="scene-timeline-stub" />',
    props: {
      scenes: { type: Array, default: () => [] },
      activeIndex: { type: Number, default: -1 },
      playing: { type: Boolean, default: false },
      floating: { type: Boolean, default: false },
    },
  },
  useBreakpoint: () => ({ isNarrow: narrow }),
}))

function makeCtx(showTimeline = true): SceneTimelineContext {
  return {
    scenes: ref([{ name: null, index: 0, removable: false }]),
    activeIndex: ref(0),
    playing: ref(false),
    showTimeline: ref(showTimeline),
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
  }
}

function mountWith(ctx: SceneTimelineContext | null) {
  return mount(FloatingSceneTimeline, {
    global: {
      provide: ctx ? { [sceneTimelineKey as symbol]: ctx } : {},
    },
  })
}

describe('FloatingSceneTimeline', () => {
  beforeEach(() => {
    narrow.value = false
  })

  it('renders the timeline when context is present and showTimeline is true', () => {
    const w = mountWith(makeCtx(true))
    expect(w.find('.floating-scene-timeline').exists()).toBe(true)
    expect(w.find('.scene-timeline-stub').exists()).toBe(true)
  })

  it('passes the floating prop to SceneTimeline', () => {
    const w = mountWith(makeCtx(true))
    const timeline = w.findComponent({ name: 'SceneTimeline' })
    expect(timeline.props('floating')).toBe(true)
  })

  it('renders nothing when showTimeline is false', () => {
    const w = mountWith(makeCtx(false))
    expect(w.find('.floating-scene-timeline').exists()).toBe(false)
  })

  it('renders nothing in narrow mode', () => {
    narrow.value = true
    const w = mountWith(makeCtx(true))
    expect(w.find('.floating-scene-timeline').exists()).toBe(false)
  })

  it('renders nothing when no context is provided', () => {
    const w = mountWith(null)
    expect(w.find('.floating-scene-timeline').exists()).toBe(false)
  })

  it('forwards SceneTimeline events to the provided handlers', async () => {
    const ctx = makeCtx(true)
    const w = mountWith(ctx)
    const timeline = w.findComponent({ name: 'SceneTimeline' })
    timeline.vm.$emit('add')
    timeline.vm.$emit('update:active-index', 2)
    await w.vm.$nextTick()
    expect(ctx.onAdd).toHaveBeenCalledOnce()
    expect(ctx.onSelect).toHaveBeenCalledWith(2)
  })
})
