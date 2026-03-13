<template>
  <div
    class="dashboard-page"
    :class="{ 'dashboard-page--narrow': isNarrow }"
  >
    <div
      ref="galleryRef"
      class="dashboard-page__gallery"
    >
      <DashboardToolbar
        :chart-count="sortedCharts.length"
        :sort-value="sortValue"
        :layout="viewLayout"
        @update:sort-value="sortValue = $event"
        @update:layout="viewLayout = $event"
      />

      <DashboardGallery
        :charts="sortedCharts"
        :thumbnails="thumbnails"
        :selected-id="selectedChartId"
        :layout="viewLayout"
        @select="selectChart"
        @edit="(id: string) => router.push(`/edit/${id}`)"
        @new="router.push('/new')"
      />

      <PanelFloating
        v-if="panelMode === 'floating' && !isNarrow"
        :container-ref="galleryRef"
        :title="selectedChart ? (selectedChart.title || 'Untitled') : 'Chart details'"
        :position="floatingPosition"
        :show-close="false"
        @dock="dock"
        @close="collapse"
      >
        <DashboardDetailContent
          v-if="selectedChart"
          :title="selectedChart.title || 'Untitled'"
          :subtitle="selectedChart.description"
          :preview-src="selectedChartId ? previews[selectedChartId] : undefined"
          :force-light-theme="selectedChart ? !selectedChart.allowDarkMode : false"
          :chart-type="selectedChart.chartType"
          :saved-at="selectedChart.savedAt ?? undefined"
          :scene-count="selectedChart.sceneCount"
          :row-count="selectedChart.rowCount"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
      </PanelFloating>
    </div>

    <template v-if="isNarrow">
      <LayoutBottomDrawer
        v-model="drawerOpen"
        :title="selectedChart ? (selectedChart.title || 'Untitled') : undefined"
      >
        <DashboardDetailContent
          v-if="selectedChart"
          :title="selectedChart.title || 'Untitled'"
          :subtitle="selectedChart.description"
          :preview-src="selectedChartId ? previews[selectedChartId] : undefined"
          :force-light-theme="selectedChart ? !selectedChart.allowDarkMode : false"
          :chart-type="selectedChart.chartType"
          :saved-at="selectedChart.savedAt ?? undefined"
          :scene-count="selectedChart.sceneCount"
          :row-count="selectedChart.rowCount"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
      </LayoutBottomDrawer>
    </template>
    <template v-else>
      <PanelDocked
        v-model="dockedPanelWidth"
        :collapsed="panelMode !== 'docked'"
        :show-close="!!selectedChart"
        :title="selectedChart ? (selectedChart.title || 'Untitled') : 'Chart details'"
        @float="float"
        @close="collapse"
      >
        <DashboardDetailContent
          v-if="selectedChart"
          :title="selectedChart.title || 'Untitled'"
          :subtitle="selectedChart.description"
          :preview-src="selectedChartId ? previews[selectedChartId] : undefined"
          :force-light-theme="selectedChart ? !selectedChart.allowDarkMode : false"
          :chart-type="selectedChart.chartType"
          :saved-at="selectedChart.savedAt ?? undefined"
          :scene-count="selectedChart.sceneCount"
          :row-count="selectedChart.rowCount"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
        <DashboardEmptyState v-else />
      </PanelDocked>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutBottomDrawer, useBreakpoint } from '@blueprint-chart/ui'
import { useDashboardPanel } from '@/composables/useDashboardPanel'
import { useDashboardGallery } from '@/composables/useDashboardGallery'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import PanelFloating from '@/components/Panel/PanelFloating.vue'
import DashboardToolbar from './DashboardToolbar.vue'
import DashboardGallery from './DashboardGallery.vue'
import DashboardDetailContent from './DashboardDetailContent.vue'
import DashboardEmptyState from './DashboardEmptyState.vue'

const router = useRouter()
const { isNarrow } = useBreakpoint()
const {
  panelMode,
  selectedChartId,
  dockedPanelWidth,
  floatingPosition,
  selectChart,
  dock,
  float,
  collapse,
} = useDashboardPanel()
const {
  sortedCharts,
  selectedChart,
  thumbnails,
  previews,
  sortValue,
  refresh,
  duplicateChart,
  removeChart,
} = useDashboardGallery()

const galleryRef = useTemplateRef<HTMLElement>('galleryRef')
const viewLayout = shallowRef<'grid' | 'row'>('grid')

const drawerOpen = computed({
  get: () => panelMode.value !== 'collapsed' && selectedChartId.value !== null,
  set: (open) => {
    if (!open) {
      collapse()
    }
  },
})

watch(isNarrow, (narrow) => {
  if (narrow && panelMode.value !== 'collapsed') {
    collapse()
  }
}, { immediate: true })

function editSelected() {
  if (selectedChartId.value) {
    router.push(`/edit/${selectedChartId.value}`)
  }
}

function duplicateSelected() {
  if (selectedChartId.value) {
    const newId = duplicateChart(selectedChartId.value)
    if (newId) {
      router.push(`/edit/${newId}`)
    }
  }
}

function deleteSelected() {
  if (selectedChartId.value) {
    removeChart(selectedChartId.value)
  }
}

function handleKeydown(e: globalThis.KeyboardEvent) {
  if (e.key === 'Escape') {
    selectedChartId.value = null
  }
}

onMounted(() => {
  refresh()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: var(--bc-tile-gap);
  padding: var(--bc-tile-gap) 0 var(--bc-tile-gap) var(--bc-tile-gap);
  background: var(--bc-void-bg);

  &--narrow {
    flex-direction: column;
    gap: 0;
    padding: 0;
  }

  &__gallery {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 1.75rem;
    background: var(--bc-tile-bg);
    border-radius: var(--bc-tile-radius);
    box-shadow: var(--bc-tile-shadow);
    border: var(--bc-tile-border);
    position: relative;

    .dashboard-page--narrow & {
      border-radius: 0;
      border: none;
      box-shadow: none;
    }
  }
}

:deep(.layout-panel) {
  background: var(--bc-tile-bg);
}

:deep(.layout-panel__header) {
  border-bottom: 1px solid var(--bs-border-color);
}
</style>
