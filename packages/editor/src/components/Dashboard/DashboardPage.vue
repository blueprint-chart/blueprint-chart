<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBreakpoint } from '@blueprint-chart/ui'
import { usePanelStore } from '@/stores/panel'
import DashboardImportBanner from '@/components/Dashboard/DashboardImportBanner.vue'
import { accountsEnabled } from '@/config/runtimeConfig'
import { useAccount } from '@/stores/account'
import { useCloudCharts } from '@/stores/cloudCharts'
import { useLocalImport } from '@/composables/useLocalImport'
import { useDashboardCharts } from '@/composables/useDashboardCharts'

const router = useRouter()
const { isNarrow } = useBreakpoint()
const { selectedChartId, selectChart } = useDashboardPanel()
const { mode } = storeToRefs(usePanelStore())

const {
  sortedCharts,
  thumbnails,
  previews,
  sortValue,
  localOnlyCount,
  refresh,
  syncOne,
  remove,
  duplicate,
} = useDashboardCharts()

const { isSignedIn } = useAccount()
const showCloud = computed(() => accountsEnabled() && isSignedIn.value)

const cloud = useCloudCharts()
const importer = useLocalImport({
  listLocalOnly: () => sortedCharts.value
    .filter(c => c.syncState === 'local')
    .map(c => ({ id: c.id, title: c.title, chartType: c.chartType })),
  syncCloud: cloud.syncCloud,
  markCloudBacked: cloud.markCloudBacked,
})

const syncingAll = ref(false)

const selectedChart = computed(() =>
  sortedCharts.value.find(c => c.id === selectedChartId.value) ?? null,
)

async function onSyncAll() {
  syncingAll.value = true
  try {
    await importer.syncAll()
    await refresh()
  }
  finally {
    syncingAll.value = false
  }
}

function openChart(id: string) {
  router.push(`/edit/${id}`)
}

// Re-load when the signed-in/accounts state flips (sign in/out). Initial load
// happens in onMounted — an immediate watcher fires during setup, which is too
// early to reliably populate on a cold page load.
watch(showCloud, () => {
  void refresh()
})

const galleryRef = useTemplateRef<HTMLElement>('galleryRef')
const viewLayout = shallowRef<'grid' | 'row'>('grid')

const pageClass = computed(() => ({
  'dashboard-page': true,
  'dashboard-page--narrow': isNarrow.value,
}))

const panelTitle = computed(() =>
  selectedChart.value ? (selectedChart.value.title || 'Untitled') : 'Chart details',
)

function onClose() {
  selectedChartId.value = null
}

const drawerOpen = computed({
  get: () => selectedChartId.value !== null,
  set: (open) => {
    if (!open) {
      selectedChartId.value = null
    }
  },
})

function editSelected() {
  if (selectedChartId.value) {
    openChart(selectedChartId.value)
  }
}

async function duplicateSelected() {
  const id = selectedChartId.value
  if (!id) {
    return
  }
  const newId = await duplicate(id)
  if (newId) {
    openChart(newId)
  }
}

async function deleteSelected() {
  const id = selectedChartId.value
  if (!id) {
    return
  }
  await remove(id)
  selectedChartId.value = null
}

async function syncSelected() {
  if (selectedChartId.value) {
    await syncOne(selectedChartId.value)
  }
}

function handleKeydown(e: globalThis.KeyboardEvent) {
  if (e.key === 'Escape') {
    selectedChartId.value = null
  }
}

onMounted(() => {
  void refresh()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="dashboard-page-wrapper d-flex flex-column flex-grow-1">
    <DashboardToolbar
      :chart-count="sortedCharts.length"
      :sort-value="sortValue"
      :layout="viewLayout"
      @update:sort-value="sortValue = $event"
      @update:layout="viewLayout = $event"
      @new="router.push('/new')"
    />
    <div :class="pageClass">
      <div
        ref="galleryRef"
        class="dashboard-page__gallery"
      >
        <DashboardImportBanner
          v-if="showCloud"
          :count="localOnlyCount"
          :syncing="syncingAll"
          @sync="onSyncAll"
        />
        <DashboardGallery
          :charts="sortedCharts"
          :thumbnails="thumbnails"
          :selected-id="selectedChartId"
          :layout="viewLayout"
          @select="selectChart"
          @edit="openChart"
          @sync="syncOne"
          @open="openChart"
          @new="router.push('/new')"
        />
      </div>

      <PanelShell
        v-model:drawer-open="drawerOpen"
        :title="panelTitle"
        :container-ref="galleryRef"
        :show-close="false"
        @close="onClose"
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
          :sync-state="selectedChart.syncState"
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
          @sync="syncSelected"
        />
        <DashboardEmptyState
          v-else-if="mode === 'docked'"
        />
      </PanelShell>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-page-wrapper {
  // Cap the wrapper to the layout shell's bounded <main> so the gallery and
  // side panel scroll internally instead of growing the whole page. Without
  // min-height:0 a flex column child stretches to its content height.
  min-height: 0;
}

.dashboard-page {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--bc-content-bg);

  &--narrow {
    flex-direction: column;
  }

  &__gallery {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    padding: 1.75rem;
    background: transparent;
    position: relative;

    .dashboard-page--narrow & {
      padding: 1rem;
    }
  }
}

:deep(.layout-panel__header) {
  border-bottom: 1px solid var(--bc-hairline);
}
</style>
