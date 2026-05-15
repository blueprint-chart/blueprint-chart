export interface PlatformShortcut {
  keyLabel: string
  keys: string
  matches: (event: KeyboardEvent) => boolean
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
  return { keyLabel, keys, matches }
}
