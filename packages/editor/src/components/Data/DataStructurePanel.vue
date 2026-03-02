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
      <DataColumnPills
        :columns="columns"
        :column-types="columnTypes"
        :selected="selectedColumnIndex"
        class="mb-3"
        @select="selectColumn"
      />
      <DataCheckTable />
      <DataFloatingPanel
        v-if="dataPanelMode === 'floating'"
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
      <DataSidePanel :collapsed="dataPanelMode !== 'docked'" />
      <DataSideIconRail />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { LayoutBottomDrawer, useBreakpoint } from '@blueprint-chart/ui'
import { useDataTable } from '@/composables/useDataTable'
import { useEditorPanel, type DataPanelTab } from '@/composables/useEditorPanel'
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
const { selectedColumnIndex, selectColumn, dataPanelMode, dataPanelTab, dataPanelOpen, openDataPanel, collapseDataPanel } = useEditorPanel()
const { isNarrow } = useBreakpoint()

const mainRef = ref<HTMLElement | null>(null)

const tabs = [
  { key: 'column' as DataPanelTab, label: 'Columns' },
  { key: 'transforms' as DataPanelTab, label: 'Transforms' },
  { key: 'parsing' as DataPanelTab, label: 'Parsing' },
  { key: 'reco' as DataPanelTab, label: 'Recommendations' },
]

const drawerOpen = computed({
  get: () => isNarrow.value && dataPanelOpen.value && !!dataPanelTab.value,
  set: (open) => {
    if (!open) {
      collapseDataPanel()
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

.data-structure-panel__drawer-body {
  padding: 0.5rem 0;
}

:deep(.navigation-icon-rail),
:deep(.layout-panel) {
  background: var(--bs-body-bg);
}
</style>
