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
      <div class="data-structure-panel__main__pills-bar">
        <div
          v-if="isSceneMode"
          class="data-structure-panel__main__scene-banner"
        >
          <strong>{{ sceneBannerTitle }}</strong>
          {{ sceneBannerDetail }}
        </div>
        <DataInsightBadges
          v-else
          :columns="columns"
          :rows="rows"
          :column-types="columnTypes"
        />
        <ButtonIcon
          :icon-left="IPhArrowsClockwise"
          label="Replace data"
          variant="outline-primary"
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
import { LayoutBottomDrawer, ButtonIcon, useBreakpoint } from '@blueprint-chart/ui'
import { useDataTable } from '@/stores/dataTable'
import { useEditorPanel, type DataPanelTab } from '@/stores/editorPanel'
import { useScenes } from '@/stores/scenes'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import { findDataSourceSceneIndex } from '@/utils/scenes'

const { columns, rows, columnTypes } = useDataTable()
const editorPanel = useEditorPanel()
const { panelMode, dataPanelMode, dataPanelTab } = storeToRefs(editorPanel)
const { openDataPanel, closeDataPanel, collapse, setDataView } = editorPanel
const { activeScene, activeIndex, scenes } = useScenes()
const isSceneMode = computed(() => activeScene.value !== null)

const dataSourceIdx = computed(() => findDataSourceSceneIndex(scenes.value, activeIndex.value))

const sceneBannerTitle = computed(() => {
  const srcIdx = dataSourceIdx.value
  if (srcIdx === activeIndex.value) {
    return 'Custom data on this scene.'
  }
  if (srcIdx >= 0) {
    const srcScene = scenes.value[srcIdx]
    const label = srcScene?.name || `Scene ${srcIdx + 1}`
    return `Data inherited from ${label}.`
  }
  return 'Scene override active.'
})

const sceneBannerDetail = computed(() => {
  const srcIdx = dataSourceIdx.value
  if (srcIdx === activeIndex.value) {
    return 'This scene uses its own data, independent of the base dataset.'
  }
  if (srcIdx >= 0) {
    return 'Replace data to set different data for this scene.'
  }
  return 'The table below shows the base data. Replace data to set custom data for this scene.'
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

const mainRef = useTemplateRef<HTMLElement>('mainRef')

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

  &__main {
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

    &__pills-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;

      .data-insight-badges {
        flex: 1;
      }
    }

    &__scene-banner {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--bs-border-radius);
      background: var(--bs-info-bg-subtle);
      color: var(--bs-info-text-emphasis);
      font-size: var(--bs-font-size-sm);
      font-weight: 500;
    }
  }

  &__drawer-body {
    padding: 0.5rem 0;
  }
}

</style>
