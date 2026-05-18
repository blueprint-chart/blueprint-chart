/* eslint-disable vue/one-component-per-file */
import { mount } from '@vue/test-utils'
import type { Ref } from 'vue'
import { useBreakpoint } from './useBreakpoint'

function createMockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = []
  const mql = {
    matches,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) {
        listeners.splice(idx, 1)
      }
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

function mountBreakpointComp(matches: boolean) {
  const mock = createMockMatchMedia(matches)
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
  return { isNarrowRef: isNarrowRef! }
}

describe('useBreakpoint', () => {
  it('returns isNarrow=true when viewport is narrow', async () => {
    const { isNarrowRef } = mountBreakpointComp(true)
    await nextTick()
    expect(isNarrowRef.value).toBe(true)
  })

  it('returns isNarrow=false when viewport is wide', async () => {
    const { isNarrowRef } = mountBreakpointComp(false)
    await nextTick()
    expect(isNarrowRef.value).toBe(false)
  })

  it('accepts \'md\' and uses 768 - 1 px as the breakpoint', () => {
    const calls: string[] = []
    const original = window.matchMedia
    window.matchMedia = ((q: string) => {
      calls.push(q)
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }
    }) as typeof window.matchMedia

    const Comp = defineComponent({
      setup() {
        useBreakpoint('md')
        return () => h('div')
      },
    })
    mount(Comp)
    window.matchMedia = original

    expect(calls).toContain('(max-width: 767px)')
  })

  it('accepts \'lg\' and uses 992 - 1 px as the breakpoint', () => {
    const calls: string[] = []
    const original = window.matchMedia
    window.matchMedia = ((q: string) => {
      calls.push(q)
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }
    }) as typeof window.matchMedia

    const Comp = defineComponent({
      setup() {
        useBreakpoint('lg')
        return () => h('div')
      },
    })
    mount(Comp)
    window.matchMedia = original

    expect(calls).toContain('(max-width: 991px)')
  })

  it('still accepts a numeric maxWidth (backwards-compatible)', () => {
    const calls: string[] = []
    const original = window.matchMedia
    window.matchMedia = ((q: string) => {
      calls.push(q)
      return {
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }
    }) as typeof window.matchMedia

    const Comp = defineComponent({
      setup() {
        useBreakpoint(900)
        return () => h('div')
      },
    })
    mount(Comp)
    window.matchMedia = original

    expect(calls).toContain('(max-width: 899px)')
  })
})
