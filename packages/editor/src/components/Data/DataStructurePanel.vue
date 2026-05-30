<template>
  <div
    class="data-structure-panel"
    :class="panelClassList"
  >
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
      <div
        class="data-structure-panel__main__timeline-slot"
        data-timeline-slot
      />
    </div>
    <PanelShell
      v-if="dataPanelOpen"
      v-model:drawer-open="drawerOpen"
      :title="panelTitle"
      :container-ref="mainRef"
      @close="closeDataPanel"
    >
      <template
        v-if="panelMode === 'drawer'"
        #tabs
      >
        <PanelTabBar
          :tabs="activeTabs"
          :model-value="dataPanelTab"
          sticky
          @update:model-value="onDrawerTabPick"
        />
      </template>
      <DataColumnSettings v-if="dataPanelTab === 'column'" />
      <DataTransformPipeline v-else-if="dataPanelTab === 'transforms'" />
      <DataParseSettings v-else-if="dataPanelTab === 'parsing'" />
      <DataRecommendations v-else-if="dataPanelTab === 'reco'" />
      <template
        v-if="panelMode !== 'drawer'"
        #footer
      >
        <PanelStepperFooter />
      </template>
    </PanelShell>
    <DataSideIconRail
      v-if="!isNarrow"
      :disabled-tabs="sceneDisabledTabs"
    />
  </div>
</template>

<script setup lang="ts">
import { ButtonIcon, useBreakpoint } from '@blueprint-chart/ui'
import { useDataTable } from '@/stores/dataTable'
import { useEditorPanel, type DataPanelTab } from '@/stores/editorPanel'
import { usePanel } from '@/stores/panel'
import { useScenes } from '@/stores/scenes'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import { useDataSections } from '@/composables/useDataSections'
import { findDataSourceSceneIndex } from '@/utils/scenes'

const { columns, rows, columnTypes } = useDataTable()
const editorPanel = useEditorPanel()
const { dataPanelOpen, dataPanelTab } = storeToRefs(editorPanel)
const { openDataPanel, closeDataPanel, setDataView, setLastNarrowDataTab } = editorPanel
const { mode: panelMode } = usePanel()
const { activeScene, activeIndex, scenes } = useScenes()
const isSceneMode = computed(() => activeScene.value !== null)

watch(panelMode, (mode) => {
  if (mode === 'drawer' && dataPanelTab.value) {
    setLastNarrowDataTab(dataPanelTab.value as DataPanelTab)
    closeDataPanel()
  }
}, { immediate: true })

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

function onDrawerTabPick(tab: string) {
  setLastNarrowDataTab(tab as DataPanelTab)
  openDataPanel(tab as DataPanelTab)
}
const { isNarrow } = useBreakpoint()

const mainRef = useTemplateRef<HTMLElement>('mainRef')

const { sections: allTabs } = useDataSections()

const sceneDisabledTabs = computed(() => isSceneMode.value ? ['parsing'] : [])

const activeTabs = computed(() =>
  isSceneMode.value ? allTabs.filter(t => t.key !== 'parsing') : allTabs,
)

const drawerOpen = computed({
  get: () => !!dataPanelTab.value,
  set: (open) => {
    if (!open) {
      closeDataPanel()
    }
  },
})

const TAB_LABELS: Record<string, string> = {
  column: 'Column Settings',
  transforms: 'Transforms',
  parsing: 'Parsing',
  reco: 'Recommendations',
}

const panelTitle = computed(() => TAB_LABELS[dataPanelTab.value] ?? 'Panel')

const panelClassList = computed(() => ({
  'data-structure-panel--narrow': isNarrow.value,
}))
</script>

<style scoped lang="scss">
.data-structure-panel {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 8px;

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
    display: flex;
    flex-direction: column;

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

    &__timeline-slot {
      margin-top: auto;        // push to the bottom when content is short
      position: sticky;
      bottom: 0;
      z-index: 5;              // above the table, below panel overlays
      pointer-events: none;    // empty gaps pass clicks through to the canvas

      > * {
        pointer-events: auto;  // the teleported timeline stays interactive
      }
    }
  }

  &__drawer-body {
    padding: 0.5rem 0;
  }
}

</style>
