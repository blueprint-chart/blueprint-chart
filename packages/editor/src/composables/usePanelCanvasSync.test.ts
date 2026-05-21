import { mount, type VueWrapper } from '@vue/test-utils'
import { usePanelStore } from '@/stores/panel'
import { usePanelCanvasSync } from './usePanelCanvasSync'

const elementWidth = ref(1000)
vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    useElementSize: () => ({ width: elementWidth, height: ref(800) }),
  }
})

let wrapper: VueWrapper | null = null

function mountSync(target: HTMLElement | null = document.createElement('div')) {
  const Comp = defineComponent({
    setup() {
      usePanelCanvasSync(() => target)
      return () => h('div')
    },
  })
  wrapper = mount(Comp)
  return wrapper
}

describe('usePanelCanvasSync', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    elementWidth.value = 1000
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it('initial wide canvas: cramped stays false', async () => {
    const store = usePanelStore()

    mountSync()
    await nextTick()

    expect(store.cramped).toBe(false)
    expect(store.mode).toBe('docked')
  })

  it('initial cramped canvas: forces closed', async () => {
    elementWidth.value = 400
    const store = usePanelStore()
    store.$patch({ mode: 'docked', lastDesktopMode: 'docked' })

    mountSync()
    await nextTick()

    expect(store.cramped).toBe(true)
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('docked')
  })

  it('threshold boundary at 480: cramped is false at 480, true at 479', async () => {
    elementWidth.value = 480
    const store = usePanelStore()

    mountSync()
    await nextTick()
    expect(store.cramped).toBe(false)

    elementWidth.value = 479
    await nextTick()
    expect(store.cramped).toBe(true)
  })

  it('width 0 (pre-measurement) does not mark cramped', async () => {
    elementWidth.value = 0
    const store = usePanelStore()

    mountSync()
    await nextTick()

    expect(store.cramped).toBe(false)
    expect(store.mode).toBe('docked')
  })

  it('wide→cramped→wide restores the previous mode', async () => {
    elementWidth.value = 1000
    const store = usePanelStore()
    store.dock()

    mountSync()
    await nextTick()

    elementWidth.value = 400
    await nextTick()
    expect(store.mode).toBe('closed')

    elementWidth.value = 1000
    await nextTick()
    expect(store.mode).toBe('docked')
  })
})
