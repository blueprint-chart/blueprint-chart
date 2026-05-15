import { usePlatformShortcut } from './usePlatformShortcut'

function fakeKeydown(init: Partial<KeyboardEvent>): KeyboardEvent {
  return new KeyboardEvent('keydown', init as KeyboardEventInit)
}

describe('usePlatformShortcut on mac', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      get: () => 'MacIntel',
    })
  })

  it('returns the ⌘ keyLabel for the K shortcut', () => {
    const s = usePlatformShortcut('k')
    expect(s.keyLabel).toBe('⌘ K')
    expect(s.keys).toBe('Meta+K')
  })

  it('matches Meta+K events', () => {
    const s = usePlatformShortcut('k')
    expect(s.matches(fakeKeydown({ key: 'k', metaKey: true }))).toBe(true)
    expect(s.matches(fakeKeydown({ key: 'k', ctrlKey: true }))).toBe(false)
    expect(s.matches(fakeKeydown({ key: 'k' }))).toBe(false)
  })
})

describe('usePlatformShortcut on non-mac', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      get: () => 'Win32',
    })
  })

  it('returns the Ctrl keyLabel for the K shortcut', () => {
    const s = usePlatformShortcut('k')
    expect(s.keyLabel).toBe('Ctrl K')
    expect(s.keys).toBe('Control+K')
  })

  it('matches Ctrl+K events', () => {
    const s = usePlatformShortcut('k')
    expect(s.matches(fakeKeydown({ key: 'k', ctrlKey: true }))).toBe(true)
    expect(s.matches(fakeKeydown({ key: 'k', metaKey: true }))).toBe(false)
  })
})
