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
import IPhHouse from '~icons/ph/house'
import IPhSquaresFour from '~icons/ph/squares-four'

const route = useRoute()
const { sortedCharts } = useDashboardGallery()

const recent = computed(() => sortedCharts.value.slice(0, 5))
const isHome = computed(() => route.path === '/')
const isCharts = computed(() => route.path.startsWith('/charts'))
</script>

<template>
  <NavigationSidebar aria-label="Workspace navigation">
    <template #header>
      <NavigationWorkspaceSwitcher name="Blueprint" />
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
  </NavigationSidebar>
</template>
