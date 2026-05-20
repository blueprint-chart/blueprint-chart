import { computed, ref, watch } from 'vue'
import { useMediaQuery, useStorage } from '@vueuse/core'
import { useData } from 'vitepress'

export type DocsThemeMode = 'light' | 'dark' | 'auto'

const MODES: DocsThemeMode[] = ['light', 'dark', 'auto']

function isMode(v: unknown): v is DocsThemeMode {
  return v === 'light' || v === 'dark' || v === 'auto'
}

export function useDocsTheme() {
  // Editor's Pinia store writes this key as `{"theme":"<mode>"}` via
  // pinia-plugin-persistedstate. Match that shape so the preference carries
  // over both directions when a visitor uses both apps on the same host.
  const stored = useStorage<DocsThemeMode>('bc-theme', 'auto', undefined, {
    flush: 'sync',
    listenToStorageChanges: true,
    serializer: {
      read: (raw: string) => {
        try {
          const parsed = JSON.parse(raw)
          if (parsed && isMode(parsed.theme)) return parsed.theme
        } catch { /* fall through */ }
        return 'auto'
      },
      write: (v: DocsThemeMode) => JSON.stringify({ theme: v }),
    },
  })

  const theme = ref<DocsThemeMode>(stored.value)
  watch(theme, (next) => { stored.value = next }, { flush: 'sync' })
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
    theme.value = MODES[(idx + 1) % MODES.length]
  }

  return { theme, resolvedTheme, cycleTheme }
}
