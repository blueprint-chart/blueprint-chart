import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, type Ref } from 'vue'
import { useBreakpoint } from './useBreakpoint'

function createMockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) listeners.splice(idx, 1)
    },
  }
  return {
    mql,
    listeners,
    install: () => {
      window.matchMedia = (() => mql) as typeof window.matchMedia
    },
  }
}

describe('useBreakpoint', () => {
  it('returns isNarrow=true when viewport is narrow', async () => {
    const mock = createMockMatchMedia(true)
    mock.install()

    let isNarrowRef: Ref<boolean> | undefined
    const Comp = defineComponent({
      setup() {
        const bp = useBreakpoint()
        isNarrowRef = bp.isNarrow
        return () => h('div')
      },
    })

    mount(Comp)
    await nextTick()
    expect(isNarrowRef!.value).toBe(true)
  })

  it('returns isNarrow=false when viewport is wide', async () => {
    const mock = createMockMatchMedia(false)
    mock.install()

    let isNarrowRef: Ref<boolean> | undefined
    const Comp = defineComponent({
      setup() {
        const bp = useBreakpoint()
        isNarrowRef = bp.isNarrow
        return () => h('div')
      },
    })

    mount(Comp)
    await nextTick()
    expect(isNarrowRef!.value).toBe(false)
  })
})
