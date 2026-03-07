<template>
  <div
    class="data-structure-panel"
    :class="panelClassList"
  >
    <DataSideIconRail
      v-if="isNarrow"
      horizontal
      :disabled-tabs="sceneDisabledTabs"
    />
    <div
      ref="mainRef"
      class="data-structure-panel__main"
    >
      <div
        v-if="isSceneMode"
        class="data-structure-panel__scene-banner"
      >
        <strong>Scene override active.</strong>
        The table below shows the base data from {{ dataSourceLabel }}. Use transforms to shape the data for this scene without altering the original.
      </div>
      <div
        v-if="!isSceneMode"
        class="data-structure-panel__pills-bar"
      >
        <DataInsightBadges
          :columns="columns"
          :rows="rows"
          :column-types="columnTypes"
        />
        <ButtonIcon
          :icon-left="IPhArrowsClockwise"
          label="Replace data"
          variant="outline-secondary"
          size="sm"
          @click="replaceData"
        />
      </div>
      <DataCheckTable />
      <DataFloatingPanel
        v-if="panelMode === 'floating' && dataPanelMode !== 'collapsed'"
        :container-ref="mainRef"
      />
    </div>
    <template v-if="isNarrow">
      <LayoutBottomDrawer v-model="drawerOpen">
        <PanelTabBar
          :tabs="activeTabs"
          :model-value="dataPanelTab"
          sticky
          @update:model-value="openDataPanel($event as DataPanelTab)"
        />
        <div class="data-structure-panel__drawer-body">
          <DataColumnSettings v-if="dataPanelTab === 'column'" />
          <DataTransformPipeline v-else-if="dataPanelTab === 'transforms'" />
          <DataParseSettings v-else-if="dataPanelTab === 'parsing'" />
          <DataRecommendations v-else-if="dataPanelTab === 'reco'" />
        </div>
      </LayoutBottomDrawer>
    </template>
    <template v-else>
      <DataSidePanel :collapsed="panelMode !== 'docked' || dataPanelMode === 'collapsed'" />
      <DataSideIconRail :disabled-tabs="sceneDisabledTabs" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { LayoutBottomDrawer, ButtonIcon, useBreakpoint } from '@blueprint-chart/ui'
import { useDataTable } from '@/composables/useDataTable'
import { useEditorPanel, type DataPanelTab } from '@/composables/useEditorPanel'
import { useScenes } from '@/composables/useScenes'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import DataInsightBadges from './DataInsightBadges.vue'
import DataCheckTable from './DataCheckTable.vue'
import DataSideIconRail from './DataSideIconRail.vue'
import DataSidePanel from './DataSidePanel.vue'
import DataFloatingPanel from './DataFloatingPanel.vue'
import DataColumnSettings from './DataColumnSettings.vue'
import DataTransformPipeline from './DataTransformPipeline.vue'
import DataParseSettings from './DataParseSettings.vue'
import DataRecommendations from './DataRecommendations.vue'

const { columns, rows, columnTypes } = useDataTable()
const { panelMode, dataPanelMode, dataPanelTab, openDataPanel, closeDataPanel, collapse, setDataView } = useEditorPanel()
const { activeScene, activeIndex, scenes } = useScenes()
const isSceneMode = computed(() => activeScene.value !== null)
const dataSourceLabel = computed(() => {
  if (activeIndex.value <= 0) {
    return 'Scene 1'
  }
  // The data source for the current scene is the previous scene in the timeline
  const prevScene = scenes.value[activeIndex.value - 1]
  const name = prevScene?.name
  return name || `Scene ${activeIndex.value + 1}`
})

function replaceData() {
  setDataView('upload')
}
const { isNarrow } = useBreakpoint()

watch(isNarrow, (narrow) => {
  if (narrow && dataPanelMode.value !== 'collapsed') {
    closeDataPanel()
  }
}, { immediate: true })

const mainRef = ref<HTMLElement | null>(null)

const allTabs = [
  { key: 'column' as DataPanelTab, label: 'Columns' },
  { key: 'transforms' as DataPanelTab, label: 'Transforms' },
  { key: 'parsing' as DataPanelTab, label: 'Parsing' },
  { key: 'reco' as DataPanelTab, label: 'Recommendations' },
]

const sceneDisabledTabs = computed(() => isSceneMode.value ? ['parsing'] : [])

const activeTabs = computed(() =>
  isSceneMode.value ? allTabs.filter(t => t.key !== 'parsing') : allTabs,
)

const drawerOpen = computed({
  get: () => isNarrow.value && dataPanelMode.value !== 'collapsed' && !!dataPanelTab.value,
  set: (open) => {
    if (!open) {
      collapse()
    }
  },
})

const panelClassList = computed(() => ({
  'data-structure-panel--narrow': isNarrow.value,
}))
</script>

<style scoped lang="scss">
.data-structure-panel {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: var(--bc-tile-gap);

  &--narrow {
    flex-direction: column;
    gap: 0;
  }
}

.data-structure-panel__main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 1.25rem;
  position: relative;
  background: var(--bc-tile-bg);
  border-radius: var(--bc-tile-radius);
  box-shadow: var(--bc-tile-shadow);
  border: var(--bc-tile-border);

  .data-structure-panel--narrow & {
    // keep tile styling on narrow screens
  }
}

.data-structure-panel__pills-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;

  .data-insight-badges {
    flex: 1;
  }
}

.data-structure-panel__scene-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: var(--bs-border-radius);
  background: var(--bs-info-bg-subtle);
  color: var(--bs-info-text-emphasis);
  font-size: 0.8125rem;
  font-weight: 500;
}

.data-structure-panel__drawer-body {
  padding: 0.5rem 0;
}

:deep(.layout-panel) {
  background: var(--bc-tile-bg);
}
</style>
