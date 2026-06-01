<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useBreakpoint } from '@blueprint-chart/ui'
import { usePanelStore } from '@/stores/panel'
import DashboardImportBanner from '@/components/Dashboard/DashboardImportBanner.vue'
import { accountsEnabled } from '@/config/runtimeConfig'
import { useAccount } from '@/stores/account'
import { useCloudCharts, type CloudChartSummary } from '@/stores/cloudCharts'
import { useLocalImport } from '@/composables/useLocalImport'
import { useChartSession, type SavedChartSummary } from '@/stores/chartSession'

const router = useRouter()
const { isNarrow } = useBreakpoint()
const {
  selectedChartId,
  selectChart,
} = useDashboardPanel()
const { mode } = storeToRefs(usePanelStore())
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

const { isSignedIn } = useAccount()
const showCloud = computed(() => accountsEnabled() && isSignedIn.value)

const { listCloud, pushCloud } = useCloudCharts()
const { listSavedCharts } = useChartSession()
const cloudCharts = ref<CloudChartSummary[]>([])
const importing = ref(false)

const importer = useLocalImport({
  listLocal: () => listSavedCharts().map((c: SavedChartSummary) => ({ id: c.id, title: c.title, chartType: c.chartType })),
  pushCloud,
})
const localCount = computed(() => (showCloud.value ? importer.localCount() : 0))

async function refreshCloud() {
  if (showCloud.value) {
    cloudCharts.value = await listCloud()
  }
}

async function onImportLocal() {
  importing.value = true
  await importer.importAll()
  await refreshCloud()
  importing.value = false
}

const cloudAsSummaries = computed<SavedChartSummary[]>(() =>
  cloudCharts.value.map(c => ({
    id: c.id,
    title: c.title,
    description: '',
    chartType: c.chartType,
    savedAt: c.updatedAt,
    sceneCount: 0,
    rowCount: 0,
    allowDarkMode: true,
    sheetNumber: null,
    sheetId: '',
  })),
)

watch(showCloud, refreshCloud, { immediate: true })

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
          :count="localCount"
          :importing="importing"
          @import="onImportLocal"
        />
        <DashboardGallery
          :charts="showCloud ? cloudAsSummaries : sortedCharts"
          :thumbnails="thumbnails"
          :selected-id="selectedChartId"
          :layout="viewLayout"
          @select="selectChart"
          @edit="(id: string) => router.push(`/edit/${id}`)"
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
          @edit="editSelected"
          @duplicate="duplicateSelected"
          @delete="deleteSelected"
        />
        <DashboardEmptyState
          v-else-if="mode === 'docked'"
        />
      </PanelShell>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: var(--bc-content-bg);

  &--narrow {
    flex-direction: column;
  }

  &__gallery {
    flex: 1;
    min-width: 0;
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
