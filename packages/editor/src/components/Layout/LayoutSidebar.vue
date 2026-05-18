<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  NavigationSidebar,
  NavigationSidebarGroup,
  NavigationSidebarItem,
  NavigationWorkspaceSwitcher,
} from '@blueprint-chart/ui'
import { useDashboardGallery } from '@/composables/useDashboardGallery'
import { useTheme } from '@/stores/theme'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhHouse from '~icons/ph/house'
import IPhSquaresFour from '~icons/ph/squares-four'
import IPhGithubLogo from '~icons/ph/github-logo'
import IPhBookOpen from '~icons/ph/book-open'

const route = useRoute()
const { sortedCharts } = useDashboardGallery()
const { resolvedTheme } = useTheme()

const recent = computed(() => sortedCharts.value.slice(0, 5))
const isHome = computed(() => route.path === '/')
const isCharts = computed(() => route.path.startsWith('/charts'))
const logoSrc = computed(() => resolvedTheme.value === 'dark' ? logoDark : logoLight)
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
        label="My Charts"
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
</style>
