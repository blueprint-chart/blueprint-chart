import { ref, watchEffect } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'blueprint-chart-theme'

const theme = ref<ThemeMode>((localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'light')

function applyTheme(mode: ThemeMode): void {
  let resolved: 'light' | 'dark' = 'light'
  if (mode === 'dark') {
    resolved = 'dark'
  }
  else if (mode === 'auto') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  document.documentElement.setAttribute('data-bs-theme', resolved)
}

// Listen to system preference changes
const mql = window.matchMedia('(prefers-color-scheme: dark)')
mql.addEventListener('change', () => {
  if (theme.value === 'auto') applyTheme('auto')
})

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, theme.value)
  applyTheme(theme.value)
})

export function useTheme() {
  function cycleTheme(): void {
    const modes: ThemeMode[] = ['light', 'dark', 'auto']
    const idx = modes.indexOf(theme.value)
    theme.value = modes[(idx + 1) % modes.length]
  }

  return { theme, cycleTheme }
}
