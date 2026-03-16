import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { defineStore, storeToRefs } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeMode>('light')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'dark') {
      return 'dark'
    }
    if (theme.value === 'auto') {
      return prefersDark.value ? 'dark' : 'light'
    }
    return 'light'
  })

  watch(resolvedTheme, (resolved) => {
    document.documentElement.setAttribute('data-bs-theme', resolved)
  }, { immediate: true })

  function cycleTheme(): void {
    const modes: ThemeMode[] = ['light', 'dark', 'auto']
    const idx = modes.indexOf(theme.value)
    theme.value = modes[(idx + 1) % modes.length]
  }

  return { theme, resolvedTheme, cycleTheme }
}, {
  persist: {
    key: 'bc-theme',
    pick: ['theme'],
  },
})

/**
 * Convenience wrapper that returns destructure-safe refs.
 * Drop-in replacement for the old `useTheme()` composable.
 */
export function useTheme() {
  const store = useThemeStore()
  const { theme, resolvedTheme } = storeToRefs(store)
  return { theme, resolvedTheme, cycleTheme: store.cycleTheme }
}
