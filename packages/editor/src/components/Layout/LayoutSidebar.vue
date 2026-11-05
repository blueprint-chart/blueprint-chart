<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ButtonIcon,
  NavigationCommandBar,
  NavigationSidebar,
  NavigationSidebarGroup,
  NavigationSidebarItem,
  NavigationWorkspaceSwitcher,
} from '@blueprint-chart/ui'
import { useDashboardGallery } from '@/composables/useDashboardGallery'
import { useTheme, type ThemeMode } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import { accountsEnabled } from '@/config/runtimeConfig'
import AccountMenu from '@/components/Account/AccountMenu.vue'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhHouse from '~icons/ph/house'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhGithubLogo from '~icons/ph/github-logo'
import IPhBookOpen from '~icons/ph/book-open'
import IPhSun from '~icons/ph/sun'
import IPhMoon from '~icons/ph/moon'
import IPhCircleHalf from '~icons/ph/circle-half'

defineEmits<{ searchClick: [] }>()

const route = useRoute()
const { sortedCharts } = useDashboardGallery()
const { theme, cycleTheme, resolvedTheme } = useTheme()
const shortcut = usePlatformShortcut('k')
const showAccount = accountsEnabled()

const iconByTheme: Record<ThemeMode, typeof IPhSun> = {
  light: IPhSun,
  dark: IPhMoon,
  auto: IPhCircleHalf,
}

const recent = computed(() => sortedCharts.value.slice(0, 5))
const isHome = computed(() => route.path === '/')
const isCharts = computed(() => route.path.startsWith('/charts'))
const logoSrc = computed(() => resolvedTheme.value === 'dark' ? logoDark : logoLight)
const themeIcon = computed(() => iconByTheme[theme.value])
</script>

<template>
  <NavigationSidebar aria-label="Workspace navigation">
    <template #header>
      <div class="layout-sidebar__header">
        <NavigationWorkspaceSwitcher
          name="Blueprint Chart"
          :logo-src="logoSrc"
          to="/"
        />
        <slot name="trailing" />
      </div>
      <NavigationCommandBar
        placeholder="Search or jump to…"
        :shortcut-label="shortcut.keyLabel"
        class="layout-sidebar__search"
        @click="$emit('searchClick')"
      />
    </template>

    <NavigationSidebarGroup eyebrow="Workspace">
      <NavigationSidebarItem
        to="/"
        label="Home"
        :active="isHome"
      >
        <template #icon>
          <IPhHouse />
        </template>
      </NavigationSidebarItem>
      <NavigationSidebarItem
        to="/charts"
        label="My charts"
        :active="isCharts"
        :count="sortedCharts.length || undefined"
      >
        <template #icon>
          <IPhSquaresFour />
        </template>
      </NavigationSidebarItem>
    </NavigationSidebarGroup>

    <NavigationSidebarGroup
      v-if="recent.length"
      eyebrow="Recent"
    >
      <NavigationSidebarItem
        v-for="chart in recent"
        :key="chart.id"
        :to="`/edit/${chart.id}`"
        :label="chart.title || 'Untitled'"
      />
    </NavigationSidebarGroup>

    <NavigationSidebarGroup eyebrow="Resources">
      <NavigationSidebarItem
        href="https://docs.blueprintchart.com"
        label="Documentation"
      >
        <template #icon>
          <IPhBookOpen />
        </template>
      </NavigationSidebarItem>
      <NavigationSidebarItem
        href="https://github.com/blueprint-chart/blueprint-chart"
        label="GitHub"
      >
        <template #icon>
          <IPhGithubLogo />
        </template>
      </NavigationSidebarItem>
    </NavigationSidebarGroup>

    <template #footer>
      <div class="layout-sidebar__footer">
        <AccountMenu
          v-if="showAccount"
          drop-up
        />
        <ButtonIcon
          :icon-left="themeIcon"
          label="Toggle theme"
          hide-label
          square
          variant="outline-secondary"
          size="sm"
          class="layout-sidebar__footer__theme"
          @click="cycleTheme"
        />
      </div>
    </template>
  </NavigationSidebar>
</template>

<style scoped lang="scss">
.layout-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.layout-sidebar__search {
  width: 100%;
  margin-top: 0.75rem;
}

.layout-sidebar__footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__theme {
    margin-left: auto;
  }
}
</style>
