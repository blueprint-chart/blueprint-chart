<template>
  <div
    class="data-structure-panel"
    :class="panelClassList"
  >
    <DataSideIconRail
      v-if="isNarrow"
      horizontal
    />
    <div
      ref="mainRef"
      class="data-structure-panel__main"
    >
      <div class="data-structure-panel__pills-bar">
        <DataColumnPills
          :columns="columns"
          :column-types="columnTypes"
          :selected="selectedColumnIndex"
          @select="selectColumn"
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
          :tabs="tabs"
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
      <DataSideIconRail />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { LayoutBottomDrawer, ButtonIcon, useBreakpoint } from '@blueprint-chart/ui'
import { useDataTable } from '@/composables/useDataTable'
import { useEditorPanel, type DataPanelTab } from '@/composables/useEditorPanel'
import IPhArrowsClockwise from '~icons/ph/arrows-clockwise'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import DataColumnPills from './DataColumnPills.vue'
import DataCheckTable from './DataCheckTable.vue'
import DataSideIconRail from './DataSideIconRail.vue'
import DataSidePanel from './DataSidePanel.vue'
import DataFloatingPanel from './DataFloatingPanel.vue'
import DataColumnSettings from './DataColumnSettings.vue'
import DataTransformPipeline from './DataTransformPipeline.vue'
import DataParseSettings from './DataParseSettings.vue'
import DataRecommendations from './DataRecommendations.vue'

const { columns, columnTypes } = useDataTable()
const { selectedColumnIndex, selectColumn, panelMode, dataPanelMode, dataPanelTab, openDataPanel, collapse, setDataView } = useEditorPanel()

function replaceData() {
  setDataView('upload')
}
const { isNarrow } = useBreakpoint()

const mainRef = ref<HTMLElement | null>(null)

const tabs = [
  { key: 'column' as DataPanelTab, label: 'Columns' },
  { key: 'transforms' as DataPanelTab, label: 'Transforms' },
  { key: 'parsing' as DataPanelTab, label: 'Parsing' },
  { key: 'reco' as DataPanelTab, label: 'Recommendations' },
]

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

  &--narrow {
    flex-direction: column;
  }
}

.data-structure-panel__main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 1.25rem;
  position: relative;
}

.data-structure-panel__pills-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;

  .data-column-pills {
    flex: 1;
  }
}

.data-structure-panel__drawer-body {
  padding: 0.5rem 0;
}

:deep(.navigation-icon-rail),
:deep(.layout-panel) {
  background: var(--bs-body-bg);
}
</style>
