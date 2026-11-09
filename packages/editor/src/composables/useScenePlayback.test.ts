import { mount } from '@vue/test-utils'
import { useChartConfig } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'
import { useScenePlayback, useScenesAutoplay } from './useScenePlayback'

let observers: FakeObserver[]

class FakeObserver {
  connected = true
  disconnect = vi.fn(() => {
    this.connected = false
  })

  observe = vi.fn()
  constructor(public callback: IntersectionObserverCallback) {
    observers.push(this)
  }

  emit(isIntersecting: boolean, intersectionRatio: number) {
    if (!this.connected) {
      return
    }
    const entry = { isIntersecting, intersectionRatio } as IntersectionObserverEntry
    this.callback([entry], this as unknown as IntersectionObserver)
  }
}

function stubReducedMotion(reduce: boolean) {
  const mql = { matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))
}

function reveal() {
  observers.forEach(observer => observer.emit(true, 1))
}

function mountPlayback(options?: Parameters<typeof useScenesAutoplay>[0]) {
  let play = () => {}
  const Comp = defineComponent({
    setup() {
      useScenesAutoplay(options)
      play = useScenePlayback().play
      return () => h('div')
    },
  })
  const wrapper = mount(Comp)
  return { wrapper, play: () => play() }
}

function addScenes(count: number) {
  const { add } = useScenes()
  for (let i = 0; i < count; i++) {
    add()
  }
}

describe('useScenePlayback', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useChartConfig().reset()
    vi.useFakeTimers()
    observers = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    stubReducedMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('autoplays on load when autoplay is set and the chart has scenes', () => {
    const { layout } = useChartConfig()
    const { playing, activeIndex } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    mountPlayback()
    expect(playing.value).toBe(true)
    expect(activeIndex.value).toBe(-1)
    vi.advanceTimersByTime(3000)
    expect(activeIndex.value).toBe(0)
  })

  it('autoplays again when autoplay is ticked after a pause', async () => {
    const { layout } = useChartConfig()
    const { playing, stopPlayback } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    mountPlayback()
    stopPlayback()
    layout.value.autoplay = false
    await nextTick()
    expect(playing.value).toBe(false)
    layout.value.autoplay = true
    await nextTick()
    expect(playing.value).toBe(true)
  })

  it('does not restart playback when the chart is edited', async () => {
    const { layout, title } = useChartConfig()
    const { playing, activeIndex, update } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    mountPlayback()
    vi.advanceTimersByTime(6000)
    expect(activeIndex.value).toBe(1)
    title.value = 'Edited title'
    layout.value.padding = 24
    update(0, { name: 'Renamed' })
    await nextTick()
    expect(activeIndex.value).toBe(1)
    expect(playing.value).toBe(true)
  })

  it('does not autoplay with reduced motion', () => {
    stubReducedMotion(true)
    const { layout } = useChartConfig()
    const { playing } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    mountPlayback()
    expect(playing.value).toBe(false)
  })

  it('plays manually at the chart pace with reduced motion', () => {
    stubReducedMotion(true)
    const { layout } = useChartConfig()
    const { playing, activeIndex } = useScenes()
    layout.value.sceneDuration = 5
    addScenes(2)
    const { play } = mountPlayback()
    play()
    expect(playing.value).toBe(true)
    vi.advanceTimersByTime(4999)
    expect(activeIndex.value).toBe(-1)
    vi.advanceTimersByTime(1)
    expect(activeIndex.value).toBe(0)
  })

  it('waits for whenVisible before playing', () => {
    const { layout } = useChartConfig()
    const { playing } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    const whenVisible = shallowRef<HTMLElement | null>(document.createElement('div'))
    mountPlayback({ whenVisible })
    expect(playing.value).toBe(false)
    reveal()
    expect(playing.value).toBe(true)
  })

  it('does not autoplay after the reader already played and paused', async () => {
    const { layout } = useChartConfig()
    const { playing, stopPlayback } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    const whenVisible = shallowRef<HTMLElement | null>(document.createElement('div'))
    const { play } = mountPlayback({ whenVisible })
    play()
    await nextTick()
    stopPlayback()
    await nextTick()
    reveal()
    expect(playing.value).toBe(false)
  })

  it('does not autoplay after the reader navigated', async () => {
    const { layout } = useChartConfig()
    const { playing, nextScene } = useScenes()
    layout.value.autoplay = true
    addScenes(2)
    const whenVisible = shallowRef<HTMLElement | null>(document.createElement('div'))
    mountPlayback({ whenVisible })
    nextScene()
    await nextTick()
    reveal()
    expect(playing.value).toBe(false)
  })

  it('ignores loop with player none', () => {
    const { layout } = useChartConfig()
    const { playing, activeIndex } = useScenes()
    layout.value.playerType = 'none'
    layout.value.loop = true
    addScenes(1)
    const { play } = mountPlayback()
    play()
    vi.advanceTimersByTime(3000)
    expect(activeIndex.value).toBe(0)
    vi.advanceTimersByTime(3000)
    expect(playing.value).toBe(false)
  })
})
