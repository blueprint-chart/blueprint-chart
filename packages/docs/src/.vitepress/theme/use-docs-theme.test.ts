import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// VitePress is not present in unit tests; stub `useData` so the composable
// can read/write `isDark` without booting VP's runtime.
const isDark = { value: false }
vi.mock('vitepress', () => ({
  useData: () => ({ isDark }),
}))

import { useDocsTheme } from './use-docs-theme'

function setMatchMedia(dark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('dark') ? dark : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }),
  })
}

describe('useDocsTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-bs-theme')
    isDark.value = false
    setMatchMedia(false)
  })

  it('defaults to "auto" when no preference is stored', () => {
    const { theme } = useDocsTheme()
    expect(theme.value).toBe('auto')
  })

  it('reads the persisted preference from localStorage["bc-theme"]', () => {
    localStorage.setItem('bc-theme', 'dark')
    const { theme } = useDocsTheme()
    expect(theme.value).toBe('dark')
  })

  it('cycles light -> dark -> auto -> light', () => {
    localStorage.setItem('bc-theme', 'light')
    const { theme, cycleTheme } = useDocsTheme()
    expect(theme.value).toBe('light')
    cycleTheme()
    expect(theme.value).toBe('dark')
    cycleTheme()
    expect(theme.value).toBe('auto')
    cycleTheme()
    expect(theme.value).toBe('light')
  })

  it('persists the chosen theme', () => {
    const { cycleTheme } = useDocsTheme()
    // auto -> light
    cycleTheme()
    expect(localStorage.getItem('bc-theme')).toBe('light')
  })

  it('resolvedTheme follows system preference when theme is "auto"', () => {
    setMatchMedia(true)
    const { resolvedTheme } = useDocsTheme()
    expect(resolvedTheme.value).toBe('dark')
  })

  it('resolvedTheme honors an explicit "light" choice regardless of system', () => {
    setMatchMedia(true)
    localStorage.setItem('bc-theme', 'light')
    const { resolvedTheme } = useDocsTheme()
    expect(resolvedTheme.value).toBe('light')
  })

  it('writes data-bs-theme on <html> and isDark for VitePress when resolvedTheme changes', async () => {
    localStorage.setItem('bc-theme', 'dark')
    useDocsTheme()
    await nextTick()
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    expect(isDark.value).toBe(true)
  })
})
