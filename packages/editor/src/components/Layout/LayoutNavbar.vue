<script setup lang="ts">
import { computed } from 'vue'
import {
  ButtonIcon,
  NavigationCommandBar,
  NavigationWorkspaceSwitcher,
  useBreakpoint,
} from '@blueprint-chart/ui'
import { useTheme, type ThemeMode } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

defineEmits<{ searchClick: [] }>()

const { theme, cycleTheme } = useTheme()
const { isNarrow } = useBreakpoint()
const shortcut = usePlatformShortcut('k')

const iconByTheme: Record<ThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}

const themeIcon = computed(() => iconByTheme[theme.value])
const placeholder = computed(() => isNarrow.value ? 'Search…' : 'Search or jump to…')
</script>

<template>
  <header
    class="layout-navbar"
    role="banner"
  >
    <NavigationWorkspaceSwitcher name="Blueprint" />

    <div class="layout-navbar__spacer" />

    <NavigationCommandBar
      :placeholder="placeholder"
      :shortcut-label="shortcut.keyLabel"
      class="layout-navbar__search"
      @click="$emit('searchClick')"
    />

    <ButtonIcon
      :icon-left="themeIcon"
      label="Toggle theme"
      hide-label
      square
      variant="outline-secondary"
      size="sm"
      @click="cycleTheme"
    />
  </header>
</template>

<style scoped lang="scss">
.layout-navbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding: 0 0.875rem;
  background: var(--bc-chrome-bg);
  border-bottom: 1px solid var(--bc-hairline);
  flex-shrink: 0;
  z-index: 1040;
}

.layout-navbar__spacer { flex: 1; }
</style>
