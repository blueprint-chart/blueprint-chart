import { computed, watch } from 'vue'
import { useStorage, useMediaQuery } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'blueprint-chart-theme'

const theme = useStorage<ThemeMode>(STORAGE_KEY, 'light')
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

export function useTheme() {
  function cycleTheme(): void {
    const modes: ThemeMode[] = ['light', 'dark', 'auto']
    const idx = modes.indexOf(theme.value)
    theme.value = modes[(idx + 1) % modes.length]
  }

  return { theme, resolvedTheme, cycleTheme }
}
