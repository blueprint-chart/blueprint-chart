import { usePlatformShortcut } from './usePlatformShortcut'

function fakeKeydown(init: Partial<KeyboardEvent>): KeyboardEvent {
  return new KeyboardEvent('keydown', init as KeyboardEventInit)
}

const originalPlatform = navigator.platform
afterAll(() => {
  Object.defineProperty(navigator, 'platform', {
    configurable: true,
    get: () => originalPlatform,
  })
})

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
    expect(s.matches(fakeKeydown({ key: 'k', metaKey: true, ctrlKey: false }))).toBe(true)
    expect(s.matches(fakeKeydown({ key: 'k', metaKey: false, ctrlKey: true }))).toBe(false)
    expect(s.matches(fakeKeydown({ key: 'k', metaKey: false, ctrlKey: false }))).toBe(false)
  })

  it('trigger() dispatches a keydown that its own matches() accepts', () => {
    const s = usePlatformShortcut('k')
    let captured: KeyboardEvent | null = null
    const handler = (ev: Event) => {
      captured = ev as KeyboardEvent
    }
    document.addEventListener('keydown', handler)
    s.trigger()
    document.removeEventListener('keydown', handler)
    expect(captured).not.toBeNull()
    expect(captured!.key).toBe('k')
    expect(captured!.metaKey).toBe(true)
    expect(captured!.ctrlKey).toBe(false)
    expect(s.matches(captured!)).toBe(true)
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
    expect(s.matches(fakeKeydown({ key: 'k', ctrlKey: true, metaKey: false }))).toBe(true)
    expect(s.matches(fakeKeydown({ key: 'k', ctrlKey: false, metaKey: true }))).toBe(false)
    expect(s.matches(fakeKeydown({ key: 'j', ctrlKey: true, metaKey: false }))).toBe(false)
  })

  it('trigger() dispatches a keydown that its own matches() accepts', () => {
    const s = usePlatformShortcut('k')
    let captured: KeyboardEvent | null = null
    const handler = (ev: Event) => {
      captured = ev as KeyboardEvent
    }
    document.addEventListener('keydown', handler)
    s.trigger()
    document.removeEventListener('keydown', handler)
    expect(captured).not.toBeNull()
    expect(captured!.key).toBe('k')
    expect(captured!.ctrlKey).toBe(true)
    expect(captured!.metaKey).toBe(false)
    expect(s.matches(captured!)).toBe(true)
  })
})
