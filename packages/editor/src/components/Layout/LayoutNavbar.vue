<script setup lang="ts">
import { computed } from 'vue'
import {
  ButtonIcon,
  NavigationWorkspaceSwitcher,
  useBreakpoint,
} from '@blueprint-chart/ui'
import { useTheme } from '@/stores/theme'
import IPhList from '~icons/ph/list'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'

defineProps<{ sidebarOpen?: boolean }>()
defineEmits<{ toggleSidebar: [] }>()

const { resolvedTheme } = useTheme()
// The wordmark only overflows the navbar on phone-width rows (~375px); keep
// it visible through tablet widths and drop it below sm only.
const { isNarrow: isCompact } = useBreakpoint('sm')
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
        variant="primary"
        aria-haspopup="dialog"
        :aria-expanded="sidebarOpen ? 'true' : 'false'"
        aria-controls="layout-sidebar-offcanvas"
        @click="$emit('toggleSidebar')"
      />
      <NavigationWorkspaceSwitcher
        name="Blueprint Chart"
        :logo-src="logoSrc"
        :hide-name="isCompact"
        to="/"
      />
    </div>
  </header>
</template>

<style scoped lang="scss">
.layout-navbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.25rem;
  background: color-mix(in srgb, var(--bs-body-bg) 85%, transparent);
  backdrop-filter: saturate(150%) blur(10px);
  -webkit-backdrop-filter: saturate(150%) blur(10px);
  flex-shrink: 0;
  z-index: 1040;
}

.layout-navbar__lead {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
