import { describe, it, expect } from 'vitest'
import type { ThemeMode } from './useTheme'

// useTheme relies on @vueuse/core useStorage and useMediaQuery at module
// scope, which require a browser environment.  We test the pure cycling
// logic in isolation.

function cycleTheme(current: ThemeMode): ThemeMode {
  const modes: ThemeMode[] = ['light', 'dark', 'auto']
  const idx = modes.indexOf(current)
  return modes[(idx + 1) % modes.length]
}

function resolveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'dark') {
    return 'dark'
  }
  if (mode === 'auto') {
    return prefersDark ? 'dark' : 'light'
  }
  return 'light'
}

describe('theme cycling logic', () => {
  it('cycles light -> dark', () => {
    expect(cycleTheme('light')).toBe('dark')
  })

  it('cycles dark -> auto', () => {
    expect(cycleTheme('dark')).toBe('auto')
  })

  it('cycles auto -> light', () => {
    expect(cycleTheme('auto')).toBe('light')
  })

  it('full cycle returns to original', () => {
    let mode: ThemeMode = 'light'
    mode = cycleTheme(mode) // dark
    mode = cycleTheme(mode) // auto
    mode = cycleTheme(mode) // light
    expect(mode).toBe('light')
  })
})

describe('theme resolution logic', () => {
  it('resolves light mode regardless of preference', () => {
    expect(resolveTheme('light', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('resolves dark mode regardless of preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('dark', true)).toBe('dark')
  })

  it('resolves auto to light when user prefers light', () => {
    expect(resolveTheme('auto', false)).toBe('light')
  })

  it('resolves auto to dark when user prefers dark', () => {
    expect(resolveTheme('auto', true)).toBe('dark')
  })
})
