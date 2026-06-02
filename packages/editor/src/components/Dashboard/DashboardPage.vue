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
  selectedChart: gallerySelectedChart,
  thumbnails,
  previews,
  sortValue,
  refresh,
  duplicateChart,
  removeChart,
} = useDashboardGallery()

const { isSignedIn } = useAccount()
const showCloud = computed(() => accountsEnabled() && isSignedIn.value)

const { listCloud, pushCloud, deleteCloud, loadCloud } = useCloudCharts()
const { listSavedCharts, deleteChart } = useChartSession()
const cloudCharts = ref<CloudChartSummary[]>([])
const importing = ref(false)

const importer = useLocalImport({
  listLocal: () => listSavedCharts().map((c: SavedChartSummary) => ({ id: c.id, title: c.title, chartType: c.chartType })),
  pushCloud,
  deleteLocal: deleteChart,
})

// localStorage isn't reactive, so track the count explicitly and refresh it
// whenever it can change (mount, cloud-mode toggle, after an import).
const localCount = ref(0)
function refreshLocalCount() {
  localCount.value = showCloud.value ? importer.localCount() : 0
}

async function refreshCloud() {
  if (showCloud.value) {
    cloudCharts.value = await listCloud()
  }
}

async function onImportLocal() {
  importing.value = true
  await importer.importAll()
  await refreshCloud()
  refreshLocalCount()
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

/** Sort a summary list by the toolbar's sort value (mirrors useDashboardGallery). */
function sortSummaries(list: SavedChartSummary[], sort: string): SavedChartSummary[] {
  const out = [...list]
  if (sort === 'date-desc') {
    out.sort((a, b) => (b.savedAt ?? '').localeCompare(a.savedAt ?? ''))
  }
  else if (sort === 'date-asc') {
    out.sort((a, b) => (a.savedAt ?? '').localeCompare(b.savedAt ?? ''))
  }
  else if (sort === 'name-asc') {
    out.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }
  return out
}

// The list the gallery actually renders — cloud charts when signed in, else local.
const displayedCharts = computed<SavedChartSummary[]>(() =>
  showCloud.value ? sortSummaries(cloudAsSummaries.value, sortValue.value) : sortedCharts.value,
)

// Resolve the selected chart against whichever list is on screen.
const selectedChart = computed(() =>
  showCloud.value
    ? (cloudAsSummaries.value.find(c => c.id === selectedChartId.value) ?? null)
    : gallerySelectedChart.value,
)

watch(showCloud, () => {
  void refreshCloud()
  refreshLocalCount()
}, { immediate: true })

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

async function duplicateSelected() {
  const id = selectedChartId.value
  if (!id) {
    return
  }
  if (showCloud.value) {
    const record = await loadCloud(id)
    if (record) {
      const sel = cloudAsSummaries.value.find(c => c.id === id)
      const newId = await pushCloud({ dsl: record.dsl, meta: record.meta, title: sel?.title ?? '', chartType: sel?.chartType ?? '' })
      if (newId) {
        await refreshCloud()
      }
    }
    return
  }
  const newId = duplicateChart(id)
  if (newId) {
    router.push(`/edit/${newId}`)
  }
}

async function deleteSelected() {
  const id = selectedChartId.value
  if (!id) {
    return
  }
  if (showCloud.value) {
    await deleteCloud(id)
    await refreshCloud()
    selectedChartId.value = null
    return
  }
  removeChart(id)
}

function handleKeydown(e: globalThis.KeyboardEvent) {
  if (e.key === 'Escape') {
    selectedChartId.value = null
  }
}

onMounted(() => {
  refresh()
  refreshLocalCount()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="dashboard-page-wrapper d-flex flex-column flex-grow-1">
    <DashboardToolbar
      :chart-count="displayedCharts.length"
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
          :charts="displayedCharts"
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
