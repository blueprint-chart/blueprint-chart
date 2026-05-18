import { mount, type VueWrapper } from '@vue/test-utils'
import { usePanelStore } from '@/stores/panel'
import { usePanelCanvasSync } from './usePanelCanvasSync'

// Mocked useElementSize lets tests drive width directly.
const elementWidth = ref(1000)
vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    useElementSize: () => ({ width: elementWidth, height: ref(800) }),
  }
})

// Tracks the last mounted wrapper so afterEach can unmount it. Without this,
// orphan watchers from previous tests keep firing on the shared width ref —
// and because Pinia actions call setActivePinia(<their own pinia>) on every
// invocation, those orphan calls clobber the active pinia and the next test
// gets the previous test's store.
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

  it('initial cramped canvas (< 480): forces closed', async () => {
    elementWidth.value = 400
    const store = usePanelStore()
    store.$patch({ mode: 'floating', lastDesktopMode: 'floating' })

    mountSync()
    await nextTick()

    expect(store.cramped).toBe(true)
    expect(store.mode).toBe('closed')
    expect(store.lastDesktopMode).toBe('floating')
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
    store.float()

    mountSync()
    await nextTick()

    elementWidth.value = 400
    await nextTick()
    expect(store.mode).toBe('closed')

    elementWidth.value = 1000
    await nextTick()
    expect(store.mode).toBe('floating')
  })
})
