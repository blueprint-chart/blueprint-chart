import { mount } from '@vue/test-utils'
import { useChartConfig } from '@/stores/chartConfig'
import { useScenes } from '@/stores/scenes'
import { useChartSession } from '@/stores/chartSession'
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

function chartDsl({ autoplay = true, scenes = 2, title = 'Chart' } = {}) {
  const sceneBlocks = Array.from({ length: scenes }, (_, index) => `  scene "S${index}" {}`)
  const lines = ['chart bar-horizontal {', `  title = "${title}"`, `  autoplay = ${autoplay}`, ...sceneBlocks, '}']
  return lines.join('\n')
}

function loadChart(options?: Parameters<typeof chartDsl>[0]) {
  const dsl = chartDsl(options)
  useChartSession().createFromDsl(dsl)
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

describe('useScenePlayback', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
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
    const { playing, activeIndex } = useScenes()
    loadChart()
    mountPlayback()
    expect(playing.value).toBe(true)
    expect(activeIndex.value).toBe(-1)
    vi.advanceTimersByTime(3000)
    expect(activeIndex.value).toBe(0)
  })

  it('autoplays again when autoplay is ticked after a pause', async () => {
    const { layout } = useChartConfig()
    const { playing, stopPlayback } = useScenes()
    loadChart()
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
    loadChart()
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
    const { playing } = useScenes()
    loadChart()
    mountPlayback()
    expect(playing.value).toBe(false)
  })

  it('plays manually at the chart pace with reduced motion', () => {
    stubReducedMotion(true)
    const { layout } = useChartConfig()
    const { playing, activeIndex } = useScenes()
    loadChart({ autoplay: false })
    layout.value.sceneDuration = 5
    const { play } = mountPlayback()
    play()
    expect(playing.value).toBe(true)
    vi.advanceTimersByTime(4999)
    expect(activeIndex.value).toBe(-1)
    vi.advanceTimersByTime(1)
    expect(activeIndex.value).toBe(0)
  })

  it('waits for whenVisible before playing', () => {
    const { playing } = useScenes()
    loadChart()
    const whenVisible = shallowRef<HTMLElement | null>(document.createElement('div'))
    mountPlayback({ whenVisible })
    expect(playing.value).toBe(false)
    reveal()
    expect(playing.value).toBe(true)
  })

  it('does not autoplay after the reader already played and paused', async () => {
    const { playing, stopPlayback } = useScenes()
    loadChart()
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
    const { playing, nextScene } = useScenes()
    loadChart()
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
    loadChart({ autoplay: false, scenes: 1 })
    layout.value.playerType = 'none'
    layout.value.loop = true
    const { play } = mountPlayback()
    play()
    vi.advanceTimersByTime(3000)
    expect(activeIndex.value).toBe(0)
    vi.advanceTimersByTime(3000)
    expect(playing.value).toBe(false)
  })

  it('does not autoplay when the first scene is added', async () => {
    const { layout } = useChartConfig()
    const { playing, activeIndex, add, setActive } = useScenes()
    loadChart({ scenes: 0 })
    mountPlayback()
    add()
    setActive(0)
    await nextTick()
    expect(layout.value.autoplay).toBe(true)
    expect(activeIndex.value).toBe(0)
    expect(playing.value).toBe(false)
  })

  it('stays paused when the preview is remounted', async () => {
    const { playing, stopPlayback } = useScenes()
    loadChart()
    const { wrapper } = mountPlayback()
    stopPlayback()
    wrapper.unmount()
    mountPlayback()
    await nextTick()
    expect(playing.value).toBe(false)
  })

  it('does not autoplay when a DSL edit adds the first scenes', async () => {
    const { playing } = useScenes()
    loadChart({ scenes: 0 })
    mountPlayback()
    const { applyDsl } = useDslSync()
    const edited = chartDsl({ scenes: 2 })
    applyDsl(edited)
    await nextTick()
    expect(playing.value).toBe(false)
  })

  it('does not autoplay when a DSL edit turns autoplay on', async () => {
    const { playing } = useScenes()
    loadChart({ autoplay: false })
    mountPlayback()
    const { applyDsl } = useDslSync()
    const edited = chartDsl({ autoplay: true })
    applyDsl(edited)
    await nextTick()
    expect(playing.value).toBe(false)
  })
})
