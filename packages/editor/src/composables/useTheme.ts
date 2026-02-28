import { watch } from 'vue'
import { useStorage, useMediaQuery } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'blueprint-chart-theme'

const theme = useStorage<ThemeMode>(STORAGE_KEY, 'light')
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

function applyTheme(mode: ThemeMode): void {
  let resolved: 'light' | 'dark' = 'light'
  if (mode === 'dark') {
    resolved = 'dark'
  }
  else if (mode === 'auto') {
    resolved = prefersDark.value ? 'dark' : 'light'
  }
  document.documentElement.setAttribute('data-bs-theme', resolved)
}

watch(prefersDark, () => {
  if (theme.value === 'auto') applyTheme('auto')
})

watch(theme, (mode) => {
  applyTheme(mode)
}, { immediate: true })

export function useTheme() {
  function cycleTheme(): void {
    const modes: ThemeMode[] = ['light', 'dark', 'auto']
    const idx = modes.indexOf(theme.value)
    theme.value = modes[(idx + 1) % modes.length]
  }

  return { theme, cycleTheme }
}
