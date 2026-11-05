<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  NavigationCommandBar,
  NavigationSidebar,
  NavigationSidebarGroup,
  NavigationSidebarItem,
  NavigationWorkspaceSwitcher,
} from '@blueprint-chart/ui'
import { useDashboardGallery } from '@/composables/useDashboardGallery'
import { useTheme } from '@/stores/theme'
import { usePlatformShortcut } from '@/composables/usePlatformShortcut'
import AccountMenu from '@/components/Account/AccountMenu.vue'
import logoLight from '@/assets/images/blueprint-chart-logo.svg'
import logoDark from '@/assets/images/blueprint-chart-logo-dark.svg'
import IPhHouse from '~icons/ph/house'
import IPhPresentationChart from '~icons/ph/presentation-chart'
import IPhPalette from '~icons/ph/palette'
import IPhGithubLogo from '~icons/ph/github-logo'
import IPhTable from '~icons/ph/table'
import IPhCompass from '~icons/ph/compass'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhGraduationCap from '~icons/ph/graduation-cap'
import IPhBracketsCurly from '~icons/ph/brackets-curly'

defineEmits<{ searchClick: [] }>()

const docSections = [
  { label: 'Guide', href: 'https://docs.blueprintchart.com/guide/getting-started', icon: IPhCompass },
  { label: 'Charts', href: 'https://docs.blueprintchart.com/charts/', icon: IPhChartBar },
  { label: 'Handbook', href: 'https://docs.blueprintchart.com/handbook/', icon: IPhGraduationCap },
  { label: 'Reference', href: 'https://docs.blueprintchart.com/reference/', icon: IPhBracketsCurly },
]

const route = useRoute()
const { sortedCharts } = useDashboardGallery()
const { resolvedTheme } = useTheme()
const shortcut = usePlatformShortcut('k')

const recent = computed(() => sortedCharts.value.slice(0, 5))
const isHome = computed(() => route.path === '/')
const isCharts = computed(() => route.path.startsWith('/charts'))
const isDatasets = computed(() => route.path.startsWith('/datasets'))
const isPalettes = computed(() => route.path.startsWith('/palettes'))
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
          <IPhPresentationChart />
        </template>
      </NavigationSidebarItem>
      <NavigationSidebarItem
        to="/datasets"
        label="Datasets"
        :active="isDatasets"
      >
        <template #icon>
          <IPhTable />
        </template>
      </NavigationSidebarItem>
      <NavigationSidebarItem
        to="/palettes"
        label="Palettes"
        :active="isPalettes"
      >
        <template #icon>
          <IPhPalette />
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

    <NavigationSidebarGroup eyebrow="Documentation">
      <NavigationSidebarItem
        v-for="section in docSections"
        :key="section.href"
        :href="section.href"
        :label="section.label"
      >
        <template #icon>
          <component :is="section.icon" />
        </template>
      </NavigationSidebarItem>
    </NavigationSidebarGroup>

    <NavigationSidebarGroup eyebrow="Resources">
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
      <AccountMenu />
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
</style>
