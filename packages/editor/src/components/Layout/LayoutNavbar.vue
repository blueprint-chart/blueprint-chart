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
import IPhList from '~icons/ph/list'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'

defineProps<{ sidebarOpen?: boolean }>()
defineEmits<{ searchClick: [], toggleSidebar: [] }>()

const { theme, cycleTheme, resolvedTheme } = useTheme()
const { isNarrow } = useBreakpoint()
const shortcut = usePlatformShortcut('k')

const iconByTheme: Record<ThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}

const themeIcon = computed(() => iconByTheme[theme.value])
const placeholder = computed(() => isNarrow.value ? 'Search…' : 'Search or jump to…')
const logoSrc = computed(() => resolvedTheme.value === 'dark' ? logoDark : logoLight)
</script>

<template>
  <header class="layout-navbar">
    <div class="layout-navbar__lead d-xl-none">
      <ButtonIcon
        :icon-left="IPhList"
        label="Open navigation"
        hide-label
        square
        size="sm"
        variant="outline-secondary"
        aria-haspopup="dialog"
        :aria-expanded="sidebarOpen ? 'true' : 'false'"
        aria-controls="layout-sidebar-offcanvas"
        @click="$emit('toggleSidebar')"
      />
      <NavigationWorkspaceSwitcher
        name="Blueprint Chart"
        :logo-src="logoSrc"
        to="/"
      />
    </div>

    <NavigationCommandBar
      :placeholder="placeholder"
      :shortcut-label="shortcut.keyLabel"
      :collapsed="isNarrow"
      class="layout-navbar__search"
      @click="$emit('searchClick')"
    />

    <div class="layout-navbar__spacer" />

    <ButtonIcon
      :icon-left="themeIcon"
      label="Toggle theme"
      hide-label
      square
      variant="outline-secondary"
      size="sm"
      class="layout-navbar__theme"
      @click="cycleTheme"
    />
  </header>
</template>

<style scoped lang="scss">
@use "bootstrap/scss/mixins/breakpoints" as bsbp;

// Bootstrap 5.3's _variables.scss has @import-style internal dependencies that
// don't resolve cleanly under @use, so declare $grid-breakpoints locally.
// Values mirror node_modules/bootstrap/scss/_variables.scss.
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
);

.layout-navbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.25rem;
  background: color-mix(in srgb, var(--bc-chrome-bg) 85%, transparent);
  backdrop-filter: saturate(150%) blur(10px);
  -webkit-backdrop-filter: saturate(150%) blur(10px);
  border-bottom: 1px solid var(--bc-hairline);
  flex-shrink: 0;
  z-index: 1040;
}

.layout-navbar__spacer { flex: 1; }

.layout-navbar__lead {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

// Narrow viewports: search jumps after the spacer so it sits on the right
// next to the theme toggle. Wide viewports keep the natural DOM order
// (search on the left).
@include bsbp.media-breakpoint-down(xl, $grid-breakpoints) {
  .layout-navbar__search { order: 1; }
  .layout-navbar__theme { order: 2; }
}

</style>
