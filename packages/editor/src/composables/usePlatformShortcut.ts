export interface PlatformShortcut {
  keyLabel: string
  keys: string
  matches: (event: KeyboardEvent) => boolean
  trigger: () => void
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
}

export function usePlatformShortcut(key: string): PlatformShortcut {
  const upper = key.toUpperCase()
  const mac = isMac()
  const keyLabel = mac ? `⌘ ${upper}` : `Ctrl ${upper}`
  const keys = mac ? `Meta+${upper}` : `Control+${upper}`
  function matches(event: KeyboardEvent): boolean {
    if (event.key.toLowerCase() !== key.toLowerCase()) {
      return false
    }
    return mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey
  }
  // Synthesize a keydown that matches() accepts, so click handlers can replay
  // the shortcut without re-deriving its platform-specific modifier (which is
  // exactly the kind of drift that breaks the two paths apart).
  function trigger(): void {
    if (typeof document === 'undefined') {
      return
    }
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      code: `Key${upper}`,
      metaKey: mac,
      ctrlKey: !mac,
      bubbles: true,
    }))
  }
  return { keyLabel, keys, matches, trigger }
}
