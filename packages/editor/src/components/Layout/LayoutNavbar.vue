<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ButtonIcon,
  NavigationCommandBar,
  useBreakpoint,
} from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'
import { useTheme, type ThemeMode } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

defineEmits<{ searchClick: [] }>()

const route = useRoute()
const config = useChartConfig()
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

// Route-derived breadcrumb. The sidebar already owns workspace identity;
// the topbar surfaces the current location.
type Crumb = { label: string, to?: string }
const crumbs = computed<Crumb[]>(() => {
  const path = route.path
  if (path.startsWith('/edit/')) {
    const title = config._base.title.value || 'Untitled'
    return [{ label: 'My Charts', to: '/charts' }, { label: title }]
  }
  if (path.startsWith('/charts')) {
    return [{ label: 'My Charts' }]
  }
  if (path === '/new') {
    return [{ label: 'My Charts', to: '/charts' }, { label: 'New chart' }]
  }
  return []
})
</script>

<template>
  <header class="layout-navbar">
    <nav
      v-if="crumbs.length"
      class="layout-navbar__crumbs"
      aria-label="Breadcrumb"
    >
      <template
        v-for="(crumb, i) in crumbs"
        :key="i"
      >
        <router-link
          v-if="crumb.to"
          :to="crumb.to"
          class="layout-navbar__crumb"
        >
          {{ crumb.label }}
        </router-link>
        <span
          v-else
          class="layout-navbar__crumb layout-navbar__crumb--active"
          :aria-current="i === crumbs.length - 1 ? 'page' : undefined"
        >{{ crumb.label }}</span>
        <span
          v-if="i < crumbs.length - 1"
          class="layout-navbar__crumb-sep"
          aria-hidden="true"
        >/</span>
      </template>
    </nav>

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

.layout-navbar__crumbs {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  font-size: var(--bs-font-size-sm);
}

.layout-navbar__crumb {
  color: var(--bs-secondary-color);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--bc-duration-base) var(--bc-ease);

  &:hover {
    color: var(--bs-body-color);
  }
}

.layout-navbar__crumb--active {
  color: var(--bs-body-color);
  font-weight: 500;
}

.layout-navbar__crumb-sep {
  color: var(--bs-tertiary-color);
  opacity: 0.5;
}
</style>
