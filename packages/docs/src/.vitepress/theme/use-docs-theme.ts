import { computed, ref, watch } from 'vue'
import { useMediaQuery, useStorage } from '@vueuse/core'
import { useData } from 'vitepress'

export type DocsThemeMode = 'light' | 'dark' | 'auto'

const MODES: DocsThemeMode[] = ['light', 'dark', 'auto']

function isMode(v: unknown): v is DocsThemeMode {
  return v === 'light' || v === 'dark' || v === 'auto'
}

export function useDocsTheme() {
  const stored = useStorage<DocsThemeMode>('bc-theme', 'auto', undefined, {
    flush: 'sync',
    listenToStorageChanges: true,
    serializer: {
      read: (raw: string) => (isMode(raw) ? raw : 'auto'),
      write: (v: DocsThemeMode) => v,
    },
  })

  const theme = ref<DocsThemeMode>(stored.value)
  watch(stored, (next) => { if (next !== theme.value) theme.value = next })

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'dark') return 'dark'
    if (theme.value === 'auto') return prefersDark.value ? 'dark' : 'light'
    return 'light'
  })

  const { isDark } = useData()
  watch(
    resolvedTheme,
    (resolved) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-bs-theme', resolved)
      }
      isDark.value = resolved === 'dark'
    },
    { immediate: true },
  )

  function cycleTheme(): void {
    const idx = MODES.indexOf(theme.value)
    const next = MODES[(idx + 1) % MODES.length]
    theme.value = next
    stored.value = next
  }

  return { theme, resolvedTheme, cycleTheme }
}
